import { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import CustomSnackbar from '../../../utilities/SnackBar'
import ModalDialog from '../../../utilities/ModalDialog'
import { Box, TextField } from '@mui/material'
import Courses from './Courses'

export default function Departments() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [departments, setDepartments] = useState([])
  const [searchDepartment, setSearchDepartment] = useState('')
  const [filteredDepartment, setFilteredDepartment] = useState([])

  const [inputDepartments, setInputDepartments] = useState([[]])
  const [selectedDepartments, setSelectedDepartments] = useState([])
  const [deleteDeptInput, setDeleteDeptInput] = useState('')

  const [editableDepartment, setEditableDepartment] = useState([])
  const [showEditDeptModal, setShowEditDeptModal] = useState(false)
  const [showAddDeptModal, setShowAddDeptModal] = useState(false)
  const [showDeptDelete, setShowDeptDelete] = useState(false)

  // add & remove input field
  const handleAddField = () => {
    setInputDepartments([...inputDepartments, []])
  }
  const handleInputChange = (value, index) => {
    const list = [...inputDepartments];
    list[index] = value.target.value;
    setInputDepartments(list);
  }
  const handleRemoveInput = (index) => {
    const list = [...inputDepartments];
    list.splice(index, 1);
    setInputDepartments(list);
  }

  // add exam departments
  const addDepartments = (e) => {
    e.preventDefault();

    let data = { departments: inputDepartments }
    setLoading(true)

    axios.post('/api/admin/departments', data).then(res => {
      if (res.status === 200) {
        getDepartments()
        setInputDepartments([[]])
        setShowAddDeptModal(false)
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

  // delete exam departments
  const deleteDepartments = () => {
    let deletableId = { deletableId: selectedDepartments.map((department) => department.id) }
    setLoading(true)
    axios.post('/api/admin/departments/delete', deletableId).then(res => {
      if (res.status === 200) {
        getDepartments()
        setSelectedDepartments([])
        setShowDeptDelete(false)
        setDeleteDeptInput('')
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

  // update exam departments
  const updateDepartments = (e) => {
    e.preventDefault();

    let data = { name: editableDepartment.name }
    setLoading(true)

    axios.put(`/api/admin/departments/${editableDepartment.id}`, data).then(res => {
      if (res.status === 200) {
        getDepartments()
        setShowEditDeptModal(false)
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

  // get exam departments
  const getDepartments = () => {
    setLoading(true)
    axios.get('/api/admin/departments').then(res => {
      if (res.status === 200) {
        setDepartments(res.data.departments)
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

  // datatable columns
  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Action',
      cell: (row) => <button className="btn btn-secondary btn-sm px-2"
        onClick={() => { setEditableDepartment(row); setShowEditDeptModal(true) }}><i className="fas fa-edit" ></i></button >,
      button: true,
    }
  ]


  useEffect(() => {
    getDepartments()
  }, [])

  useEffect(() => {
    const result = departments.filter((department) => {
      return department.name.toLowerCase().match(searchDepartment.toLowerCase())
    })
    setFilteredDepartment(result)
  }, [departments, searchDepartment])


  return (
    <Box className="container">
      <Box className='row my-2'>

        {/* department section */}
        <Box className='col-lg-5'>
          <Box className='card'>
            <Box className='card-header'>
              <h5 className='mt-3'>Departments</h5>
            </Box>

            <Box className='card-body pt-2'>
              <DataTable
                title={
                  <Box>
                    <Box className="w-100 d-flex align-items-center justify-content-between my-2">
                      <Box className="input-group w-50">
                        <Box className="input-group-text border-0 ps-0"><i className='fas fa-search'></i></Box>
                        <input type="text" className="form-control bb-input" placeholder="Search department" value={searchDepartment} onChange={(e) => setSearchDepartment(e.target.value)} />
                      </Box>
                      <button onClick={() => setShowAddDeptModal(true)} className="btn btn-secondary">Add Department</button>
                    </Box>
                  </Box>
                }
                columns={columns}
                data={filteredDepartment}
                pagination
                responsive
                highlightOnHover
                noDataComponent={loading ? <span className="spinner-border" role="status" aria-hidden="true"></span> : 'No data found'}
                selectableRows
                selectableRowsHighlight
                onSelectedRowsChange={data => setSelectedDepartments(data.selectedRows)}
                contextActions={<button className="btn btn-danger me-2 px-3" onClick={() => setShowDeptDelete(true)}><i className="fas fa-trash-alt"></i></button>}
                clearSelectedRows={loading}
              />
            </Box>
          </Box>
        </Box>

        {/* courses section */}
        <Box className='col-lg-7'>
          <Courses departments={departments} />
        </Box>
      </Box>


      {/* add dept. modal */}
      <ModalDialog
        title={'Add Department'}
        content={
          <form onSubmit={addDepartments} style={{ minWidth: '350px' }}>

            {inputDepartments.map((inputValue, index) => {
              return (
                <Box className='d-flex align-items-center' key={index}>
                  <TextField label="Enter department name" variant="outlined" value={inputValue}
                    onChange={(e) => handleInputChange(e, index)} fullWidth margin='normal' size='small' />
                  <button type="button" onClick={() => handleRemoveInput(index)} className='btn btn-light btn-sm btn-floating mt-2 ms-1'>
                    <i className="fas fa-times"></i></button>
                </Box>
              )
            })}
            <button type="button" onClick={() => handleAddField()} className="btn btn-rounded btn-sm bg-light text-dark">
              <i className="fas fa-plus me-1"></i> New</button>
          </form>
        }
        onOpen={showAddDeptModal}
        onClose={() => setShowAddDeptModal(false)}
        confirmText={'Add Department'}
        onConfirm={addDepartments}
        loading={loading}
      />

      {/* edit dept. modal */}
      <ModalDialog
        title={'Edit Department'}
        content={
          <form onSubmit={updateDepartments} style={{ minWidth: '350px' }}>
            <TextField label="Department Name" variant="outlined" value={editableDepartment.name}
              onChange={(e) => setEditableDepartment({ ...editableDepartment, name: e.target.value })}
              className="mb-3" fullWidth required margin='normal' />
          </form>
        }
        onOpen={showEditDeptModal}
        onClose={() => setShowEditDeptModal(false)}
        confirmText={'Save changes'}
        onConfirm={updateDepartments}
        loading={loading}
      />

      {/* delete dept. modal */}
      <ModalDialog
        title={`Detete selected department?`}
        content={
          <Box className='mt-2' sx={{ maxWidth: '350px' }}>
            <p className='fw-bold mb-0'>Are you sure you want to remove this?</p>
            <p className='mb-4'>{"This action cannot be undone and remove all the studets and data's of this department!"}</p>

            {/* type the username to delete account */}
            <p className='mb-2'>To confirm deletion, type <b>delete</b> in the text input field.</p>
            <TextField placeholder='delete' type="text" value={deleteDeptInput}
              onChange={(e) => setDeleteDeptInput(e.target.value)} fullWidth size='small' />
          </Box>
        }
        onOpen={showDeptDelete}
        onClose={() => { setShowDeptDelete(false); setDeleteDeptInput('') }}
        confirmText={'Delete'}
        actionColor={'error'}
        disabledAction={deleteDeptInput !== 'delete'}
        onConfirm={deleteDepartments}
        loading={loading}
      />

      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </Box>
  )
}
