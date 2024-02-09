import { Box, MenuItem, TextField } from "@mui/material";
import DashboardCountShowCard from "../components/DashboardCountShowCard";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import CustomSnackbar from "../../utilities/SnackBar";
import DashboardAvgBloomsLevels from "../components/DashboardAvgBloomsLevels";
import DashboardAvgGpa from "../components/DashboardAvgGpa";

export default function UserDashboard() {

  // const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [dashboardContent, setDashboardContent] = useState({});
  const [semesters, setSemesters] = useState([])
  const [selectedSemester, setSelectedSemester] = useState(0)

  // get batch students info of a batch
  const getDashboardContent = useCallback(() => {
    setLoading(true)
    axios.get(`/api/user/dashboard/${selectedSemester}`).then(res => {
      if (res.status === 200) {
        setDashboardContent(res.data.content)
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
  }, [selectedSemester])

  // get semesters
  const getSemesters = useCallback(() => {
    setLoading(true)
    axios.get(`/api/user/semesters`).then(res => {
      if (res.status === 200) {
        setSemesters(res.data.semesters)
        setSelectedSemester(res.data.semesters[0].id)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    });
  }, [])


  useEffect(() => {
    getSemesters()
  }, [getSemesters])

  useEffect(() => {
    if (selectedSemester !== 0) {
      getDashboardContent()
    }
  }, [getDashboardContent, selectedSemester])




  return (
    <Box className="container">
      {/* title and select semester */}
      <Box className='card-header d-flex justify-content-between align-items-center mb-3'>
        <h5 className='mt-2'>Dashboard</h5>

        <Box className="col-6 col-md-3 col-xl-2">
          <TextField select fullWidth margin='small' size='small' value={selectedSemester}
            onChange={(e) => { setSelectedSemester(e.target.value); }}>
            {semesters.map(semester =>
              <MenuItem key={semester.id} value={semester.id}>{semester.name}</MenuItem>
            )}
          </TextField>
        </Box>
      </Box>


      {loading ? <Box className="text-center"><span className="spinner-border my-5" role="status"></span></Box>
        :
        <Box className="row my-2">

          {/* heading cards */}
          <DashboardCountShowCard label={'Semester Classes'} count={dashboardContent.assigned_classes_count}
            icon={'fas fa-chalkboard-user'} color={'success'} />

          <DashboardCountShowCard label={'Assigned Students'} count={dashboardContent.assigned_students}
            icon={'fas fa-people-roof'} color={'info'} />

          <DashboardCountShowCard label={'Retaking Students'} count={dashboardContent.retake_students}
            icon={'fas fa-person-walking-arrow-loop-left'} color={'danger'} />

          <DashboardCountShowCard label={'Total Conducted Classes'} count={dashboardContent.total_classes}
            icon={'fas fa-clipboard-check'} color={'primary'} />


          {/* blooms level counts */}
          <Box className="col-12 col-lg-8 mb-4">
            <Box className="card h-100">
              <Box className="card-header">
                <h6 className="my-2">Average Blooms Levels of My Classes</h6>
              </Box>

              <Box className="card-body">
                {dashboardContent.assigned_classes?.length > 0 ?
                  <DashboardAvgBloomsLevels
                    current_classes={dashboardContent.assigned_classes}
                  />
                  : <Box className='text-center my-5'>Not enough data to show this report</Box>
                }
              </Box>
            </Box>
          </Box>

          {/* average GPA of my classes */}
          <Box className="col-12 col-lg-4 mb-4">
            <Box className="card h-100">
              <Box className="card-header">
                <h6 className="my-2">Average GPA of My Classes</h6>
              </Box>

              <Box className="card-body">
                {dashboardContent.assigned_classes?.length > 0 ?
                  <DashboardAvgGpa
                    current_classes={dashboardContent.assigned_classes}
                  />
                  : <Box className='text-center my-5'>Not enough data to show this report</Box>
                }
              </Box>
            </Box>
          </Box>

        </Box>
      }



      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </Box>
  )
}
