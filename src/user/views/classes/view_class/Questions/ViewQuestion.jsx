import { useCallback, useEffect, useState } from "react";
import { Box, Grid, MenuItem, TextField } from "@mui/material";
import { useLocation } from "react-router-dom";
import axios from "axios";
import CustomSnackbar from "../../../../../utilities/SnackBar";
import ModalDialog from "../../../../../utilities/ModalDialog";
import Swal from "sweetalert2";

export default function ViewQuestion() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState()

  const location = useLocation();
  const assigned_class = location.state?.assigned_class;
  const exam = location.state?.exam;

  const [questionSets, setQuestionSets] = useState('')
  const [marksTaken, setMarksTaken] = useState(0)

  const setOptions = { sl: 1, question_type: 'With subquestions', questions: [{ blooms_level: 'Remember', marks: '' }] }
  const [inputQuestionSets, setInputQuestionSets] = useState([]);
  const [editableQuestion, setEditableQuestion] = useState({})

  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false)

  // handle, add & remove question sets
  const handleAddQuestionSet = () => {
    // setQuestionSets([...inputQuestionSets, setOptions]);
    const updatedQuestions = [...inputQuestionSets];
    updatedQuestions.push({ ...setOptions, sl: inputQuestionSets.length + questionSets.length + 1 })
    setInputQuestionSets(updatedQuestions);
  };
  const handleRemoveQuestionSets = (index) => {
    const updatedQuestions = [...inputQuestionSets];
    updatedQuestions.splice(index, 1);
    setInputQuestionSets(updatedQuestions);
  };
  const handleQstnSetChange = (questionSetIndex, field, value) => {
    const updatedQuestions = [...inputQuestionSets];
    updatedQuestions[questionSetIndex][field] = value;
    setInputQuestionSets(updatedQuestions);
  };

  // handle questions input
  const handleAddQuestion = (questionSetIndex) => {
    const updatedQuestions = [...inputQuestionSets];
    updatedQuestions[questionSetIndex].questions.push({ blooms_level: 'Remember', marks: '' });
    setInputQuestionSets(updatedQuestions);
  };
  const handleRemoveQuestion = (questionSetIndex, questionIndex) => {
    const updatedQuestions = [...inputQuestionSets];
    updatedQuestions[questionSetIndex].questions.splice(questionIndex, 1);
    setInputQuestionSets(updatedQuestions);
  };
  const handleInputChange = (questionSetIndex, questionIndex, field, value) => {
    const updatedQuestions = [...inputQuestionSets];
    updatedQuestions[questionSetIndex].questions[questionIndex][field] = value;
    setInputQuestionSets(updatedQuestions);
  };

  // handle question edit
  const handleAddEditQuestion = () => {
    const updatedQuestions = [...editableQuestion.questions];
    updatedQuestions.push({ blooms_level: 'Remember', marks: '' });
    setEditableQuestion({ ...editableQuestion, questions: updatedQuestions });
  }
  const handleRemoveEditQuestion = (index) => {
    const updatedQuestions = [...editableQuestion.questions];
    updatedQuestions.splice(index, 1);
    setEditableQuestion({ ...editableQuestion, questions: updatedQuestions });
  }
  const handleEditQuestionChange = (index, field, value) => {
    const updatedQuestions = [...editableQuestion.questions];
    updatedQuestions[index][field] = value;
    setEditableQuestion({ ...editableQuestion, questions: updatedQuestions });
  }

  // console.log(editableQuestion);

  // get question
  const getQuestion = useCallback(() => {
    setLoading(true)
    axios.get(`/api/${role}/exam-questions/${exam.id}`).then(res => {
      if (res.status === 200) {
        setQuestionSets(res.data.questions)

        res.data.questions.length > 0 &&
          setMarksTaken(res.data.questions.map(questionSet => questionSet.questions.map(question => question.marks)).flat().reduce((a, b) => a + b, 0))
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
      setLoading(false)
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
      setLoading(false)
    })
  }, [exam.id, role])

  // update question
  const updateQuestion = () => {
    setLoading(true)
    axios.put(`/api/user/exam-questions/${editableQuestion.id}`, editableQuestion).then(res => {
      if (res.status === 200) {
        getQuestion()
        setSuccess(res.data.message)
        setTimeout(() => { setSuccess('') }, 5000)
        setShowEditQuestionModal(false)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
      setLoading(false)
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
      setLoading(false)
    })
  }

  // delete question set
  const deleteQuestionSet = (id) => {
    Swal.fire({
      title: 'Are you sure to delete?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1976D2',
      cancelButtonColor: '#707070',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true)
        axios.delete(`/api/user/exam-questions/${id}`).then(res => {
          if (res.status === 200) {
            setSuccess(res.data.message)
            setTimeout(() => { setSuccess('') }, 5000)
            getQuestion()
          } else {
            setError(res.data.message)
            setTimeout(() => { setError('') }, 5000)
          }
          setLoading(false)
        }).catch(err => {
          setError(err.response.data.message)
          setTimeout(() => { setError('') }, 5000)
          setLoading(false)
        })
      }
    })
  }

  // add questions
  const addQuestions = () => {
    setLoading(true)
    axios.post(`/api/user/exam-questions/${exam.id}`, inputQuestionSets).then(res => {
      if (res.status === 200) {
        getQuestion()
        setSuccess(res.data.message)
        setTimeout(() => { setSuccess('') }, 5000)
        setInputQuestionSets([])
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
      setLoading(false)
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
      setLoading(false)
    })
  }


  useEffect(() => {
    localStorage.getItem('role') ?
      setRole(localStorage.getItem('role'))
      : setRole(sessionStorage.getItem('role'))

    role && getQuestion()
  }, [getQuestion, role])



  return (
    <Box className="container d-flex justify-content-center">
      <Box className='card my-2 col-lg-8'>

        {/* Heading section */}
        <Box className='card-header pb-0 d-flex justify-content-between align-items-end' sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box className='d-flex'>
            <button onClick={() => window.history.back()} className='btn btn-light btn-floating me-3 mt-2'>
              <i className='fas fa-arrow-left fa-lg'></i></button>
            <Box className='my-2'>
              <h5 className='card-title mb-1'>{`${assigned_class.semester?.name} ${exam.exam_type} Exam`}</h5>
              <small className='text-muted'>{` ${assigned_class.section?.batch.department.name} - ${assigned_class.section?.batch.batch_name} (${assigned_class.section?.section_name})`}</small> <br />
              <small className='text-muted my-1'>{`${assigned_class.course?.course_code} :: ${assigned_class.course?.title}`}</small>
            </Box>
          </Box>
          <p className="text-muted">Full marks: {exam.total_marks}</p>
        </Box>


        {loading ? <div className="text-center"><span className='spinner-border my-5'></span></div> :
          <Box className="card-body">

            {/* calculate total marks questions.questions.marks */}
            <p className="text-muted text-end">
              <i className={`bi ${marksTaken >= exam.total_marks ? 'bi-check-circle text-success' : 'bi-exclamation-triangle text-warning'} me-2`}></i>
              Created questions for: <b>{marksTaken}</b> marks</p>

            {/* view all questions */}
            {questionSets.length === 0 ? <div className="text-center my-5">No questions added yet</div> :
              questionSets.map((questionSet, questionSetIndex) => (
                <div className='card card-body pt-3 mt-3 shadow-sm border border-light-grey' key={questionSetIndex}>

                  {/* type and actions */}
                  <div className="d-flex justify-content-between align-items-end mb-3">
                    {/* sl and type */}
                    <h5 className="mb-0">{`${questionSet.sl}. ${questionSet.question_type}`}</h5>

                    {/* Action buttons */}
                    {role === 'user' &&
                      <div className="d-flex">
                        <button className="btn btn-outline-secondary btn-sm btn-floating me-2"
                          onClick={() => { setEditableQuestion(questionSet); setShowEditQuestionModal(true) }}>
                          <i className="fas fa-edit"></i></button>

                        <button className="btn btn-outline-secondary btn-sm btn-floating"
                          onClick={() => deleteQuestionSet(questionSet.id)}>
                          <i className="fas fa-trash-alt"></i></button>
                      </div>}
                  </div>

                  {/* all questions */}
                  {questionSet.questions.map((question, questionIndex) => (
                    <div className='d-flex justify-content-between border-bottom border-light-grey mx-3' key={questionIndex}>
                      <h6 className="my-2">{`(${String.fromCharCode(questionIndex + 97)}) ${question.blooms_level}`}</h6>
                      <p className="my-2 text-muted">Marks: {question.marks}</p>
                    </div>
                  ))}
                </div>
              ))}



            {/* Input questions */}
            {inputQuestionSets.map((questionSet, questionSetIndex) => (
              <div className='card card-body pt-3 mt-3 shadow-sm border border-light-grey' key={questionSetIndex}>
                <div className='d-flex align-items-center'>

                  <h5 className="mt-3 me-3">
                    <span contentEditable
                      onInput={(e) => handleQstnSetChange(questionSetIndex, 'sl', e.target.innerText)}
                      dangerouslySetInnerHTML={{ __html: questionSet.sl }} />.
                  </h5>

                  {/* Question type */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <TextField label='Question type' select required fullWidth value={questionSet.question_type}
                      onChange={(e) => handleQstnSetChange(questionSetIndex, 'question_type', e.target.value)} margin='normal' size='small'>
                      <MenuItem value={'With subquestions'}>With subquestions</MenuItem>
                      <MenuItem value={'One question only'} disabled={questionSet.questions.length > 1 ? true : false}>One question only</MenuItem>
                      <MenuItem value={'Short answer'}>Short answer</MenuItem>
                      <MenuItem value={'True / False'}>True / False</MenuItem>
                      <MenuItem value={'MCQ'}>MCQ</MenuItem>
                      <MenuItem value={'Fill in the blanks'}>Fill in the blanks</MenuItem>
                      <MenuItem value={'Matching'}>Matching</MenuItem>
                    </TextField>
                  </div>

                  {/* action buttons */}
                  <div className="ms-auto d-flex ">
                    {/* add 3 question fields and set all marks as 1 button */}
                    {questionSet.question_type !== 'One question only' &&
                      <div>
                        <button className="btn btn-outline-secondary btn-rounded btn-sm me-2"
                          onClick={() => { for (let i = 0; i < 3; i++) { handleAddQuestion(questionSetIndex); } }}>
                          Add 3 question fields</button>

                        <button className="btn btn-outline-secondary btn-rounded btn-sm me-2"
                          onClick={() => {
                            const updatedQuestions = [...inputQuestionSets];
                            updatedQuestions[questionSetIndex].questions.forEach(question => {
                              question.marks = 1;
                              setInputQuestionSets(updatedQuestions);
                            })
                          }}>
                          Set all marks as 1</button>
                      </div>
                    }

                    {/* delete question index button */}
                    <button type='button' onClick={() => handleRemoveQuestionSets(questionSetIndex)}
                      className='btn btn-light btn-floating btn-sm bg-light'>
                      <i className='fas fa-trash-alt text-danger'></i>
                    </button>
                  </div>
                </div>


                {questionSet.question_type !== 'One question only' && <h6 className='mt-3 mb-1'>Questions:</h6>}

                {questionSet.questions.map((question, questionIndex) => (
                  <Grid container spacing={2} className={`my-0 ${questionSet.question_type === 'One question only' && 'ms-3'}`}>

                    {questionSet.question_type !== 'One question only' &&
                      <Grid item xs={1}>
                        <h6 className='my-2 text-end'>({String.fromCharCode(questionIndex + 97)})</h6>
                      </Grid>
                    }

                    {/* Select blooms level */}
                    <Grid item xs={6}>
                      <TextField label='Blooms level' select required fullWidth value={question.blooms_level}
                        onChange={(e) => handleInputChange(questionSetIndex, questionIndex, 'blooms_level', e.target.value)} margin='small' size='small'>
                        <MenuItem value={'Remember'}>Remember</MenuItem>
                        <MenuItem value={'Understand'}>Understand</MenuItem>
                        <MenuItem value={'Apply'}>Apply</MenuItem>
                        <MenuItem value={'Analyze'}>Analyze</MenuItem>
                        <MenuItem value={'Evaluate'}>Evaluate</MenuItem>
                        <MenuItem value={'Create'}>Create</MenuItem>
                      </TextField>
                    </Grid>

                    {/* marks */}
                    <Grid item xs={4}>
                      <TextField label='Marks' type="number" required fullWidth value={question.marks}
                        onChange={(e) => handleInputChange(questionSetIndex, questionIndex, 'marks', e.target.value)} margin='small' size='small' />
                    </Grid>

                    {/* remove question */}
                    {questionSet.question_type !== 'One question only' &&
                      <Grid item xs={1}>
                        <button type='button' className='btn btn-light btn-floating btn-sm my-1'
                          onClick={() => handleRemoveQuestion(questionSetIndex, questionIndex)}>
                          <i className='fas fa-close'></i>
                        </button>
                      </Grid>
                    }
                  </Grid>
                ))}

                {/* Add question button */}
                {questionSet.question_type !== 'One question only' &&
                  <div className='row align-items-md-center mt-3'>
                    <div className='col'>
                      <button type='button' onClick={() => handleAddQuestion(questionSetIndex)}
                        className='btn btn-rounded btn-sm bg-light'>
                        <i className='fas fa-plus'></i> Add Question
                      </button>
                    </div>
                  </div>
                }

              </div>
            ))}


            {/* Add Question Set button */}
            {role === 'user' &&
              <div className='text-center'>
                <button type='button' onClick={handleAddQuestionSet} className='btn btn-secondary shadow add-btn'>
                  <i className='fa fa-plus me-1'></i> Add Question Set
                </button>
              </div>}


            {/* submit and reset button */}
            {inputQuestionSets.length > 0 &&
              <div className='d-flex justify-content-between my-4'>
                <button onClick={() => setInputQuestionSets([setOptions])}
                  className="btn btn-secondary shadow-sm me-2">Clear</button>

                <button onClick={() => addQuestions()} className="btn btn-primary">
                  {loading ? <span className="spinner-border spinner-border-sm"></span> :
                    'Add questions'}
                </button>
              </div>
            }
          </Box>
        }
      </Box>



      {/* edit question modal */}
      <ModalDialog
        title={'Edit Question'}
        content={
          editableQuestion.id ?
            <Box>
              <div className='d-flex align-items-center'>
                <h5 className="mt-3 me-2">
                  <span contentEditable
                    onInput={(e) => setEditableQuestion({ ...editableQuestion, sl: e.target.innerText })}
                    dangerouslySetInnerHTML={{ __html: editableQuestion.sl }} />.
                </h5>
                {/* <div className="col-12 col-md-6 col-lg-3"> */}
                <TextField label='Question type' select required fullWidth value={editableQuestion.question_type}
                  onChange={(e) => setEditableQuestion({ ...editableQuestion, question_type: e.target.value })} margin='normal' size='small'>
                  <MenuItem value={'With subquestions'}>With subquestions</MenuItem>
                  <MenuItem value={'One question only'} disabled={editableQuestion.questions.length > 1 ? true : false}>One question only</MenuItem>
                  <MenuItem value={'Short answer'}>Short answer</MenuItem>
                  <MenuItem value={'True / False'}>True / False</MenuItem>
                  <MenuItem value={'MCQ'}>MCQ</MenuItem>
                  <MenuItem value={'Fill in the blanks'}>Fill in the blanks</MenuItem>
                  <MenuItem value={'Matching'}>Matching</MenuItem>
                </TextField>
                {/* </div> */}
              </div>

              {editableQuestion.questions.map((question, index) => (
                <Grid container spacing={2} className={`my-0 ${editableQuestion.question_type === 'One question only' && 'ms-2'}`}>

                  {editableQuestion.question_type !== 'One question only' &&
                    <Grid item xs={1}>
                      <h6 className='my-2 text-end'>({String.fromCharCode(index + 97)})</h6>
                    </Grid>
                  }

                  {/* Select blooms level */}
                  <Grid item xs={6}>
                    <TextField label='Blooms level' select required fullWidth value={question.blooms_level}
                      onChange={(e) => handleEditQuestionChange(index, 'blooms_level', e.target.value)} margin='small' size='small'>
                      <MenuItem value={'Remember'}>Remember</MenuItem>
                      <MenuItem value={'Understand'}>Understand</MenuItem>
                      <MenuItem value={'Apply'}>Apply</MenuItem>
                      <MenuItem value={'Analyze'}>Analyze</MenuItem>
                      <MenuItem value={'Evaluate'}>Evaluate</MenuItem>
                      <MenuItem value={'Create'}>Create</MenuItem>
                    </TextField>
                  </Grid>

                  {/* marks */}
                  <Grid item xs={4}>
                    <TextField label='Marks' type="number" required fullWidth value={question.marks}
                      onChange={(e) => handleEditQuestionChange(index, 'marks', e.target.value)} margin='small' size='small' />
                  </Grid>

                  {/* remove question */}
                  {editableQuestion.question_type !== 'One question only' &&
                    <Grid item xs={1}>
                      <button type='button' className='btn btn-light btn-floating btn-sm my-1'
                        onClick={() => handleRemoveEditQuestion(index)}>
                        <i className='fas fa-close'></i>
                      </button>
                    </Grid>
                  }
                </Grid>
              ))}

              {/* Add question button */}
              {editableQuestion.question_type !== 'One question only' &&
                <div className='row align-items-md-center mt-3'>
                  <div className='col'>
                    <button type='button' onClick={() => handleAddEditQuestion()}
                      className='btn btn-rounded btn-sm bg-light'>
                      <i className='fas fa-plus'></i> Add Question
                    </button>
                  </div>
                </div>
              }

            </Box>
            : ''
        }
        onOpen={showEditQuestionModal}
        onClose={() => { getQuestion(); setShowEditQuestionModal(false) }}
        onConfirm={updateQuestion}
        confirmText={'Save Changes'}
        loading={loading}
      />


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </Box>
  )
}
