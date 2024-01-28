import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import CustomSnackbar from '../../../utilities/SnackBar'
import ModalDialog from '../../../utilities/ModalDialog'
import { Box, MenuItem, TextField } from '@mui/material'
import { Link } from 'react-router-dom'

export default function Teachers() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState()

  const [inputTeacher, setInputTeacher] = useState({ name: '', email: '', dept_id: '' })
  const [departments, setDepartments] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState(0)

  const [teachers, setTeachers] = useState([])
  const [searchTeachers, setSearchTeachers] = useState('')
  const [filteredTeachers, setFilteredTeachers] = useState([])

  const [editableTeacher, setEditableTeacher] = useState({})
  const [selectedTeachers, setSelectedTeachers] = useState([])
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false)
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false)
  const [dhowTeacherDelete, setDhowTeacherDelete] = useState('')
  const [showTeacherDelete, setShowTeacherDelete] = useState(false)

  // console.log(teachers)
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

  // add teacher
  const addTeacher = (e) => {
    e.preventDefault()
    setLoading(true)
    axios.post(`/api/${role}/teachers/register`, inputTeacher).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getTeachers(selectedDepartment)
        setShowAddTeacherModal(false)
        setInputTeacher({ name: '', email: '', dept_id: '' })
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

  // get all teachers
  const getTeachers = useCallback((id) => {
    setLoading(true)
    axios.get(`/api/${role}/teachers/${id}`).then(res => {
      if (res.status === 200) {
        setTeachers(res.data.users)
        setFilteredTeachers(res.data.users)
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

  // update teacher
  const updateTeacher = (e) => {
    e.preventDefault()
    setLoading(true)
    axios.put(`/api/${role}/teachers/${editableTeacher.id}`, editableTeacher).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getTeachers(selectedDepartment)
        setShowEditTeacherModal(false)
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

  // delete central routine
  const deleteTeachers = () => {
    let deletableId = { deletableId: selectedTeachers.map((teacher) => teacher.id) }

    setLoading(true)
    axios.post(`/api/${role}/teachers/delete`, deletableId).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getTeachers(selectedDepartment)
        setShowTeacherDelete(false)
        setDhowTeacherDelete('')
        setLoading(false)
        setTimeout(() => { setSuccess('') }, 5000);
      } else {
        setError(res.data.message)
        setLoading(false)
        setTimeout(() => { setError('') }, 5000);
      }
    }).catch(err => {
      setError(err.response.data.message)
      setLoading(false)
      setTimeout(() => { setError('') }, 5000);
    });
  }


  // datatable columns
  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      cell: row => <Link to={`/${role}/teachers/profile/${row.id}`} state={{ profile: row }}
        className='fw-semibold text-dark link'>{row.name}</Link>,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Department',
      selector: row => row.department ? row.department.name : 'N/A',
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
      name: 'Action',
      button: true,
      cell: row => <Box className="d-flex">
        <Link to={`/${role}/teachers/profile/${row.id}`}
          className="btn btn-light border border-light-grey btn-sm px-2 me-2">
          <i className="fas fa-eye"></i>
        </Link>
        <button className="btn btn-secondary btn-sm px-2"
          onClick={() => { setEditableTeacher(row); setShowEditTeacherModal(true) }}><i className="fas fa-edit" ></i></button >
      </Box>,
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
        getTeachers(modDeptId);
        setInputTeacher({ ...inputTeacher, dept_id: modDeptId })
      }
    } else if (role === 'admin') {
      if (sessionStorage.getItem('selectedId')) {
        setSelectedDepartment(JSON.parse(sessionStorage.getItem('selectedId')).dept_id);
        getTeachers(JSON.parse(sessionStorage.getItem('selectedId')).dept_id);
      } else {
        getTeachers(0);
      }
      getDepartments();
    }
  }, [getTeachers, inputTeacher, role, selectedDepartment])


  useEffect(() => {
    const filteredData = teachers.filter(teacher => {
      return teacher.name.toLowerCase().includes(searchTeachers.toLowerCase())
        || teacher.email.toLowerCase().includes(searchTeachers.toLowerCase())
    })
    setFilteredTeachers(filteredData)
  }, [teachers, searchTeachers])


  return (
    <Box className="container">
      <Box className='card my-2'>
        <Box className='card-header d-flex justify-content-between align-items-center'>
          <h5 className='mt-3'>Teachers</h5>
          <button onClick={() => setShowAddTeacherModal(true)} className="btn btn-secondary"><i className="fas fa-plus me-1"></i> Add Teacher</button>
        </Box>

        <Box className='card-body pt-2'>
          <DataTable
            title={
              <Box className="row">
                {role === 'admin' &&
                  <Box className='col-3'>
                    <TextField select fullWidth margin='small' size='small' value={selectedDepartment}
                      onChange={(e) => {
                        setSelectedDepartment(e.target.value);
                        getTeachers(e.target.value)
                        sessionStorage.setItem('selectedId', JSON.stringify({ dept_id: e.target.value, batch_id: 0, section_id: 0 }))
                      }}>
                      <MenuItem value={0}>All Teachers</MenuItem>
                      {departments.map((department) => (
                        <MenuItem value={department.id}>{department.name}</MenuItem>
                      ))}
                    </TextField>
                  </Box>
                }
                <Box className='col-4'>
                  <Box className="input-group">
                    <Box className="input-group-text border-0 ps-0"><i className='fas fa-search'></i></Box>
                    <input type="text" className="form-control bb-input" placeholder="Search teacher" value={searchTeachers} onChange={(e) => setSearchTeachers(e.target.value)} />
                  </Box>
                </Box>
              </Box>
            }
            columns={columns}
            data={filteredTeachers}
            pagination
            responsive
            highlightOnHover
            noDataComponent={loading ? <span className="spinner-border my-4" role="status" aria-hidden="true"></span>
              : <Box className="text-center my-4">No teachers found</Box>}
            selectableRows
            selectableRowsHighlight
            onSelectedRowsChange={data => setSelectedTeachers(data.selectedRows)}
            contextActions={<button className="btn btn-danger me-2 px-3" onClick={() => setShowTeacherDelete(true)}><i className="fas fa-trash-alt"></i></button>}
            clearSelectedRows={loading}
          />
        </Box>


        {/* Edit teacher modal */}
        <ModalDialog
          title={'Edit Teacher'}
          onOpen={showEditTeacherModal}
          content={
            <Box style={{ maxWidth: '350px' }}>
              <form onSubmit={updateTeacher} style={{ minWidth: '350px' }}>

                <TextField label="Name" fullWidth value={editableTeacher.name}
                  onChange={(e) => setEditableTeacher({ ...editableTeacher, name: e.target.value })} margin='normal' size='small' />

                <TextField label="Email" fullWidth value={editableTeacher.email}
                  onChange={(e) => setEditableTeacher({ ...editableTeacher, email: e.target.value })} margin='normal' size='small' />

                {role === 'admin' &&
                  <TextField label="Department" select value={editableTeacher.dept_id}
                    onChange={(e) => setEditableTeacher({ ...editableTeacher, dept_id: e.target.value })} fullWidth margin='normal' size='small'>
                    {departments.map((department) => (
                      <MenuItem value={department.id}>{department.name}</MenuItem>
                    ))}
                  </TextField>
                }
              </form>
            </Box>
          }
          onClose={() => setShowEditTeacherModal(false)}
          confirmText={'Update Teacher'}
          onConfirm={updateTeacher}
          loading={loading}
        />

        {/* Add teacher modal */}
        <ModalDialog
          title={'Add Teacher'}
          onOpen={showAddTeacherModal}
          content={
            <Box style={{ maxWidth: '350px' }}>
              <form onSubmit={addTeacher} style={{ minWidth: '350px' }}>

                <TextField label="Name" fullWidth value={inputTeacher.name}
                  onChange={(e) => setInputTeacher({ ...inputTeacher, name: e.target.value })} margin='normal' size='small' />

                <TextField label="Email" fullWidth value={inputTeacher.email}
                  onChange={(e) => setInputTeacher({ ...inputTeacher, email: e.target.value })} margin='normal' size='small' />

                {role === 'admin' &&
                  <TextField label="Department" select value={inputTeacher.dept_id}
                    onChange={(e) => setInputTeacher({ ...inputTeacher, dept_id: e.target.value })} fullWidth margin='normal' size='small'>
                    {departments.map((department) => (
                      <MenuItem value={department.id}>{department.name}</MenuItem>
                    ))}
                  </TextField>
                }
              </form>
            </Box>
          }
          onClose={() => setShowAddTeacherModal(false)}
          confirmText={'Add Teacher'}
          onConfirm={addTeacher}
          loading={loading}
        />


        {/* delete account modal */}
        <ModalDialog
          title={`Detete selected account?`}
          content={
            <Box className='mt-2' sx={{ maxWidth: '350px' }}>
              <p className='fw-bold mb-0'>Are you sure you want to remove this?</p>
              <p className='mb-4'>This action cannot be undone.</p>

              {/* type the username to delete account */}
              <p className='mb-2'>To confirm deletion, type <b>delete</b> in the text input field.</p>
              <TextField placeholder='delete' type="text" value={dhowTeacherDelete}
                onChange={(e) => setDhowTeacherDelete(e.target.value)} fullWidth size='small' />
            </Box>
          }
          onOpen={showTeacherDelete}
          onClose={() => { setShowTeacherDelete(false); setDhowTeacherDelete('') }}
          confirmText={'Delete Account'}
          actionColor={'error'}
          disabledAction={dhowTeacherDelete !== 'delete'}
          onConfirm={deleteTeachers}
          loading={loading}
        />

        {/* Utilities */}
        <CustomSnackbar message={error} status={'error'} />
        <CustomSnackbar message={success} status={'success'} />
      </Box>
    </Box>
  )
}
