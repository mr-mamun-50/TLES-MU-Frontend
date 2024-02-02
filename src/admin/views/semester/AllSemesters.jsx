import { Box, TextField } from '@mui/material'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import ModalDialog from '../../../utilities/ModalDialog'
import DataTable from 'react-data-table-component'
import CustomSnackbar from '../../../utilities/SnackBar'

export default function AllSemesters() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState()

  const [semesters, setSemesters] = useState([])
  const [filteredSemesters, setFilteredSemesters] = useState([])
  const [searchSemesters, setSearchSemesters] = useState('')

  const semesterOpt = { name: '', start_date: convertDate(new Date()), end_date: convertDate(new Date().setMonth(+16)) }
  const [inputSemester, setInputSemester] = useState(semesterOpt)

  // show hide modals
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false)

  // console.log(semesters)

  // get semesters
  const getSemesters = useCallback(() => {
    setLoading(true)
    axios.get(`/api/${role}/semesters`).then(res => {
      if (res.status === 200) {
        setSemesters(res.data.semesters)
        setFilteredSemesters(res.data.semesters)
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
  }, [role])

  // add semester
  const addSemester = () => {
    setLoading(true)
    axios.post(`/api/${role}/semesters`, inputSemester).then(res => {
      setLoading(false)
      if (res.status === 200) {
        getSemesters()
        setSuccess(res.data.message)
        setInputSemester(semesterOpt)
        setTimeout(() => { setSuccess('') }, 5000)
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


  // datatable columns
  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Session',
      selector: row => row.start_date,
      cell: row => `${new Date(row.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} 
      - ${new Date(row.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Action',
      button: true,
      cell: row => <Box className="d-flex">
        <button className="btn btn-secondary btn-sm px-2"
          onClick={() => { }}><i className="fas fa-edit" ></i></button >
      </Box>,
    }
  ]


  useEffect(() => {
    localStorage.getItem('role') ?
      setRole(localStorage.getItem('role'))
      : setRole(sessionStorage.getItem('role'));

    if (role) {
      getSemesters(true);
    }
  }, [getSemesters, role])


  useEffect(() => {
    const filteredData = semesters.filter(semester => {
      return semester.name.toLowerCase().includes(searchSemesters.toLowerCase());
    })
    setFilteredSemesters(filteredData)
  }, [semesters, searchSemesters])


  return (
    <Box className='container d-flex justify-content-center'>
      <Box className="col-lg-6 my-2">
        <Box className='card my-2'>
          <Box className='card-header d-flex justify-content-between align-items-center py-3'>
            <h5 className='mt-2 mb-0'>Semesters</h5>

            <button className='btn btn-secondary btn-sm' onClick={() => setShowAddSemesterModal(true)}><i className="fas fa-plus me-1"></i> Add New</button>
          </Box>

          <Box className="card-body pt-2">
            <DataTable
              title={
                <Box className="row">
                  <Box className='col-4'>
                    <Box className="input-group">
                      <Box className="input-group-text border-0 ps-0"><i className='fas fa-search'></i></Box>
                      <input type="text" className="form-control bb-input" placeholder="Search semester" value={searchSemesters} onChange={(e) => setSearchSemesters(e.target.value)} />
                    </Box>
                  </Box>
                </Box>
              }
              columns={columns}
              data={filteredSemesters}
              pagination
              responsive
              highlightOnHover
              noDataComponent={loading ? <span className="spinner-border my-4" role="status" aria-hidden="true"></span>
                : <Box className="text-center my-4">No semesters found</Box>}
            />
          </Box>
        </Box>
      </Box>



      {/* add semester modal */}
      <ModalDialog
        title={'Add New Semester'}
        content={
          <Box style={{ maxWidth: '350px' }}>
            {/* semester name */}
            <TextField label="Semester Name" fullWidth value={inputSemester.name}
              onChange={(e) => setInputSemester({ ...inputSemester, name: e.target.value })} margin='normal' size='small' />

            {/* start date */}
            <TextField label="Starting Session" type='month' fullWidth value={inputSemester.start_date}
              onChange={(e) => {
                const startDate = new Date(e.target.value);
                const endDate = new Date(startDate.setMonth(startDate.getMonth() + 5));
                setInputSemester({ ...inputSemester, start_date: e.target.value, end_date: convertDate(endDate) });
              }} margin='normal' size='small' />

            {/* end date */}
            <TextField label="Ending Session" type='month' fullWidth value={inputSemester.end_date}
              onChange={(e) => setInputSemester({ ...inputSemester, end_date: e.target.value })} margin='normal' size='small' />
          </Box>
        }
        onOpen={showAddSemesterModal}
        onClose={() => setShowAddSemesterModal(false)}
        onConfirm={addSemester}
        confirmText={'Save'}
        loading={loading}
      />

      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </Box>
  )


  // convert date function
  function convertDate(inputDate) {
    const date = new Date(inputDate);

    // Get the components of the date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Assemble the formatted date
    const formattedDate = `${year}-${month}`;

    return formattedDate;
  }
}
