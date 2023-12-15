import { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import Swal from 'sweetalert2'
import CustomSnackbar from '../../../utilities/SnackBar'
import ModalDialog from '../../../utilities/ModalDialog'
import { TextField } from '@mui/material'

export default function Departments() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [departments, setDepartments] = useState([])
  const [searchDepartment, setSearchDepartment] = useState('')
  const [filteredDepartment, setFilteredDepartment] = useState([])

  const [inputDepartments, setInputDepartments] = useState([[]])
  const [selectedDepartments, setSelectedDepartments] = useState([])

  const [editableDepartment, setEditableDepartment] = useState([])
  const [showEditDeptModal, setShowEditDeptModal] = useState(false)
  const [showAddDeptModal, setShowAddDeptModal] = useState(false)

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
        axios.post('/api/admin/departments/delete', deletableId).then(res => {
          if (res.status === 200) {
            getDepartments()
            setSelectedDepartments([])
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
    <div className='card'>
      <div className='card-header'>
        <h5 className='mt-3'>Departments</h5>
      </div>
      <div className='card-body pt-2'>
        <DataTable
          title={
            <div>
              <div className="w-100 d-flex align-items-center justify-content-between my-2">
                <div className="input-group w-50">
                  <div className="input-group-text border-0 ps-0"><i className='fas fa-search'></i></div>
                  <input type="text" className="form-control bb-input" placeholder="Search department" value={searchDepartment} onChange={(e) => setSearchDepartment(e.target.value)} />
                </div>
                <button onClick={() => setShowAddDeptModal(true)} className="btn btn-primary">Add Department</button>
              </div>
            </div>
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
          contextActions={<button className="btn btn-danger me-2 px-3" onClick={() => deleteDepartments()}><i className="fas fa-trash-alt"></i></button>}
          clearSelectedRows={loading}
        />
      </div>



      {/* add dept. modal */}
      <ModalDialog
        title={'Add Department'}
        content={
          <form onSubmit={addDepartments} style={{ minWidth: '350px' }}>

            {inputDepartments.map((inputValue, index) => {
              return (
                <div className='d-flex align-items-center' key={index}>
                  <TextField label="Enter department name" variant="outlined" value={inputValue}
                    onChange={(e) => handleInputChange(e, index)} fullWidth margin='normal' size='small' />
                  <button type="button" onClick={() => handleRemoveInput(index)} className='btn btn-light btn-floating mt-2'>
                    <i className="fas fa-times"></i></button>
                </div>
              )
            })}
            <button type="button" onClick={() => handleAddField()} className="btn btn-rounded btn-sm bg-light"><i className="fas fa-plus me-1"></i> New</button>
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

      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </div >
  )
}
