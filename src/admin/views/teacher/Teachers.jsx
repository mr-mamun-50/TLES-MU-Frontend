/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import Swal from 'sweetalert2'
import CustomSnackbar from '../../../utilities/SnackBar'
import ModalDialog from '../../../utilities/ModalDialog'
import { MenuItem, TextField } from '@mui/material'

export default function Teachers() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    axios.post('/api/admin/teachers/register', inputTeacher).then(res => {
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
  const getTeachers = (id) => {
    setLoading(true)
    axios.get(`/api/admin/teachers/${id}`).then(res => {
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
  }

  // update teacher
  const updateTeacher = (e) => {
    e.preventDefault()
    setLoading(true)
    axios.put(`/api/admin/teachers/${editableTeacher.id}`, editableTeacher).then(res => {
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
        axios.post('/api/admin/teachers/delete', deletableId).then(res => {
          if (res.status === 200) {
            setSuccess(res.data.message)
            getTeachers(selectedDepartment)
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
    })
  }


  // datatable columns
  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
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
      cell: row => <button className="btn btn-secondary btn-sm px-2"
        onClick={() => { setEditableTeacher(row); setShowEditTeacherModal(true) }}><i className="fas fa-edit" ></i></button >,
    }
  ]


  useEffect(() => {
    if (sessionStorage.getItem('selectedId')) {
      setSelectedDepartment(JSON.parse(sessionStorage.getItem('selectedId')).dept_id)
      getTeachers(JSON.parse(sessionStorage.getItem('selectedId')).dept_id)
    } else {
      getTeachers(0)
    }
    getDepartments()
  }, [])

  useEffect(() => {
    const filteredData = teachers.filter(teacher => {
      return teacher.name.toLowerCase().includes(searchTeachers.toLowerCase())
        || teacher.email.toLowerCase().includes(searchTeachers.toLowerCase())
    })
    setFilteredTeachers(filteredData)
  }, [teachers, searchTeachers])


  return (
    <div className="container">
      <div className='card my-2'>
        <div className='card-header d-flex justify-content-between align-items-center'>
          <h5 className='mt-3'>All Teacher</h5>
          <button onClick={() => setShowAddTeacherModal(true)} className="btn btn-secondary">Add Teacher</button>
        </div>

        <div className='card-body pt-2'>
          <DataTable
            title={
              <div className="row">
                <div className='col-3'>
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
                </div>
                <div className='col-4'>
                  <div className="input-group">
                    <div className="input-group-text border-0 ps-0"><i className='fas fa-search'></i></div>
                    <input type="text" className="form-control bb-input" placeholder="Search teacher" value={searchTeachers} onChange={(e) => setSearchTeachers(e.target.value)} />
                  </div>
                </div>
              </div>
            }
            columns={columns}
            data={filteredTeachers}
            pagination
            responsive
            highlightOnHover
            noDataComponent={loading ? <span className="spinner-border my-4" role="status" aria-hidden="true"></span>
              : <div className="text-center my-4">No teachers found</div>}
            selectableRows
            selectableRowsHighlight
            onSelectedRowsChange={data => setSelectedTeachers(data.selectedRows)}
            contextActions={<button className="btn btn-danger me-2 px-3" onClick={() => deleteTeachers()}><i className="fas fa-trash-alt"></i></button>}
            clearSelectedRows={loading}
          />
        </div>


        {/* Edit teacher modal */}
        <ModalDialog
          title={'Edit Teacher'}
          onOpen={showEditTeacherModal}
          content={
            <form onSubmit={updateTeacher} style={{ minWidth: '350px' }}>

              <TextField label="Name" fullWidth value={editableTeacher.name}
                onChange={(e) => setEditableTeacher({ ...editableTeacher, name: e.target.value })} margin='normal' size='small' />

              <TextField label="Email" fullWidth value={editableTeacher.email}
                onChange={(e) => setEditableTeacher({ ...editableTeacher, email: e.target.value })} margin='normal' size='small' />

              <TextField label="Department" select value={editableTeacher.dept_id}
                onChange={(e) => setEditableTeacher({ ...editableTeacher, dept_id: e.target.value })} fullWidth margin='normal' size='small'>
                {departments.map((department) => (
                  <MenuItem value={department.id}>{department.name}</MenuItem>
                ))}
              </TextField>

            </form>
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
            <form onSubmit={addTeacher} style={{ minWidth: '350px' }}>

              <TextField label="Name" fullWidth value={inputTeacher.name}
                onChange={(e) => setInputTeacher({ ...inputTeacher, name: e.target.value })} margin='normal' size='small' />

              <TextField label="Email" fullWidth value={inputTeacher.email}
                onChange={(e) => setInputTeacher({ ...inputTeacher, email: e.target.value })} margin='normal' size='small' />

              <TextField label="Department" select value={inputTeacher.dept_id}
                onChange={(e) => setInputTeacher({ ...inputTeacher, dept_id: e.target.value })} fullWidth margin='normal' size='small'>
                {departments.map((department) => (
                  <MenuItem value={department.id}>{department.name}</MenuItem>
                ))}
              </TextField>

            </form>
          }
          onClose={() => setShowAddTeacherModal(false)}
          confirmText={'Add Teacher'}
          onConfirm={addTeacher}
          loading={loading}
        />

        {/* Utilities */}
        <CustomSnackbar message={error} status={'error'} />
        <CustomSnackbar message={success} status={'success'} />
      </div>
    </div>
  )
}
