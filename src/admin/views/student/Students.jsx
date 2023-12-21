/* eslint-disable eqeqeq */
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import Swal from 'sweetalert2'
import { Link } from 'react-router-dom'
import { Grid, Menu, MenuItem, TextField } from '@mui/material'
import ModalDialog from '../../../utilities/ModalDialog'
import CustomSnackbar from '../../../utilities/SnackBar'

export default function Students() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [departments, setDepartments] = useState([])
  const [batchs, setBatchs] = useState([])
  const [sections, setSections] = useState([])

  const [filterVals, setFilterVals] = useState({ dept_id: 0, batch_id: 0, section_id: 0 })

  const [students, setStudents] = useState([])
  const [searchStudents, setSearchStudents] = useState('')
  const [filteredStudents, setFilteredStudents] = useState([])

  const [inputStudent, setInputStudent] = useState({ student_id: '', name: '', email: '', phone: '' })
  const [editableStudent, setEditableStudent] = useState({})
  const [selectedStudents, setSelectedStudents] = useState([])

  // open menu and modals
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)

  // console.log(batchs)
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

  // get all students
  const getStudents = (batch, section) => {
    setLoading(true)
    axios.get(`/api/admin/students/${batch}/${section}`).then(res => {
      if (res.status === 200) {
        setStudents(res.data.students)
        setFilteredStudents(res.data.students)
        setLoading(false)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
        setLoading(false)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
      setLoading(false)
    });
  }

  // create student
  const addStudent = (e) => {
    e.preventDefault()
    setLoading(true)
    let data = { ...inputStudent, ...filterVals }
    axios.post('/api/admin/students', data).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getStudents(filterVals.batch_id, filterVals.section_id)
        setInputStudent({ student_id: '', name: '', email: '', phone: '' })
        setLoading(false)
        setTimeout(() => { setSuccess('') }, 5000)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
        setLoading(false)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
      setLoading(false)
    });
  }

  // update student
  const updateStudent = (e) => {
    e.preventDefault()
    setLoading(true)
    axios.put(`/api/admin/students/${editableStudent.id}`, editableStudent).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getStudents(filterVals.batch_id, filterVals.section_id)
        setLoading(false)
        setTimeout(() => { setSuccess('') }, 5000)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
        setLoading(false)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
      setLoading(false)
    });
  }

  // delete central routine
  const deleteStudents = () => {
    let deletableId = { deletableId: selectedStudents.map((student) => student.id) }

    Swal.fire({
      title: 'Are you sure to delete?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6749c6',
      cancelButtonColor: '#707070',
      confirmButtonText: 'Yes, delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true)
        axios.post('/api/admin/students/delete', deletableId).then(res => {
          if (res.status === 200) {
            setSuccess(res.data.message)
            getStudents(filterVals.batch_id, filterVals.section_id)
            setLoading(false)
            setTimeout(() => { setSuccess('') }, 5000);
          } else {
            setError(res.data.message)
            setTimeout(() => { setError('') }, 5000);
            setLoading(false)
          }
        }).catch(err => {
          setError(err.response.data.message)
          setLoading(false)
          setTimeout(() => { setError('') }, 5000);
        });
      }
    })
  }

  // datatable columns
  const columns = [
    {
      name: 'Student ID',
      selector: row => row.student_id,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Email',
      selector: row => <a href={'mailto:' + row.email} target='blank'>{row.email}</a>,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Phone',
      selector: row => <a href={'tel:' + row.phone} target='blank'>{row.phone}</a>,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Action',
      button: true,
      cell: row => <button className="btn btn-secondary btn-sm px-2" onClick={() => { setEditableStudent(row) }}>
        <i className="fas fa-edit" ></i></button >,
    }
  ]


  useEffect(() => {
    if (sessionStorage.getItem('selectedId')) {
      setFilterVals(JSON.parse(sessionStorage.getItem('selectedId')))
      if (filterVals.dept_id !== 0)
        getBatchs(filterVals.dept_id)
      if (filterVals.batch_id !== 0)
        getStudents(filterVals.batch_id, filterVals.section_id)
    }
    getDepartments()
  }, [filterVals.batch_id, filterVals.dept_id, filterVals.section_id, getBatchs])

  useEffect(() => {
    const filteredData = students.filter(student => {
      return student.student_id.toLowerCase().includes(searchStudents.toLowerCase())
        || student.name.toLowerCase().includes(searchStudents.toLowerCase())
        || student.email && student.email.toLowerCase().includes(searchStudents.toLowerCase())
        || student.phone && student.phone.toLowerCase().includes(searchStudents.toLowerCase())
    })
    setFilteredStudents(filteredData)
  }, [students, searchStudents])


  return (
    <div className="container">
      <div className='card my-2'>
        <div className='card-header d-flex justify-content-between align-items-center'>
          <h5 className='mt-3'>All Student</h5>

          {/* add student dropdown button and menu */}
          <button className="btn btn-secondary" id="basic-button" aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined} onClick={(event) => setAnchorEl(event.currentTarget)}>
            Add Student
          </button>
          <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}
            MenuListProps={{ 'aria-labelledby': 'basic-button' }}>
            <MenuItem>
              <Link to={'/admin/students/add'} className='text-dark'>
                <i className="fas fa-file-csv text-grey me-3"></i>Import from .csv
              </Link>
            </MenuItem>
            <MenuItem onClick={() => { setShowAddStudentModal(true); setAnchorEl(null) }}>
              <i className="fas fa-user-plus text-grey fa-sm me-3"></i>Add manually
            </MenuItem>
          </Menu>
        </div>


        <div className='card-body'>

          {/* Filter section */}
          <div className="px-3 d-flex align-items-center mb-1">
            {/* filter icon */}
            <div className="me-2"><i className="fas fa-sliders-h fw-lg me-1"></i></div>

            <div className="row w-100">
              {/* select department */}
              <div className='col-3'>
                <TextField select fullWidth margin='small' size='small' value={filterVals.dept_id}
                  onChange={(e) => {
                    setFilterVals({ dept_id: e.target.value, batch_id: 0, section_id: 0 });
                    getBatchs(e.target.value);
                    sessionStorage.setItem('selectedId', JSON.stringify({ dept_id: e.target.value, batch_id: 0, section_id: 0 }))
                    setStudents([])
                  }}>
                  <MenuItem value={0} disabled>Select Department</MenuItem>
                  {departments.map((department) => (
                    <MenuItem value={department.id}>{department.name}</MenuItem>
                  ))}
                </TextField>
              </div>

              {/* select batch */}
              <div className='col-3'>
                <TextField select fullWidth margin='small' size='small' value={filterVals.batch_id}
                  onChange={(e) => {
                    setFilterVals({ ...filterVals, batch_id: e.target.value, section_id: 0 });
                    batchs.map((batch) => batch.id === e.target.value && setSections(batch.sections));
                    sessionStorage.setItem('selectedId', JSON.stringify({ ...filterVals, batch_id: e.target.value, section_id: 0 }))
                  }} disabled={filterVals.dept_id === 0}>
                  <MenuItem value={0} disabled>Select Batch</MenuItem>
                  {batchs.map((batch) => (
                    <MenuItem value={batch.id}>{batch.batch_name}</MenuItem>
                  ))}
                </TextField>
              </div>

              {/* select section */}
              <div className='col-3'>
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
              </div>
            </div>
          </div>


          {/* student datatable */}
          <DataTable
            title={
              <div className='col-4'>
                <div className="input-group">
                  <div className="input-group-text border-0 ps-0"><i className='fas fa-search'></i></div>
                  <input type="text" className="form-control bb-input" placeholder="Search student" value={searchStudents} onChange={(e) => setSearchStudents(e.target.value)} />
                </div>
              </div>
            }
            columns={columns}
            data={filteredStudents}
            pagination
            responsive
            highlightOnHover
            noDataComponent={loading ? <span className="spinner-border my-4" role="status" aria-hidden="true"></span>
              : <div className="text-center my-4">No students found</div>}
            selectableRows
            selectableRowsHighlight
            onSelectedRowsChange={data => setSelectedStudents(data.selectedRows)}
            contextActions={<button className="btn btn-danger me-2 px-3" onClick={() => deleteStudents()}><i className="fas fa-trash-alt"></i></button>}
            clearSelectedRows={loading}
          />
        </div>
      </div>


      {/* add student modal */}
      <ModalDialog
        title={'Add Student'}
        content={
          <div>
            {/* dept, batch, section disabled fields */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth value={filterVals.dept_id} margin='normal' size='small' disabled >
                  {departments.map((department) => (
                    <MenuItem value={department.id}>{department.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField select fullWidth value={filterVals.batch_id} margin='normal' size='small' disabled >
                  {batchs.map((batch) => (
                    <MenuItem value={batch.id}>{batch.batch_name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField select fullWidth value={filterVals.section_id} margin='normal' size='small' disabled >
                  {sections && sections.map((section) => (
                    <MenuItem value={section.id}>{section.section_name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* sid, name, email, phone input fields */}
            <TextField label="Student ID" fullWidth value={inputStudent.student_id}
              onChange={(e) => setInputStudent({ ...inputStudent, student_id: e.target.value })} margin='normal' size='small' />

            <TextField label="Name" fullWidth value={inputStudent.name}
              onChange={(e) => setInputStudent({ ...inputStudent, name: e.target.value })} margin='normal' size='small' />

            <TextField label="Email" fullWidth value={inputStudent.email}
              onChange={(e) => setInputStudent({ ...inputStudent, email: e.target.value })} margin='normal' size='small' />

            <TextField label="Phone" fullWidth value={inputStudent.phone}
              onChange={(e) => setInputStudent({ ...inputStudent, phone: e.target.value })} margin='normal' size='small' />
          </div>
        }
        onOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onConfirm={addStudent}
        confirmText={filterVals.section_id !== 0 && 'Add'}
        loading={loading}
      />

      {/* Edit student modal */}


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </div>
  )
}
