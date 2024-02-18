import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import CustomSnackbar from '../../../utilities/SnackBar'
import ModalDialog from '../../../utilities/ModalDialog'
import { Box, MenuItem, TextField } from '@mui/material'
import { Link } from 'react-router-dom'

export default function BatchSection() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState()

  const [departments, setDepartments] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState(0)
  const [inputBatch, setInputBatch] = useState({ dept_id: '', batch_name: '' })
  const [inputSections, setInputSections] = useState([[]])

  const [batchs, setBatchs] = useState([])
  const [searchBatchs, setSearchBatchs] = useState('')
  const [filteredBatchs, setFilteredBatchs] = useState([])

  const [editableBatch, setEditableBatch] = useState({})
  const [showEditBatchModal, setShowEditBatchModal] = useState(false)
  const [showAddBatchModal, setShowAddBatchModal] = useState(false)

  // console.log(editableBatch)
  // add & remove input field
  const handleAddField = () => {
    setInputSections([...inputSections, []])
  }
  const handleInputChange = (value, index) => {
    const list = [...inputSections];
    list[index] = value.target.value;
    setInputSections(list);
  }
  const handleRemoveInput = (index) => {
    const list = [...inputSections];
    list.splice(index, 1);
    setInputSections(list);
  }

  // add, change & remove edit inputs
  const handleAddEditField = () => {
    setEditableBatch({ ...editableBatch, sections: [...editableBatch.sections, { section_name: '' }] })
  }
  const handleEditInputChange = (field, value, index) => {
    const list = [...editableBatch.sections];
    list[index][field] = value.target.value;
    setEditableBatch({ ...editableBatch, sections: list });
  }
  const handleRemoveEditInput = (index) => {
    const list = [...editableBatch.sections];
    list.splice(index, 1);
    setEditableBatch({ ...editableBatch, sections: list });
  }


  // get all batchs
  const getBatchs = useCallback((id) => {
    setLoading(true)
    axios.get(`/api/${role}/batch_section/${id}`).then(res => {
      if (res.status === 200) {
        setBatchs(res.data.batches)
        setFilteredBatchs(res.data.batches)
        setLoading(false)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    });
  }, [role])

  // get departments
  const getDepartments = useCallback((getBatch) => {
    setLoading(true)
    axios.get('/api/admin/departments').then(res => {
      if (res.status === 200) {
        setDepartments(res.data.departments)
        if (getBatch === 1) {
          getBatchs(res.data.departments[0].id)
          setSelectedDepartment(res.data.departments[0].id)
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
    });
  }, [getBatchs])

  // add batch
  const addBatch = (e) => {
    e.preventDefault()
    setLoading(true)
    let data = { batch: inputBatch, sections: inputSections }
    axios.post(`/api/${role}/batch_section`, data).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getBatchs(selectedDepartment)
        setLoading(false)
        setShowAddBatchModal(false)
        setInputBatch({ dept_id: '', batch_name: '' })
        setInputSections([[]])
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

  // update batch
  const updateBatch = (e) => {
    e.preventDefault()
    setLoading(true)
    axios.put(`/api/${role}/batch_section/${editableBatch.id}`, editableBatch).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getBatchs(selectedDepartment)
        setLoading(false)
        setShowEditBatchModal(false)
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


  // datatable columns
  const columns = [
    {
      name: 'Name',
      selector: row => row.batch_name,
      cell: row => <Link to={`/${role}/batch-section/batch/${row.id}/statistics`} state={{ batch: row }}
        className='fw-semibold text-dark link h5'>{row.batch_name}</Link>,
      sortable: true,
      wrap: true,
      width: '130px'
    },
    {
      name: 'Total Students',
      selector: row => row.students_count,
      sortable: true,
      wrap: true,
      width: '150px'
    },
    {
      name: 'Sections',
      selector: row => row.sections.map((section) => (
        <span className='btn btn-secondary btn-floating p-2 me-1 my-1'>{section.section_name}</span>
      )),
      sortable: true,
      wrap: true,
    },
    {
      name: 'Action',
      button: true,
      cell: row => <Box className="d-flex">
        <Link to={`/${role}/batch-section/batch/${row.id}/statistics`} state={{ batch: row }}
          className="btn btn-light border border-light-grey btn-sm px-2 me-2">
          <i className="fas fa-eye"></i>
        </Link>
        <button className="btn btn-secondary btn-sm px-2" onClick={() => { setEditableBatch(row); setShowEditBatchModal(true) }}>
          <i className="fas fa-edit" ></i></button >
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
        getBatchs(modDeptId);
        setSelectedDepartment(modDeptId);
        setInputBatch({ ...inputBatch, dept_id: modDeptId });
      }
    } else if (role === 'admin') {
      if (sessionStorage.getItem('selectedId')) {
        setSelectedDepartment(JSON.parse(sessionStorage.getItem('selectedId')).dept_id)
        getBatchs(JSON.parse(sessionStorage.getItem('selectedId')).dept_id)
        getDepartments()
      } else {
        getDepartments(1)
      }
    }
  }, [getBatchs, getDepartments, inputBatch, role, selectedDepartment])

  useEffect(() => {
    const filteredData = batchs.filter(batch => {
      return batch.batch_name.toLowerCase().includes(searchBatchs.toLowerCase())
    })
    setFilteredBatchs(filteredData)
  }, [batchs, searchBatchs])


  return (
    <Box className="container">
      <Box className='card my-2'>
        {/* heading sectin */}
        <Box className='card-header d-flex justify-content-between align-items-center'>
          <h5 className='mt-3'>All Batch</h5>
          <button onClick={() => setShowAddBatchModal(true)} className="btn btn-secondary"><i className="fas fa-plus me-1"></i> Add Batch</button>
        </Box>

        {/* body section */}
        <Box className='card-body pt-2'>
          <DataTable
            title={
              <Box className="row">
                {role === 'admin' &&
                  <Box className='col-3'>
                    <TextField select fullWidth margin='small' size='small' value={selectedDepartment}
                      onChange={(e) => {
                        setSelectedDepartment(e.target.value);
                        getBatchs(e.target.value)
                        sessionStorage.setItem('selectedId', JSON.stringify({ dept_id: e.target.value, batch_id: 0, section_id: 0 }))
                      }}>
                      <MenuItem value={0} disabled>Select Department</MenuItem>
                      {departments.map((department) => (
                        <MenuItem value={department.id}>{department.name}</MenuItem>
                      ))}
                    </TextField>
                  </Box>
                }
                <Box className='col-4'>
                  <Box className="input-group">
                    <Box className="input-group-text border-0 ps-0"><i className='fas fa-search'></i></Box>
                    <input type="text" className="form-control bb-input" placeholder="Search batch" value={searchBatchs} onChange={(e) => setSearchBatchs(e.target.value)} />
                  </Box>
                </Box>
              </Box>
            }
            columns={columns}
            data={filteredBatchs}
            pagination
            responsive
            highlightOnHover
            noDataComponent={loading ? <span className="spinner-border my-4" role="status" aria-hidden="true"></span>
              : <span className='my-4'>No data found</span>}
          />
        </Box>


        {/* Edit batch-section modal */}
        <ModalDialog
          title={'Edit Batch'}
          onOpen={showEditBatchModal}
          content={
            <Box style={{ maxWidth: '350px' }}>
              <form onSubmit={updateBatch}>
                <TextField label="Batch Name" value={editableBatch.batch_name}
                  onChange={(e) => setEditableBatch({ ...editableBatch, batch_name: e.target.value })} fullWidth margin='normal' size='small' />

                {/* Sections input */}
                <Box className='border p-3 pe-1 mt-3 rounded-5'>
                  <label htmlFor="section" className="form-label mb-3">Sections</label>
                  {editableBatch.sections?.map((inputValue, index) => {
                    return (
                      <Box className="mb-3 d-flex">
                        <TextField fullWidth label="Section name" value={inputValue.section_name}
                          onChange={(e) => handleEditInputChange('section_name', e, index)} size='small' />

                        <button type="button" onClick={() => handleRemoveEditInput(index)}
                          className='btn btn-light btn-floating btn-sm ms-1 mt-1'><i className="fas fa-times"></i></button>
                      </Box>
                    )
                  })}
                  <Box><button type="button" onClick={() => handleAddEditField()} className="btn btn-rounded btn-sm bg-light text-dark">
                    <i className="fas fa-plus me-1"></i> New</button></Box>
                </Box>
              </form>

              <p className='text-danger mt-3'>
                <i className="fas fa-exclamation-triangle me-1"></i>
                <span>Removing a section will also delete all students from that section.</span>
              </p>
            </Box>
          }
          onClose={() => setShowEditBatchModal(false)}
          confirmText={'Update'}
          onConfirm={updateBatch}
          loading={loading}
        />


        {/* Add batch modal */}
        <ModalDialog
          title={'Add Batch'}
          onOpen={showAddBatchModal}
          content={
            <form onSubmit={addBatch} style={{ maxWidth: '350px' }}>
              {role === 'admin' &&
                <TextField label="Department" select value={inputBatch.dept_id}
                  onChange={(e) => setInputBatch({ ...inputBatch, dept_id: e.target.value })} fullWidth margin='normal' size='small'>
                  {departments.map((department) => (
                    <MenuItem value={department.id}>{department.name}</MenuItem>
                  ))}
                </TextField>
              }

              <TextField label="Batch Name" value={inputBatch.batch_name}
                onChange={(e) => setInputBatch({ ...inputBatch, batch_name: e.target.value })} fullWidth margin='normal' size='small' />

              {/* Sections input */}
              <Box className='border p-3 pe-1 mt-3 rounded-5'>
                <label htmlFor="section" className="form-label mb-3">Sections</label>
                {inputSections.map((inputValue, index) => {
                  return (
                    <Box className="mb-3 d-flex">
                      <TextField fullWidth label="Section name" value={inputValue}
                        onChange={(e) => handleInputChange(e, index)} size='small' />

                      <button type="button" onClick={() => handleRemoveInput(index)}
                        className='btn btn-light btn-floating btn-sm ms-1 mt-1'><i className="fas fa-times"></i></button>
                    </Box>
                  )
                })}
                <Box><button type="button" onClick={() => handleAddField()} className="btn btn-rounded btn-sm bg-light text-dark">
                  <i className="fas fa-plus me-1"></i> New</button></Box>
              </Box>
            </form>
          }
          onClose={() => setShowAddBatchModal(false)}
          confirmText={'Add Batch'}
          onConfirm={addBatch}
          loading={loading}
        />

        {/* Utilities */}
        <CustomSnackbar message={error} status={'error'} />
        <CustomSnackbar message={success} status={'success'} />
      </Box>
    </Box>
  )
}
