import { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import CustomSnackbar from '../../../utilities/SnackBar'
import ModalDialog from '../../../utilities/ModalDialog'
import { Box, MenuItem, Tab, TextField } from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

export default function Moderators() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [inputModerator, setInputModerator] = useState({ name: '', email: '', dept_id: '' })
  const [departments, setDepartments] = useState([])

  const [moderators, setModerators] = useState([])
  const [searchModerators, setSearchModerators] = useState('')
  const [filteredModerators, setFilteredModerators] = useState([])

  const [editableModerator, setEditableModerator] = useState({})
  const [inputPassword, setInputPassword] = useState({})
  const [selectedModerators, setSelectedModerators] = useState([])
  const [showAddModeratorModal, setShowAddModeratorModal] = useState(false)
  const [showEditModeratorModal, setShowEditModeratorModal] = useState(false)
  const [tabIndex, setTabIndex] = useState('1');
  const [deleteModInput, setDeleteModInput] = useState('')
  const [showModDelete, setShowModDelete] = useState(false)

  // console.log(moderators)
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

  // add moderator
  const addModerator = (e) => {
    e.preventDefault()
    setLoading(true)
    axios.post('/api/admin/moderators/register', inputModerator).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getModerators()
        setShowAddModeratorModal(false)
        setInputModerator({ name: '', email: '', dept_id: '' })
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

  // get all moderators
  const getModerators = () => {
    setLoading(true)
    axios.get(`/api/admin/moderators`).then(res => {
      if (res.status === 200) {
        setModerators(res.data.moderators)
        setFilteredModerators(res.data.moderators)
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

  // update moderator
  const updateModerator = (e) => {
    e.preventDefault()
    setLoading(true)
    axios.put(`/api/admin/moderators/${editableModerator.id}`, editableModerator).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getModerators()
        setShowEditModeratorModal(false)
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

  // update password
  const updatePassword = () => {
    if (inputPassword.password !== inputPassword.confirm_password) {
      setError('Password does not match')
      return;
    }
    setLoading(true)
    axios.put(`/api/admin/moderators/password/${editableModerator.id}`, inputPassword).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        setShowEditModeratorModal(false)
        setInputPassword({})
        setTimeout(() => { setSuccess('') }, 5000)
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
  }

  // delete central routine
  const deleteModerators = () => {
    let deletableId = { deletableId: selectedModerators.map((moderator) => moderator.id) }

    setLoading(true)
    axios.post('/api/admin/moderators/delete', deletableId).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        getModerators()
        setShowModDelete(false)
        setDeleteModInput('')
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
        onClick={() => { setEditableModerator(row); setShowEditModeratorModal(true) }}><i className="fas fa-edit" ></i></button >,
    }
  ]


  useEffect(() => {
    getModerators()
    getDepartments()
  }, [])

  useEffect(() => {
    const filteredData = moderators.filter(moderator => {
      return moderator.name.toLowerCase().includes(searchModerators.toLowerCase())
        || moderator.email.toLowerCase().includes(searchModerators.toLowerCase())
    })
    setFilteredModerators(filteredData)
  }, [moderators, searchModerators])


  return (
    <div className="container">
      <div className='card my-2'>
        <div className='card-header d-flex justify-content-between align-items-center'>
          <h5 className='mt-3'>Head of Departments</h5>
          <button onClick={() => setShowAddModeratorModal(true)} className="btn btn-secondary"><i className="fas fa-plus me-1"></i> Add account</button>
        </div>

        <div className='card-body pt-2'>
          <DataTable
            title={
              <div className="row">
                <div className='col-4'>
                  <div className="input-group">
                    <div className="input-group-text border-0 ps-0"><i className='fas fa-search'></i></div>
                    <input type="text" className="form-control bb-input" placeholder="Search account" value={searchModerators} onChange={(e) => setSearchModerators(e.target.value)} />
                  </div>
                </div>
              </div>
            }
            columns={columns}
            data={filteredModerators}
            pagination
            responsive
            highlightOnHover
            noDataComponent={loading ? <span className="spinner-border my-4" role="status" aria-hidden="true"></span>
              : <div className="text-center my-4">No accounts found</div>}
            selectableRows
            selectableRowsHighlight
            onSelectedRowsChange={data => setSelectedModerators(data.selectedRows)}
            contextActions={<button className="btn btn-danger me-2 px-3" onClick={() => setShowModDelete(true)}><i className="fas fa-trash-alt"></i></button>}
            clearSelectedRows={loading}
          />
        </div>


        {/* Edit moderator modal */}
        <ModalDialog
          title={'Edit account'}
          onOpen={showEditModeratorModal}
          content={
            <Box style={{ maxWidth: '350px' }}>
              <TabContext value={tabIndex}>
                <TabList onChange={(_e, val) => { setTabIndex(val), sessionStorage.setItem('selected-class-tab', val) }} className='mb-3 bg-light rounded'>
                  <Tab label="Basic Info" value='1' className='w-50' />
                  <Tab label="Password" value='2' className='w-50' />
                </TabList>

                <TabPanel value='1' className='p-0'>
                  <form onSubmit={updateModerator}>

                    <TextField label="Name" fullWidth value={editableModerator.name}
                      onChange={(e) => setEditableModerator({ ...editableModerator, name: e.target.value })} margin='normal' size='small' />

                    <TextField label="Email" fullWidth value={editableModerator.email}
                      onChange={(e) => setEditableModerator({ ...editableModerator, email: e.target.value })} margin='normal' size='small' />

                    <TextField label="Department" select value={editableModerator.dept_id}
                      onChange={(e) => setEditableModerator({ ...editableModerator, dept_id: e.target.value })} fullWidth margin='normal' size='small'>
                      {departments.map((department) => (
                        <MenuItem value={department.id}>{department.name}</MenuItem>
                      ))}
                    </TextField>

                  </form>
                </TabPanel>

                <TabPanel value='2' className='p-0'>
                  <form onSubmit={updatePassword}>

                    <TextField label="New Password" fullWidth value={inputPassword.password}
                      onChange={(e) => setInputPassword({ ...inputPassword, password: e.target.value })} margin='normal' size='small' type='password' />

                    <TextField label="Confirm Password" fullWidth value={inputPassword.confirm_password}
                      onChange={(e) => setInputPassword({ ...inputPassword, confirm_password: e.target.value })} margin='normal' size='small' type='password' />

                  </form>
                </TabPanel>
              </TabContext>
            </Box>
          }
          onClose={() => setShowEditModeratorModal(false)}
          confirmText={tabIndex === '1' ? 'Update Info' : 'Update Password'}
          onConfirm={tabIndex === '1' ? updateModerator : updatePassword}
          loading={loading}
        />


        {/* Add moderator modal */}
        <ModalDialog
          title={'Register New Account'}
          onOpen={showAddModeratorModal}
          content={
            <Box style={{ maxWidth: '350px' }}>
              <form onSubmit={addModerator} style={{ minWidth: '350px' }}>

                <TextField label="Name" fullWidth value={inputModerator.name}
                  onChange={(e) => setInputModerator({ ...inputModerator, name: e.target.value })} margin='normal' size='small' />

                <TextField label="Email" fullWidth value={inputModerator.email}
                  onChange={(e) => setInputModerator({ ...inputModerator, email: e.target.value })} margin='normal' size='small' />

                <TextField label="Department" select value={inputModerator.dept_id}
                  onChange={(e) => setInputModerator({ ...inputModerator, dept_id: e.target.value })} fullWidth margin='normal' size='small'>
                  {departments.map((department) => (
                    <MenuItem value={department.id}>{department.name}</MenuItem>
                  ))}
                </TextField>

              </form>
            </Box>
          }
          onClose={() => setShowAddModeratorModal(false)}
          confirmText={'Register'}
          onConfirm={addModerator}
          loading={loading}
        />


        {/* delete account modal */}
        <ModalDialog
          title={`Detete selected account?`}
          content={
            <div className='mt-2'>
              <p className='fw-bold mb-0'>Are you sure you want to remove this?</p>
              <p className='mb-4'>This action cannot be undone.</p>

              {/* type the username to delete account */}
              <p className='mb-2'>To confirm deletion, type <b>delete</b> in the text input field.</p>
              <TextField placeholder='delete' type="text" value={deleteModInput}
                onChange={(e) => setDeleteModInput(e.target.value)} fullWidth size='small' />
            </div>
          }
          onOpen={showModDelete}
          onClose={() => { setShowModDelete(false); setDeleteModInput('') }}
          confirmText={'Delete Account'}
          actionColor={'error'}
          disabledAction={deleteModInput !== 'delete'}
          onConfirm={deleteModerators}
          loading={loading}
        />

        {/* Utilities */}
        <CustomSnackbar message={error} status={'error'} />
        <CustomSnackbar message={success} status={'success'} />
      </div>
    </div>
  )
}
