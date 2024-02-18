import { Box, MenuItem, TextField } from "@mui/material";
import DashboardCountShowCard from "../components/DashboardCountShowCard";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import CustomSnackbar from "../../utilities/SnackBar";
import DashboardAvgBloomsLevels from "../components/DashboardAvgBloomsLevels";
import DashboardAvgGpa from "../components/DashboardAvgGpa";
import { useReactToPrint } from 'react-to-print';
import { UserDashboardPrint } from "./print_views/UserDashboard";

export default function UserDashboard() {

  // const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const teacher = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));

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
  const getSemesters = (select = false) => {
    setLoading(true)
    axios.get(`/api/user/semesters`).then(res => {
      if (res.status === 200) {
        setSemesters(res.data.semesters)
        if (select) {
          setSelectedSemester(res.data.semesters[0].id)
        }
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    });
  }


  useEffect(() => {
    if (sessionStorage.getItem('selectedSemester')) {
      setSelectedSemester(JSON.parse(sessionStorage.getItem('selectedSemester')).id);
      getSemesters();
    } else {
      getSemesters(true);
    }
  }, [])

  useEffect(() => {
    if (selectedSemester !== 0) {
      getDashboardContent()
    }
  }, [getDashboardContent, selectedSemester])


  const componentRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useReactToPrint({
    documentTitle: `Teacher Dashboard - ${teacher.name}`,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    },
    content: () => componentRef.current,
    onAfterPrint: () => {
      setIsPrinting(false);
    }
  });


  return (
    <Box className="container">
      {/* title and select semester */}
      <Box className='d-flex justify-content-between align-items-center mb-3'>
        <h5 className='mt-2'>Dashboard</h5>

        <Box className="col-7 col-md-5 col-xl-3 d-flex">
          <TextField select fullWidth margin='small' size='small' value={selectedSemester}
            onChange={(e) => {
              setSelectedSemester(e.target.value);
              sessionStorage.setItem('selectedSemester', JSON.stringify({ id: e.target.value, name: '' }))
            }}>
            {semesters.map(semester =>
              <MenuItem key={semester.id} value={semester.id}>{semester.name}</MenuItem>
            )}
          </TextField>

          {/* print button */}
          <button className="btn btn-outline-dark border-grey ms-2 d-flex align-items-center" onClick={handlePrint}>
            <i className="fas fa-print me-2"></i> Print
          </button>
        </Box>
      </Box>


      {loading ? <Box className="text-center"><span className="spinner-border my-5" role="status"></span></Box>
        :
        <Box className="row my-2" id="pdf-content">

          {/* heading cards */}
          <DashboardCountShowCard label={'Total Courses'} count={dashboardContent.assigned_classes_count}
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
                {/* <h6 className="my-2">Average Blooms Levels of Classes</h6> */}
                <h6 className="my-2">Total Attainment</h6>
              </Box>

              <Box className="card-body">
                {dashboardContent.assigned_classes?.length > 0 ?
                  <DashboardAvgBloomsLevels
                    current_classes={dashboardContent.assigned_classes}
                  />
                  : <Box className='text-center text-dark my-5'>Not enough data to show this report</Box>
                }
              </Box>
            </Box>
          </Box>

          {/* average GPA of my classes */}
          <Box className="col-12 col-lg-4 mb-4">
            <Box className="card h-100">
              <Box className="card-header">
                <h6 className="my-2">Average GPA of Classes</h6>
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


      {isPrinting &&
        <UserDashboardPrint ref={componentRef} dashboardContent={dashboardContent}
          semester={semesters.find(semester => semester.id === selectedSemester)} />
      }


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </Box>
  )
}
