import { Box, Grid, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import CustomSnackbar from '../../../utilities/SnackBar'
import { useNavigate } from 'react-router-dom'
import ModalDialog from '../../../utilities/ModalDialog'

export default function AssignSupple({ selectedSemester, role }) {

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  let navigate = useNavigate();

  const [inputValues, setInputValues] = useState([{ course_id: '', teacher_id: '', total_marks: 40, exam_date: convertDate(new Date()) }]);
  const [filterVals, setFilterVals] = useState({ dept_id: 0, batch_id: 0, section_id: 0 })
  const [departments, setDepartments] = useState([])
  const [courses, setCourses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [suppleExams, setSuppleExams] = useState([])

  const [editableExam, setEditableExam] = useState([])
  const [deletableId, setDeletableId] = useState(null)
  const [deleteExamInput, setDeleteExamInput] = useState('')

  // modal show hide
  const [showAddExamModal, setShowAddExamModal] = useState(false)
  const [showEditExamModal, setShowEditExamModal] = useState(false)
  const [showExamDelete, setShowExamDelete] = useState(false)


  // add & remove input field
  const handleAddField = () => {
    setInputValues([...inputValues, { course_id: '', teacher_id: '', total_marks: 40, exam_date: convertDate(new Date()) }])
  }
  const handleInputChange = (value, index) => {
    // adding multiple input fields as object
    const list = [...inputValues];
    const addObj = { ...list[index], ...value }
    list[index] = addObj;
    setInputValues(list);
  }
  const handleRemoveInput = (index) => {
    const list = [...inputValues];
    list.splice(index, 1);
    setInputValues(list);
  }

  // console.log(inputValues)


  // get departments
  const getDepartments = () => {
    axios.get('/api/admin/departments').then(res => {
      if (res.status === 200) {
        setDepartments(res.data.departments)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    });
  }

  // get dept courses
  const getDeptCourses = useCallback((dept_id) => {
    axios.get(`/api/${role}/courses/${dept_id}`).then(res => {
      if (res.status === 200) {
        setCourses(res.data.courses)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    });
  }, [role])

  // get teachers
  const getTeachers = useCallback(() => {
    axios.get(`/api/${role}/teachers/0`).then(res => {
      if (res.status === 200) {
        setTeachers(res.data.users)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    });
  }, [role])

  // get Supple Exam
  const getSuppleExams = useCallback((dept_id) => {
    setLoading(true)
    axios.get(`/api/${role}/supplementary-exams/${dept_id}/${selectedSemester.id}`).then(res => {
      if (res.status === 200) {
        setSuppleExams(res.data.exams)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    }).finally(() => {
      setLoading(false)
    });
  }, [role, selectedSemester.id])

  // add Supple Exam
  const addSuppleExam = (e) => {
    e.preventDefault()
    setLoading(true)
    let data = { semester_id: selectedSemester.id, courses: inputValues }
    axios.post(`/api/${role}/supplementary-exams`, data).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getSuppleExams(filterVals.dept_id)
        setInputValues([{ course_id: '', teacher_id: '', total_marks: 40, exam_date: convertDate(new Date()) }])
        setShowAddExamModal(false)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
      setLoading(false)
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
      setLoading(false)
    });
  }

  // edit assigned course
  const editSuppleExam = (e) => {
    e.preventDefault()
    setLoading(true)
    axios.put(`/api/${role}/supplementary-exams/${editableExam.id}`, editableExam).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getSuppleExams(filterVals.dept_id)
        setShowEditExamModal(false)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
      setLoading(false)
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
      setLoading(false)
    });
  }

  // delete assigned course
  const deleteSuppleExam = () => {
    axios.delete(`/api/${role}/supplementary-exams/${deletableId}`).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getSuppleExams(filterVals.dept_id)
        setShowExamDelete(false)
        setDeleteExamInput('')
        setDeletableId(null)
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


  useEffect(() => {
    if (role === 'moderator') {
      const modDeptId = localStorage.getItem('user') ?
        JSON.parse(localStorage.getItem('user')).dept_id
        : JSON.parse(sessionStorage.getItem('user')).dept_id;

      getSuppleExams(modDeptId)
      if (filterVals.dept_id === 0) {
        setFilterVals({ dept_id: modDeptId, batch_id: 0, section_id: 0 })
      }
    }

    if (sessionStorage.getItem('selectedId')) {
      setFilterVals(JSON.parse(sessionStorage.getItem('selectedId')));
      if (filterVals.dept_id !== 0) {
        getSuppleExams(filterVals.dept_id);
        getDeptCourses(filterVals.dept_id);
      }
    }
  }, [filterVals.dept_id, getDeptCourses, getSuppleExams, role])


  useEffect(() => {
    if (role === 'admin') {
      getDepartments();
    }
    getTeachers();
  }, [getSuppleExams, getTeachers, role, selectedSemester.id])



  return (
    <Box className="card my-2">
      <Box className='card-header d-flex justify-content-between align-items-center'>
        <h5 className='mb-0'>Supplementary Exams</h5>

        {role === 'moderator' &&
          <button className='btn btn-secondary' onClick={() => setShowAddExamModal(true)} disabled={filterVals.dept_id === 0}>
            <i className="fas fa-plus me-1"></i> Add Exam</button>
        }
      </Box>

      <Box className="card-body">
        {/* Filter section */}
        {role === 'admin' &&
          <Box className="d-flex align-items-center mb-1">
            <Grid container spacing={2}>
              {/* select department */}
              <Grid item xs={12} sm={5}>
                <TextField select fullWidth margin='small' size='small' value={filterVals.dept_id}
                  onChange={(e) => {
                    setFilterVals({ dept_id: e.target.value, batch_id: 0, section_id: 0 });
                    sessionStorage.setItem('selectedId', JSON.stringify({ dept_id: e.target.value, batch_id: 0, section_id: 0 }))
                  }}>
                  <MenuItem value={0} disabled>Select Department</MenuItem>
                  {departments.map((department) => (
                    <MenuItem value={department.id}>{department.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* add course button */}
              <Grid item xs={12} sm={7} className='text-end'>
                <button className='btn btn-secondary' onClick={() => setShowAddExamModal(true)} disabled={filterVals.dept_id === 0}>
                  <i className="fas fa-plus me-1"></i> Add Exam</button>
              </Grid>
            </Grid>
          </Box>
        }


        {/* supple exams table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Course Code</TableCell>
              <TableCell>Course Title</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Total Marks</TableCell>
              <TableCell>Exam Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? <TableCell colSpan={7} className='text-center'><span className="spinner-border my-4"></span></TableCell>
              : suppleExams.length > 0 ?
                suppleExams.map((exam, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell onClick={() => navigate(`/${role}/supplementary-exams/${exam.id}`, { state: { exam: exam } })} className='link'>
                      {exam.course.course_code}</TableCell>
                    <TableCell onClick={() => navigate(`/${role}/supplementary-exams/${exam.id}`, { state: { exam: exam } })} className='link fw-semibold'>
                      {exam.course.title}</TableCell>
                    <TableCell>
                      <span>{exam.teacher.name}</span><br />
                      <small className='text-muted'>({exam.teacher.department.name})</small>
                    </TableCell>
                    <TableCell>{exam.total_marks}</TableCell>
                    <TableCell>{new Date(exam.exam_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                    <TableCell>
                      <Box className='d-flex'>
                        <button className='btn btn-outline-secondary btn-sm btn-floating border-grey'
                          onClick={() => { setEditableExam(exam); setShowEditExamModal(true) }}><i className="fas fa-edit"></i></button>

                        <button className='btn btn-outline-danger btn-sm btn-floating border-grey ms-1'
                          onClick={() => { setDeletableId(exam.id); setShowExamDelete(true) }}><i className="fas fa-trash-alt"></i></button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
                : <TableCell colSpan={7} className='text-center py-5'>No exams found</TableCell>}
          </TableBody>
        </Table>

      </Box>


      {/* add exam modal */}
      <ModalDialog
        title={'Add Exams'}
        content={
          <Box style={{ minWidth: '550px' }}>
            {/* dynamic input courses */}
            {inputValues.map((inputField, index) => (
              <Box className='border-bottom border-light-grey py-3' key={index}>
                <Box className='d-flex justify-content-between'>

                  <Grid container spacing={2}>
                    {/* Course select */}
                    <Grid item xs={12} sm={4}>
                      <TextField select fullWidth label="Course" value={inputField.course_id || ''}
                        onChange={(e) => handleInputChange({ course_id: e.target.value }, index)} size='small' >
                        {courses.map((course) => (
                          <MenuItem value={course.id} key={course.id}>
                            {`${course.course_code} :: ${course.title}`}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    {/* Teacher select */}
                    <Grid item xs={12} sm={4}>
                      <TextField select fullWidth label="Teacher" value={inputField.teacher_id || ''}
                        onChange={(e) => handleInputChange({ teacher_id: e.target.value }, index)} size='small' >
                        {teachers.map((teacher) => (
                          <MenuItem value={teacher.id} key={teacher.id}>
                            {teacher.name}
                            <small className='text-muted ms-1'>({teacher.department.name})</small>
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    {/* total marks input */}
                    <Grid item xs={12} sm={2}>
                      <TextField type='number' fullWidth label="Total Marks" value={inputField.total_marks || ''}
                        onChange={(e) => handleInputChange({ total_marks: e.target.value }, index)} size='small' />
                    </Grid>
                    {/* exam date */}
                    <Grid item xs={12} sm={2}>
                      <TextField type='date' fullWidth label="Exam Date" value={inputField.exam_date || ''}
                        onChange={(e) => handleInputChange({ exam_date: e.target.value }, index)} size='small' />
                    </Grid>
                  </Grid>

                  <button type="button" onClick={() => handleRemoveInput(index)} className='btn btn-light btn-floating btn-sm ms-1 mt-1'>
                    <i className="fas fa-times"></i></button>
                </Box>
              </Box>
            ))}

            {/* add new button */}
            <button type="button" onClick={() => handleAddField()} className="btn btn-secondary btn-sm mt-2">
              <i className="fas fa-plus me-1"></i> New Exam</button>
          </Box>
        }
        onOpen={showAddExamModal}
        onClose={() => {
          setShowAddExamModal(false);
          setInputValues([{ course_id: '', teacher_id: '', total_marks: 40, exam_date: convertDate(new Date()) }])
        }}
        onConfirm={addSuppleExam}
        confirmText={'Save'}
        loading={loading}
        isFullScreen={true}
      />


      {/* edit modal */}
      <ModalDialog
        title={'Edit'}
        content={
          <Box style={{ maxWidth: '350px' }}>
            <TextField select fullWidth label="Course" value={editableExam.course_id}
              onChange={(e) => setEditableExam({ ...editableExam, course_id: e.target.value })} size='small' margin='normal' >
              {courses.map((course) => (
                <MenuItem value={course.id} key={course.id}>
                  {`${course.course_code} :: ${course.title}`}
                </MenuItem>
              ))}
            </TextField>

            <TextField select fullWidth label="Teacher" value={editableExam.teacher_id}
              onChange={(e) => setEditableExam({ ...editableExam, teacher_id: e.target.value })} size='small' margin='normal' >
              {teachers.map((teacher) => (
                <MenuItem value={teacher.id} key={teacher.id}>
                  {teacher.name}
                  <small className='text-muted ms-1'>({teacher.department.name})</small>
                </MenuItem>
              ))}
            </TextField>

            <TextField type='number' fullWidth label="Total Marks" value={editableExam.total_marks}
              onChange={(e) => setEditableExam({ ...editableExam, total_marks: e.target.value })} size='small' margin='normal' />

            <TextField type='date' fullWidth label="Exam Date" value={convertDate(editableExam.exam_date)}
              onChange={(e) => setEditableExam({ ...editableExam, exam_date: e.target.value })} size='small' margin='normal' />
          </Box>
        }
        onOpen={showEditExamModal}
        onClose={() => setShowEditExamModal(false)}
        onConfirm={editSuppleExam}
        confirmText={'Save Changes'}
        loading={loading}
      />

      {/* delete course modal */}
      <ModalDialog
        title={`Detete selected exam?`}
        content={
          <Box className='mt-2' sx={{ maxWidth: '350px' }}>
            <p className='fw-bold mb-0'>Are you sure you want to remove this?</p>
            <p className='mb-4'>This action cannot be undone.</p>

            {/* type the username to delete account */}
            <p className='mb-2'>To confirm deletion, type <b>delete</b> in the text input field.</p>
            <TextField placeholder='delete' type="text" value={deleteExamInput}
              onChange={(e) => setDeleteExamInput(e.target.value)} fullWidth size='small' />
          </Box>
        }
        onOpen={showExamDelete}
        onClose={() => { setShowExamDelete(false); setDeleteExamInput('') }}
        confirmText={'Delete'}
        actionColor={'error'}
        disabledAction={deleteExamInput !== 'delete'}
        onConfirm={deleteSuppleExam}
        loading={loading}
      />


      {/* Utilities */}
      <CustomSnackbar message={success} status={'success'} />
      <CustomSnackbar message={error} status={'error'} />
    </Box>
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
