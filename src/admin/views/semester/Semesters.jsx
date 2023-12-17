import React, { useEffect, useState } from 'react'
import CustomSnackbar from '../../../utilities/SnackBar'
import { TextField } from '@mui/material'
import ModalDialog from '../../../utilities/ModalDialog'
import axios from 'axios'
import AssignCourse from './AssignCourse'

export default function Semesters() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [semesters, setSemesters] = useState([])
  const [selectedSemester, setSelectedSemester] = useState(0)

  const semesterOpt = { name: '', start_date: convertDate(new Date()), end_date: convertDate(new Date().setMonth(+16)) }
  const [inputSemester, setInputSemester] = useState(semesterOpt)

  // show hide modals
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false)

  console.log(semesters)

  // get semesters
  const getSemesters = () => {
    setLoading(true)
    axios.get(`/api/admin/semesters`).then(res => {
      if (res.status === 200) {
        setSemesters(res.data.semesters)
        setSelectedSemester(res.data.semesters[0].id)
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

  // add semester
  const addSemester = () => {
    setLoading(true)
    axios.post('/api/admin/semesters', inputSemester).then(res => {
      setLoading(false)
      if (res.status === 200) {
        setSuccess(res.data.message)
        getSemesters()
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


  useEffect(() => {
    getSemesters()
  }, [])


  return (
    <div className="container">
      <div className="row">
        {/* select semester */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className='card my-2'>
            <div className='card-header d-flex justify-content-between align-items-center'>
              <h5 className='mt-2 mb-0'>Semesters</h5>
              <button className='btn btn-secondary btn-sm' onClick={() => setShowAddSemesterModal(true)}>Add New</button>
            </div>

            <div className="card-body px-3">
              <div className="list-group list-group-light" style={{ height: "300px", overflowY: "scroll" }}>
                {semesters.map((semester) => (
                  <button onClick={() => setSelectedSemester(semester.id)}
                    className={`list-group-item list-group-item-action px-3 py-2 ${selectedSemester === semester.id && 'active'}`}>
                    <i className={`${selectedSemester === semester.id ? 'fas' : 'far'} fa-circle-check me-2`}></i>{semester.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* assign courses */}
        <div className="col-12 col-md-6 col-lg-8">
          <AssignCourse />
        </div>
      </div>



      {/* add semester modal */}
      <ModalDialog
        title={'Add New Semester'}
        content={
          <div style={{ maxWidth: '350px' }}>
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
          </div>
        }
        onOpen={showAddSemesterModal}
        onClose={() => setShowAddSemesterModal(false)}
        onConfirm={addSemester}
        confirmText={'Save'}
        loading={loading}
      />

      {/* Edit semester modal */}


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </div>
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
