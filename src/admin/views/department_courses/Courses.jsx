import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import Swal from 'sweetalert2'
import CustomSnackbar from '../../../utilities/SnackBar'
import ModalDialog from '../../../utilities/ModalDialog'
import { Box, Grid, MenuItem, TextField } from '@mui/material'

export default function Courses({ departments }) {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState()

  const [selectedDepartment, setSelectedDepartment] = useState(0)

  const [courses, setCourses] = useState([])
  const [searchCourse, setSearchCourse] = useState('')
  const [filteredCourse, setFilteredCourse] = useState([])

  const [inputValues, setInputValues] = useState([{}])
  const [selectedCourses, setSelectedCourses] = useState([])

  const [editableCourse, setEditableCourse] = useState([])
  const [showEditCourseModal, setShowEditCourseModal] = useState(false)
  const [showAddCourseModal, setShowAddCourseModal] = useState(false)


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

  // add  courses
  const addCourses = (e) => {
    e.preventDefault();
    const formData = new FormData()
    formData.append('dept_id', selectedDepartment)
    formData.append('courses', JSON.stringify(inputValues))
    setLoading(true)

    axios.post(`/api/${role}/courses`, formData).then(res => {
      if (res.status === 200) {
        getCourses(selectedDepartment)
        setInputValues([[]])
        setShowAddCourseModal(false)
        setSuccess(res.data.message)
        setLoading(false)
        setTimeout(() => { setSuccess('') }, 5000)
      } else {
        setError(res.data.message)
        setLoading(false)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setLoading(false)
      setTimeout(() => { setError('') }, 5000)
    });
  }

  // delete  courses
  const deleteCourses = () => {
    let deletableId = { deletableId: selectedCourses.map((course) => course.id) }

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
        setLoading(true)
        axios.post(`/api/${role}/courses/delete`, deletableId).then(res => {
          if (res.status === 200) {
            getCourses(selectedDepartment)
            setSelectedCourses([])
            setSuccess(res.data.message)
            setLoading(false)
            setTimeout(() => { setSuccess('') }, 5000)
          } else {
            setError(res.data.message)
            setLoading(false)
            setTimeout(() => { setError('') }, 5000)
          }
        }).catch(err => {
          setError(err.response.data.message)
          setLoading(false)
          setTimeout(() => { setError('') }, 5000)
        });
      }
    })
  }

  // update  courses
  const updateCourses = (e) => {
    e.preventDefault();
    setLoading(true)

    axios.put(`/api/${role}/courses/${editableCourse.id}`, editableCourse).then(res => {
      if (res.status === 200) {
        getCourses(selectedDepartment)
        setShowEditCourseModal(false)
        setSuccess(res.data.message)
        setLoading(false)
        setTimeout(() => { setSuccess('') }, 5000)
      } else {
        setError(res.data.message)
        setLoading(false)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setLoading(false)
      setTimeout(() => { setError('') }, 5000)
    });
  }

  // get  courses
  const getCourses = useCallback((id) => {
    setLoading(true)
    axios.get(`/api/${role}/courses/${id}`).then(res => {
      if (res.status === 200) {
        setCourses(res.data.courses)
        setLoading(false)
      } else {
        setError(res.data.message)
        setLoading(false)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setLoading(false)
      setTimeout(() => { setError('') }, 5000)
    });
  }, [role])

  // datatable columns
  const columns = [
    {
      name: 'Code',
      selector: row => row.course_code,
      sortable: true,
      wrap: true,
      width: '110px'
    },
    {
      name: 'Title',
      selector: row => row.title,
      sortable: true,
      wrap: true
    },
    {
      name: 'Credit',
      selector: row => row.credit_hours,
      sortable: true,
      width: '90px'
    },
    {
      name: 'Action',
      cell: (row) => <button className="btn btn-secondary btn-sm px-2"
        onClick={() => { setEditableCourse(row); setShowEditCourseModal(true) }}><i className="fas fa-edit"></i></button >,
      button: true,
    }
  ]


  useEffect(() => {
    localStorage.getItem('role') ?
      setRole(localStorage.getItem('role'))
      : setRole(sessionStorage.getItem('role'));

    if (role === 'moderator') {
      const modDeptId = localStorage.getItem('user') ?
        JSON.parse(localStorage.getItem('user')).dept_id
        : JSON.parse(sessionStorage.getItem('user')).dept_id;

      if (selectedDepartment === 0) {
        setSelectedDepartment(modDeptId);
        getCourses(modDeptId);
      }
    }
  }, [getCourses, role, selectedDepartment])



  useEffect(() => {
    const result = courses.filter((course) => {
      return course.title.toLowerCase().match(searchCourse.toLowerCase())
        || course.course_code.toLowerCase().match(searchCourse.toLowerCase())
    })
    setFilteredCourse(result)
  }, [courses, searchCourse])


  return (
    <Box className='card'>
      {/* heading */}
      <Box className='card-header d-flex justify-content-between align-items-center'>
        <h5 className='mt-3'>Courses</h5>

        {role === 'admin' &&
          <TextField sx={{ width: '200px' }} select fullWidth margin='small' size='small' value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              getCourses(e.target.value);
            }}>
            <MenuItem value={0} disabled>Select Department</MenuItem>
            {departments.map((department) => (
              <MenuItem value={department.id}>{department.name}</MenuItem>
            ))}
          </TextField>
        }
      </Box>

      {/* body */}
      <Box className='card-body pt-2'>
        <DataTable
          title={
            <Box className="w-100 d-flex align-items-center justify-content-between my-2">
              <Box className="input-group w-50">
                <Box className="input-group-text border-0 ps-0"><i className='fas fa-search'></i></Box>
                <input type="text" className="form-control bb-input" placeholder="Search course" value={searchCourse} onChange={(e) => setSearchCourse(e.target.value)} />
              </Box>

              <button onClick={() => setShowAddCourseModal(true)} className="btn btn-secondary">Add Course</button>
            </Box>
          }
          columns={columns}
          data={filteredCourse}
          pagination
          responsive
          highlightOnHover
          noDataComponent={loading ? <span className="spinner-border" role="status" aria-hidden="true"></span>
            : selectedDepartment === 0 ? <Box className="text-center my-4">Please select a department</Box>
              : <Box className="text-center my-4">No courses found</Box>}
          selectableRows
          selectableRowsHighlight
          onSelectedRowsChange={data => setSelectedCourses(data.selectedRows)}
          contextActions={<button className="btn btn-danger me-2 px-3" onClick={() => deleteCourses()}><i className="fas fa-trash-alt"></i></button>}
          clearSelectedRows={loading}
        />
      </Box>



      {/* add course modal */}
      <ModalDialog
        title={'Add Courses'}
        content={
          <form onSubmit={addCourses} style={{ minWidth: '350px' }}>
            {/* select department */}
            {role === 'admin' &&
              <TextField label="Department" value={selectedDepartment}
                select fullWidth disabled margin='normal' size='small'>
                <MenuItem value={0}>Please select a department</MenuItem>
                {departments.map((department) => (
                  <MenuItem value={department.id} key={department.id}>{department.name}</MenuItem>
                ))}
              </TextField>
            }

            <Box className="form-label mb-0 mt-3">Courses</Box>
            {/* courses input fields */}
            {inputValues.map((inputField, index) => (
              <Box className='border-top border-light-grey py-3' key={index}>
                <Box className='d-flex justify-content-between'>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth label="Course code" value={inputField.course_code}
                        onChange={(e) => handleInputChange({ course_code: e.target.value }, index)} size='small' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Course title" value={inputField.title}
                        onChange={(e) => handleInputChange({ title: e.target.value }, index)} size='small' />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField type='number' fullWidth label="Credit hours" value={inputField.credit_hours}
                        onChange={(e) => handleInputChange({ credit_hours: e.target.value }, index)} size='small' inputProps={{ step: '0.5' }} />
                    </Grid>
                  </Grid>

                  <button type="button" onClick={() => handleRemoveInput(index)} className='btn btn-light btn-floating btn-sm ms-1 mt-1'>
                    <i className="fas fa-times"></i></button>
                </Box>
              </Box>
            ))}

            {/* Add mew field button */}
            <button type="button" onClick={() => handleAddField()} className="btn btn-rounded btn-sm bg-light">
              <i className="fas fa-plus me-1"></i> New</button>
          </form>
        }
        onOpen={showAddCourseModal}
        onClose={() => setShowAddCourseModal(false)}
        confirmText={selectedDepartment !== 0 && 'Add Courses'}
        onConfirm={addCourses}
        loading={loading}
      />

      {/* edit course modal */}
      <ModalDialog
        title={'Edit Course'}
        content={
          <form onSubmit={updateCourses} style={{ width: '350px' }}>
            <TextField label="Course code" value={editableCourse.course_code}
              onChange={(e) => setEditableCourse({ ...editableCourse, course_code: e.target.value })}
              className="mb-3" fullWidth required margin='normal' size='small' />

            <TextField label="Course title" value={editableCourse.title}
              onChange={(e) => setEditableCourse({ ...editableCourse, title: e.target.value })}
              className="mb-3" fullWidth required margin='normal' size='small' />

            <TextField type='number' label="Credit hours" value={editableCourse.credit_hours}
              onChange={(e) => setEditableCourse({ ...editableCourse, credit_hours: e.target.value })}
              className="mb-3" fullWidth required margin='normal' size='small' inputProps={{ step: '0.5' }} />
          </form>
        }
        onOpen={showEditCourseModal}
        onClose={() => setShowEditCourseModal(false)}
        confirmText={'Save changes'}
        onConfirm={updateCourses}
        loading={loading}
      />

      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </Box >
  )
}
