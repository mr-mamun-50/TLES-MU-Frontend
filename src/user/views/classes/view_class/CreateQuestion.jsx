import { Box, Grid, MenuItem, TextField } from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomSnackbar from "../../../../utilities/SnackBar";
import axios from "axios";

export default function CreateQuestion() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  let navigate = useNavigate();
  const location = useLocation();
  const course = location.state?.course;
  const exam = location.state?.exam;

  const setOptions = { sl: 1, question_type: 'With subquestions', questions: [{ blooms_level: 'Remember', marks: '' }] }
  const [inputQuestionSets, setInputQuestionSets] = useState([setOptions]);


  // handle, add & remove question sets
  const handleAddQuestionSet = () => {
    // setQuestionSets([...inputQuestionSets, setOptions]);
    const updatedQuestions = [...inputQuestionSets];
    updatedQuestions.push({ ...setOptions, sl: inputQuestionSets.length + 1 })
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

  // handle questions
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


  // console.log(inputQuestionSets);

  // add questions
  const addQuestions = () => {
    setLoading(true)
    axios.post(`/api/user/exam-questions/${exam.id}`, inputQuestionSets).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        setTimeout(() => { setSuccess('') }, 5000)
        navigate(`/classes/question/${exam.id}`, { state: { course: course, exam: exam } })
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



  return (
    <Box className="container d-flex justify-content-center">
      <Box className='card my-2 col-lg-8'>

        {/* Heading section */}
        <Box className='card-header pb-0 d-flex justify-content-between align-items-end' sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box className='d-flex'>
            <button onClick={() => window.history.back()} className='btn btn-light btn-floating me-3 mt-2'>
              <i className='fas fa-arrow-left fa-lg'></i></button>
            <Box className='my-2'>
              <h5 className='card-title mb-1'>{`${course.semester?.name} ${exam.exam_type} Exam`}</h5>
              <small className='text-muted'>{` ${course.section?.batch.department.name} - ${course.section?.batch.batch_name} (${course.section?.section_name})`}</small> <br />
              <small className='text-muted my-1'>{`${course.course?.course_code} :: ${course.course?.title}`}</small>
            </Box>
          </Box>
          <p className="ms-auto text-muted">Full marks: {exam.total_marks}</p>
        </Box>


        <Box className="card-body">

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
                  {inputQuestionSets.length > 1 &&
                    <button type='button' onClick={() => handleRemoveQuestionSets(questionSetIndex)}
                      className='btn btn-light btn-floating btn-sm bg-light'>
                      <i className='fas fa-trash-alt text-danger'></i>
                    </button>
                  }
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
          <div className='text-center'>
            <button type='button' onClick={handleAddQuestionSet} className='btn btn-secondary shadow add-btn'>
              <i className='fa fa-plus me-1'></i> Add Question Set
            </button>
          </div>


          {/* submit and reset button */}
          <div className='d-flex justify-content-between my-4'>
            <button onClick={() => setInputQuestionSets([setOptions])}
              className="btn btn-secondary shadow-sm me-2">Clear</button>

            <button onClick={() => addQuestions()} className="btn btn-primary">
              {loading ? <span className="spinner-border spinner-border-sm"></span> :
                'Add questions'}
            </button>
          </div>

        </Box>
      </Box>


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </Box>
  )
}
