import React, { useCallback, useEffect, useState } from 'react'
import CustomSnackbar from '../../../utilities/SnackBar'
import axios from 'axios'
import { Grid, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material'
import ModalDialog from '../../../utilities/ModalDialog'
import Swal from 'sweetalert2'

export default function AssignCourse({ selectedSemester }) {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [filterVals, setFilterVals] = useState({ dept_id: 0, batch_id: 0, section_id: 0 })
  const [departments, setDepartments] = useState([])
  const [batchs, setBatchs] = useState([])
  const [sections, setSections] = useState([])
  const [courses, setCourses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [assignedCourses, setAssignedCourses] = useState([])

  const [inputValues, setInputValues] = useState([]);
  const [editableCourse, setEditableCourse] = useState([])

  // modal show hide
  const [showEditCourseModal, setShowEditCourseModal] = useState(false)

  // console.log(assignedCourses)

  // add & remove input field
  const handleAddField = () => {
    setInputValues([...inputValues, []])
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

  // get all batchs
  const getBatchs = useCallback((dept_id) => {
    axios.get(`/api/admin/batch_section/${dept_id}`).then(res => {
      if (res.status === 200) {
        setBatchs(res.data.batches)
        if (filterVals.batch_id !== 0) {
          res.data.batches.map((batch) => batch.id === filterVals.batch_id && setSections(batch.sections));
        }
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    });
  }, [filterVals.batch_id])

  // get dept courses
  const getDeptCourses = useCallback((dept_id) => {
    axios.get(`/api/admin/courses/${dept_id}`).then(res => {
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
  }, [])

  // get teachers
  const getTeachers = () => {
    axios.get('/api/admin/teachers/0').then(res => {
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
  }

  // get assigned courses
  const getAssignedCourses = useCallback((semester_id, section_id) => {
    setLoading(true)
    axios.get(`/api/admin/assign-course/${semester_id}/${section_id}`).then(res => {
      if (res.status === 200) {
        setAssignedCourses(res.data.courses)
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
  }, [])

  // add assign course
  const addAssignCourse = (e) => {
    e.preventDefault()
    setLoading(true)
    let data = { ...filterVals, semester_id: selectedSemester.id, courses: inputValues }
    axios.post('/api/admin/assign-course', data).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getAssignedCourses(selectedSemester.id, filterVals.section_id)
        setInputValues([])
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
  const editAssignedCourse = (e) => {
    e.preventDefault()
    setLoading(true)
    axios.put(`/api/admin/assign-course/${editableCourse.id}`, editableCourse).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getAssignedCourses(selectedSemester.id, filterVals.section_id)
        setShowEditCourseModal(false)
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
  const deleteAssignedCourse = (id) => {
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
        axios.delete(`/api/admin/assign-course/${id}`).then(res => {
          if (res.status === 200) {
            setSuccess(res.data.message)
            getAssignedCourses(selectedSemester.id, filterVals.section_id)
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
    if (sessionStorage.getItem('selectedId')) {
      setFilterVals(JSON.parse(sessionStorage.getItem('selectedId')))
      if (filterVals.dept_id !== 0) {
        getBatchs(filterVals.dept_id)
        getDeptCourses(filterVals.dept_id)
      }
      if (filterVals.section_id !== 0)
        getAssignedCourses(selectedSemester.id, filterVals.section_id)
    }
  }, [filterVals.dept_id, filterVals.section_id, getAssignedCourses, getBatchs, getDeptCourses, selectedSemester.id])

  useEffect(() => {
    getDepartments()
    getTeachers()
  }, [])


  return (
    <div className="card my-2">
      <div className='card-header d-flex justify-content-between align-items-center'>
        <h5 className='mt-2 mb-0'>Assign Courses</h5>
      </div>

      <div className="card-body">
        {/* Filter section */}
        <div className="d-flex align-items-center mb-1">
          <Grid container spacing={2}>
            {/* select department */}
            <Grid item xs={12} sm={5}>
              <TextField select fullWidth margin='small' size='small' value={filterVals.dept_id}
                onChange={(e) => {
                  setFilterVals({ dept_id: e.target.value, batch_id: 0, section_id: 0 });
                  getBatchs(e.target.value);
                  sessionStorage.setItem('selectedId', JSON.stringify({ dept_id: e.target.value, batch_id: 0, section_id: 0 }))
                  setAssignedCourses([])
                }}>
                <MenuItem value={0} disabled>Select Department</MenuItem>
                {departments.map((department) => (
                  <MenuItem value={department.id}>{department.name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* select batch */}
            <Grid item xs={12} sm={2}>
              <TextField select fullWidth margin='small' size='small' value={filterVals.batch_id}
                onChange={(e) => {
                  setFilterVals({ ...filterVals, batch_id: e.target.value, section_id: 0 });
                  batchs.map((batch) => batch.id === e.target.value && setSections(batch.sections));
                  sessionStorage.setItem('selectedId', JSON.stringify({ ...filterVals, batch_id: e.target.value, section_id: 0 }))
                  setAssignedCourses([])
                }} disabled={filterVals.dept_id === 0}>
                <MenuItem value={0} disabled>Select Batch</MenuItem>
                {batchs.map((batch) => (
                  <MenuItem value={batch.id}>{batch.batch_name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* select section */}
            <Grid item xs={12} sm={2}>
              <TextField select fullWidth margin='small' size='small' value={filterVals.section_id}
                onChange={(e) => {
                  setFilterVals({ ...filterVals, section_id: e.target.value })
                  sessionStorage.setItem('selectedId', JSON.stringify({ ...filterVals, section_id: e.target.value }))
                }} disabled={filterVals.batch_id === 0}>
                <MenuItem value={0} disabled>Select Section</MenuItem>
                {sections && sections.map((section) => (
                  <MenuItem value={section.id}>{section.section_name}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </div>

        {/* assigned courses table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Course Code</TableCell>
              <TableCell>Course Title</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Credit Hours</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? <TableCell colSpan={6} className='text-center'><span className="spinner-border my-4"></span></TableCell>
              : assignedCourses.length > 0 ?
                assignedCourses.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{course.course && course.course.course_code}</TableCell>
                    <TableCell>{course.course && course.course.title}</TableCell>
                    <TableCell>
                      <span>{course.teacher && course.teacher.name}</span><br />
                      <small className='text-muted'>({course.teacher.department && course.teacher.department.name})</small>
                    </TableCell>
                    <TableCell>{course.course && course.course.credit_hours}</TableCell>
                    <TableCell>
                      <div className='d-flex'>
                        <button className='btn btn-outline-secondary btn-sm btn-floating border-grey'
                          onClick={() => { setEditableCourse(course); setShowEditCourseModal(true) }}><i className="fas fa-edit"></i></button>

                        <button className='btn btn-outline-danger btn-sm btn-floating border-grey ms-1'
                          onClick={() => deleteAssignedCourse(course.id)}><i className="fas fa-trash-alt"></i></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
                : <TableCell colSpan={6} className='text-center py-5'>No course found</TableCell>}
          </TableBody>
        </Table>


        {/* add course */}
        {/* dynamic input courses */}
        {inputValues.map((inputField, index) => (
          <div className='border-bottom border-light-grey py-3' key={index}>
            <div className='d-flex justify-content-between'>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  {/* Course select */}
                  <TextField select fullWidth label="Course" value={inputField.course_id || ''}
                    onChange={(e) => handleInputChange({ course_id: e.target.value }, index)} size='small' >
                    {courses.map((course) => (
                      <MenuItem value={course.id} key={course.id}>
                        {`${course.course_code} :: ${course.title}`}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  {/* Teacher select */}
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
              </Grid>

              <button type="button" onClick={() => handleRemoveInput(index)} className='btn btn-light btn-floating btn-sm ms-1 mt-1'>
                <i className="fas fa-times"></i></button>
            </div>
          </div>
        ))}

        {/* Add mew field button */}
        <button type="button" onClick={() => handleAddField()} className="btn btn-secondary btn-sm mt-3">
          <i className="fas fa-plus me-1"></i> New Course</button>

        {/* save new courses */}
        {inputValues.length > 0 &&
          <button type="button" onClick={addAssignCourse} className="btn btn-primary btn-sm ms-2 mt-3">
            <i className="fas fa-save me-1"></i> Save</button>}
      </div>


      {/* edit modal */}
      <ModalDialog
        title={'Edit'}
        content={
          <div style={{ maxWidth: '350px' }}>
            <TextField select fullWidth label="Course" value={editableCourse.course_id}
              onChange={(e) => setEditableCourse({ ...editableCourse, course_id: e.target.value })} size='small' margin='normal' >
              {courses.map((course) => (
                <MenuItem value={course.id} key={course.id}>
                  {`${course.course_code} :: ${course.title}`}
                </MenuItem>
              ))}
            </TextField>

            <TextField select fullWidth label="Teacher" value={editableCourse.teacher_id}
              onChange={(e) => setEditableCourse({ ...editableCourse, teacher_id: e.target.value })} size='small' margin='normal' >
              {teachers.map((teacher) => (
                <MenuItem value={teacher.id} key={teacher.id}>
                  {teacher.name}
                  <small className='text-muted ms-1'>({teacher.department.name})</small>
                </MenuItem>
              ))}
            </TextField>
          </div>
        }
        onOpen={showEditCourseModal}
        onClose={() => setShowEditCourseModal(false)}
        onConfirm={editAssignedCourse}
        confirmText={'Save Changes'}
        loading={loading}
      />


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </div>
  )
}
