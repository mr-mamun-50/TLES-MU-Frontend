import { useCallback, useEffect, useState } from "react";
import { Box, Grid, MenuItem, TextField } from "@mui/material";
import ModalDialog from "../../../../utilities/ModalDialog";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CustomSnackbar from "../../../../utilities/SnackBar";
import Swal from "sweetalert2";

export default function Exams({ course }) {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const classId = useParams().id

  const [exams, setExams] = useState([])
  const marksTaken = exams.reduce((acc, exam) => acc + exam.total_marks, 0)
  const [inputExam, setInputExam] = useState({ class_id: classId, exam_type: 'Midterm', total_marks: 20, other_marks: 10, exam_date: convertDate(new Date()) })
  const [editableExam, setEditableExam] = useState({})

  const [openAddExamModal, setOpenAddExamModal] = useState(false)
  const [openEditExamModal, setOpenEditExamModal] = useState(false)
  const navigate = useNavigate();

  // console.log(exams)

  // crete exam
  const createExam = () => {
    setLoading(true)
    axios.post('/api/user/exams', inputExam).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        setTimeout(() => { setSuccess('') }, 5000)
        const exam = res.data.exam
        if (exam.exam_type === 'Final' || exam.exam_type === 'Midterm') {
          navigate(`/classes/create-question/${exam.id}`, { state: { course: course, exam: exam } })
        } else {
          getExams()
          setOpenAddExamModal(false)
        }
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

  // update exam
  const updateExam = () => {
    setLoading(true)
    axios.put(`/api/user/exams/${editableExam.id}`, editableExam).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        setTimeout(() => { setSuccess('') }, 5000)
        getExams()
        setOpenEditExamModal(false)
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

  // get exams
  const getExams = useCallback(() => {
    setLoading(true)
    axios.get(`/api/user/exams/${classId}`).then(res => {
      if (res.status === 200) {
        setExams(res.data.exams)
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
  }, [classId])

  // delete assigned course
  const deleteExam = (id) => {
    Swal.fire({
      title: 'Are you sure to delete?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1976D2',
      cancelButtonColor: '#707070',
      confirmButtonText: 'Yes, delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`/api/user/exams/${id}`).then(res => {
          if (res.status === 200) {
            setSuccess(res.data.message)
            getExams()
            setTimeout(() => { setSuccess('') }, 5000)
          } else {
            setError(res.data.message)
            setTimeout(() => { setError('') }, 5000)
          }
        }).catch(err => {
          setError(err.response.data.message)
          setTimeout(() => { setError('') }, 5000)
        });
      }
    })
  }


  useEffect(() => {
    getExams()
  }, [getExams])


  // icon selector function
  const iconSelector = (examType) => {
    if (examType === 'Final') {
      return 'fas fa-trophy'
    } else if (examType === 'Midterm') {
      return 'fas fa-clipboard-list'
    } else if (examType === 'Class Test') {
      return 'fas fa-book'
    } else if (examType === 'Presentation') {
      return 'fas fa-person-chalkboard'
    } else if (examType === 'Viva') {
      return 'fas fa-people-arrows'
    }
  }


  return (
    <Box className='px-2 pt-1'>
      <Box className="d-flex justify-content-between align-items-center mb-4">
        <p className="text-muted my-0">
          <i className={`fas fa-circle-check me-2 ${marksTaken === 90 ? 'text-success' : marksTaken > 90 ? 'text-danger' : ''}`}></i>
          Exams taken: <b>{marksTaken}</b> marks
        </p>

        <button onClick={() => setOpenAddExamModal(true)} className="btn btn-primary">
          <i className="fas fa-plus me-2"></i> New Exam</button>
      </Box>


      {/* exams list */}
      {exams.length > 0 ? exams.map(exam => (
        <Box className="mb-4">
          <Box key={exam.id} className="card shadow-sm exam-card" sx={{ border: 1, borderColor: 'divider' }}>
            <Box className="card-body d-flex justify-content-between">
              {/* Basic info and actions */}
              <Box className="d-flex">
                {/* leading icon */}
                <Box className="rounded-circle bg-secondary d-flex justify-content-center align-items-center me-3" sx={{ width: '50px', height: '50px' }}>
                  <i className={`${iconSelector(exam.exam_type)} fa-xl text-light`}></i>
                </Box>

                {/* informations and actions */}
                <Box className="">
                  <h5 className="card-title mb-1">{exam.exam_type}</h5>
                  <small className="text-muted">
                    Total: <b>{exam.total_marks}</b> marks
                    {(exam.exam_type === 'Final' || exam.exam_type === 'Midterm') && <> • Created questions for: <b>{exam.added_marks}</b> marks</>}
                  </small>

                  {/* Action buttons */}
                  <Box className="d-flex align-items-center mt-2">
                    {(exam.exam_type === 'Final' || exam.exam_type === 'Midterm') &&
                      <Link to={`/classes/question/${exam.id}`} state={{ course: course, exam: exam }} className="btn btn-secondary btn-sm me-2">
                        <i className="fas fa-file-pen me-2"></i> View / Edit</Link>}

                    <Link to={`/classes/manual-marks-entry/${exam.id}`} state={{ course: course, exam: exam, question_sets: exam.exam_question_sets }}
                      className="btn btn-secondary btn-sm"><i className="fas fa-edit me-2"></i> Enter / Edit Marks</Link>
                  </Box>
                </Box>
              </Box>

              {/* Status and date */}
              <Box className="">
                <small className="text-muted">
                  {new Date(exam.exam_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', })}
                </small>

                <Box className="d-flex justify-content-end mt-4">
                  <button className="btn btn-outline-secondary btn-sm btn-floating me-2"
                    onClick={() => {
                      if (exam.total_marks !== 20 && exam.total_marks !== 30 && exam.total_marks !== 40) {
                        let newExam = { ...exam }
                        newExam.other_marks = exam.total_marks
                        newExam.total_marks = 'other'
                        setEditableExam(newExam)
                      } else {
                        setEditableExam(exam);
                      }
                      setOpenEditExamModal(true)
                    }}><i className="fas fa-edit"></i></button>

                  <button className="btn btn-outline-secondary btn-sm btn-floating"
                    onClick={() => deleteExam(exam.id)}><i className="fas fa-trash-alt"></i></button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )) : loading ? <div className="text-center"><span className='spinner-border my-4'></span></div>
        : <div className="text-center my-5">No Exams Found</div>
      }


      {/* add exam modal */}
      <ModalDialog
        title={'Create Exam'}
        content={
          <Box sx={{ width: '350px' }}>
            <TextField label='Exam Type' select fullWidth value={inputExam.exam_type}
              onChange={(e) => {
                if (e.target.value === 'Final')
                  setInputExam({ ...inputExam, exam_type: e.target.value, total_marks: 40 });
                else if (e.target.value === 'Midterm')
                  setInputExam({ ...inputExam, exam_type: e.target.value, total_marks: 20 });
                else if (e.target.value === 'Class Test' || e.target.value === 'Viva' || e.target.value === 'Presentation')
                  setInputExam({ ...inputExam, exam_type: e.target.value, total_marks: 'other' });
                else
                  setInputExam({ ...inputExam, exam_type: e.target.value });
              }} margin='normal' size='small'>

              <MenuItem value={'Midterm'}>Midterm</MenuItem>
              <MenuItem value={'Final'}>Final</MenuItem>
              <MenuItem value={'Class Test'}>Class Test</MenuItem>
              <MenuItem value={'Viva'}>Viva</MenuItem>
              <MenuItem value={'Presentation'}>Presentation</MenuItem>
            </TextField>

            <Grid container spacing={2}>
              <Grid item xs={inputExam.total_marks === 'other' ? 6 : 12}>
                <TextField label='Total Marks' select fullWidth value={inputExam.total_marks}
                  onChange={(e) => setInputExam({ ...inputExam, total_marks: e.target.value })} margin='normal' size='small'>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={40}>40</MenuItem>
                  <MenuItem value={'other'}>Other</MenuItem>
                </TextField>
              </Grid>

              {inputExam.total_marks === 'other' &&
                <Grid item xs={6}>
                  <TextField label='Other Marks' type="number" fullWidth value={inputExam.other_marks}
                    onChange={(e) => setInputExam({ ...inputExam, other_marks: e.target.value })} margin='normal' size='small' />
                </Grid>
              }
            </Grid>

            <TextField label='Exam Date' type="date" fullWidth value={inputExam.exam_date}
              onChange={(e) => setInputExam({ ...inputExam, exam_date: e.target.value })} margin='normal' size='small' />
          </Box>
        }
        onOpen={openAddExamModal}
        onClose={() => setOpenAddExamModal(false)}
        onConfirm={createExam}
        confirmText={'Save'}
        loading={loading}
      />

      {/* edit exam modal */}
      <ModalDialog
        title={'Edit Exam'}
        content={
          <Box sx={{ width: '350px' }}>
            <TextField label='Exam Type' select fullWidth value={editableExam.exam_type}
              onChange={(e) => {
                if (e.target.value === 'Final')
                  setEditableExam({ ...editableExam, exam_type: e.target.value, total_marks: 40 });
                else if (e.target.value === 'Midterm')
                  setEditableExam({ ...editableExam, exam_type: e.target.value, total_marks: 20 });
                else if (e.target.value === 'Class Test' || e.target.value === 'Viva' || e.target.value === 'Presentation')
                  setEditableExam({ ...editableExam, exam_type: e.target.value, total_marks: 'other' });
                else
                  setEditableExam({ ...editableExam, exam_type: e.target.value });
              }} margin='normal' size='small'>
              <MenuItem value={'Midterm'}>Midterm</MenuItem>
              <MenuItem value={'Final'}>Final</MenuItem>
              <MenuItem value={'Class Test'}>Class Test</MenuItem>
              <MenuItem value={'Viva'}>Viva</MenuItem>
              <MenuItem value={'Presentation'}>Presentation</MenuItem>
            </TextField>

            <Grid container spacing={2}>
              <Grid item xs={editableExam.total_marks === 'other' ? 6 : 12}>
                <TextField label='Total Marks' select fullWidth value={editableExam.total_marks}
                  onChange={(e) => setEditableExam({ ...editableExam, total_marks: e.target.value })} margin='normal' size='small'>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={40}>40</MenuItem>
                  <MenuItem value={'other'}>Other</MenuItem>
                </TextField>
              </Grid>

              {editableExam.total_marks === 'other' &&
                <Grid item xs={6}>
                  <TextField label='Other Marks' type="number" fullWidth value={editableExam.other_marks}
                    onChange={(e) => setEditableExam({ ...editableExam, other_marks: e.target.value })} margin='normal' size='small' />
                </Grid>
              }
            </Grid>

            <TextField label='Exam Date' type="date" fullWidth value={convertDate(editableExam.exam_date)}
              onChange={(e) => setEditableExam({ ...editableExam, exam_date: e.target.value })} margin='normal' size='small' />
          </Box>
        }
        onOpen={openEditExamModal}
        onClose={() => setOpenEditExamModal(false)}
        onConfirm={updateExam}
        confirmText={'Save Changes'}
        loading={loading}
      />


      {/* Utilities */}
      < CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </Box >
  )


  // convert date function
  function convertDate(inputDate) {
    const date = new Date(inputDate);

    // Get the components of the date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(date.getDate()).padStart(2, '0');

    // Assemble the formatted date
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
  }
}
