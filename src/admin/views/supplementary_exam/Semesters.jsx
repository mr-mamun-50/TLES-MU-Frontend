import { Box } from '@mui/material'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import CustomSnackbar from '../../../utilities/SnackBar'
import AssignSupple from './AssignSupple'

export default function SemestersSFSE() {

  // const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState()

  const [semesters, setSemesters] = useState([])
  const [selectedSemester, setSelectedSemester] = useState({})

  // console.log(semesters)

  // get semesters
  const getSemesters = useCallback((select = false) => {
    axios.get(`/api/${role}/semesters`).then(res => {
      if (res.status === 200) {
        setSemesters(res.data.semesters)
        if (select) {
          setSelectedSemester(res.data.semesters[0])
        }
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    });
  }, [role])


  useEffect(() => {
    localStorage.getItem('role') ?
      setRole(localStorage.getItem('role'))
      : setRole(sessionStorage.getItem('role'));

    if (role) {
      if (sessionStorage.getItem('selectedSemester')) {
        setSelectedSemester(JSON.parse(sessionStorage.getItem('selectedSemester')));
        getSemesters();
      } else {
        getSemesters(true);
      }
    }
  }, [getSemesters, role])



  return (
    <Box className="container">
      <Box className="row">
        {/* select semester */}
        <Box className="col-12 col-md-6 col-lg-3">
          <Box className='card my-2'>
            <Box className='card-header d-flex justify-content-between align-items-center'>
              <h5 className='mt-2 mb-0'>Semesters</h5>
            </Box>

            <Box className="card-body px-3">
              <Box className="list-group list-group-light" style={{ height: "300px", overflowY: "scroll" }}>
                {semesters.map((semester) => (
                  <button key={semester.id} onClick={() => {
                    setSelectedSemester(semester);
                    sessionStorage.setItem('selectedSemester', JSON.stringify(semester));
                  }}
                    className={`list-group-item list-group-item-action px-3 py-2 ${selectedSemester.id === semester.id && 'active'}`}>
                    <i className={`far fa-${selectedSemester.id === semester.id ? 'circle-dot' : 'circle'} me-2`}></i> {semester.name}
                  </button>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* assign courses */}
        <Box className="col-12 col-md-6 col-lg-9">
          {selectedSemester.id && <AssignSupple selectedSemester={selectedSemester} role={role} />}
        </Box>
      </Box>



      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </Box>
  )
}
