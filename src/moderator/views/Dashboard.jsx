import { useCallback, useEffect, useRef, useState } from "react";
import CustomSnackbar from "../../utilities/SnackBar";
import { Box, MenuItem, TextField } from "@mui/material";
import DashboardCountShowCard from "../../user/components/DashboardCountShowCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardAvgBloomsLevels from "../../user/components/DashboardAvgBloomsLevels";
import DashboardAvgGpa from "../../user/components/DashboardAvgGpa";
import { useReactToPrint } from "react-to-print";
import { AdminModDashboardPrint } from "../../user/views/print_views/AdminModDashboard";

export default function ModeratorDashboard() {

  // const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchStudentLoading, setSearchStudentLoading] = useState(false);
  const [searchBatchLoading, setSearchBatchLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const [dashboardContent, setDashboardContent] = useState({});
  const [semesters, setSemesters] = useState([])
  const [selectedSemester, setSelectedSemester] = useState(0)
  const [inputStudentId, setInputStudentId] = useState('');
  const [inputBatchName, setInputBatchName] = useState('');


  // get batch students info of a batch
  const getDashboardContent = useCallback(() => {
    setLoading(true)
    axios.get(`/api/moderator/dashboard/${selectedSemester}`).then(res => {
      if (res.status === 200) {
        setDashboardContent(res.data.content)
        // console.log(res.data.content)
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
    axios.get(`/api/moderator/semesters`).then(res => {
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

  // search student
  const searchStudent = (e) => {
    e.preventDefault();
    setSearchStudentLoading(true)
    axios.post(`/api/moderator/students/search-student`, { student_id: inputStudentId }).then(res => {
      if (res.status === 200) {
        const student = res.data.student;
        navigate(`/moderator/students/profile/${student.id}`, { state: { student: student } })
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    }).finally(() => {
      setSearchStudentLoading(false)
    });
  }

  // search batch
  const searchBatch = (e) => {
    e.preventDefault();
    setSearchBatchLoading(true)
    axios.post(`/api/moderator/batch_section/batch/search`, { batch_name: inputBatchName }).then(res => {
      if (res.status === 200) {
        const batch = res.data.batch;
        navigate(`/moderator/batch-section/batch/${batch.id}/statistics`, { state: { batch: batch } })
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    }).finally(() => {
      setSearchBatchLoading(false)
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
    documentTitle: `Department Dashboard - `,
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
        <Box className="row my-2">

          {/* heading cards */}
          <DashboardCountShowCard label={'Total Courses'} count={dashboardContent.current_classes_count}
            icon={'fas fa-chalkboard-user'} color={'success'} />

          <DashboardCountShowCard label={'Running Students'} count={dashboardContent.running_students}
            icon={'fas fa-people-roof'} color={'info'} />

          <DashboardCountShowCard label={'Retaking Students'} count={dashboardContent.retaking_students}
            icon={'fas fa-person-walking-arrow-loop-left'} color={'danger'} />

          <DashboardCountShowCard label={'Working Teachers'} count={dashboardContent.working_teachers}
            icon={'fas fa-person-chalkboard'} color={'primary'} />


          {/* search student */}
          <Box className="col-12 col-lg-6 mb-4">
            <Box className="card h-100">
              <Box className="card-header">
                <h6 className="mt-2 mb-1">Search Student</h6>
              </Box>

              <Box className="card-body">
                <form onSubmit={searchStudent}>
                  <Box className="input-group input-group-lg">
                    <input type="text" className="form-control" placeholder="Student ID (e.g., 201-000-000)"
                      value={inputStudentId} onChange={(e) => setInputStudentId(e.target.value)} />

                    <button type="submit" className="btn btn-outline-primary border-grey">
                      {searchStudentLoading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-search"></i>}
                    </button>
                  </Box>
                </form>
              </Box>
            </Box>
          </Box>

          {/* search batch */}
          <Box className="col-12 col-lg-6 mb-4">
            <Box className="card h-100">
              <Box className="card-header">
                <h6 className="mt-2 mb-1">Search Batch</h6>
              </Box>

              <Box className="card-body">
                <form onSubmit={searchBatch}>
                  <Box className="input-group input-group-lg">
                    <input type="text" className="form-control" placeholder="Batch Name (e.g., 50)"
                      value={inputBatchName} onChange={(e) => setInputBatchName(e.target.value)} />

                    <button className="btn btn-outline-primary border-grey">
                      {searchBatchLoading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-search"></i>}
                    </button>
                  </Box>
                </form>
              </Box>
            </Box>
          </Box>


          {/* blooms level counts */}
          <Box className="col-12 col-lg-8 mb-4">
            <Box className="card h-100">
              <Box className="card-header">
                <h6 className="my-2">Average Attainment</h6>
              </Box>

              <Box className="card-body">
                {dashboardContent.current_classes?.length > 0 ?
                  <DashboardAvgBloomsLevels
                    current_classes={dashboardContent.current_classes}
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
                <h6 className="my-2">Average GPA</h6>
              </Box>

              <Box className="card-body">
                {dashboardContent.current_classes?.length > 0 ?
                  <DashboardAvgGpa
                    current_classes={dashboardContent.current_classes}
                  />
                  : <Box className='text-center my-5'>Not enough data to show this report</Box>
                }
              </Box>
            </Box>
          </Box>

        </Box>
      }


      {/* print view */}
      {isPrinting &&
        <AdminModDashboardPrint ref={componentRef} dashboardContent={dashboardContent}
          semester={semesters.find(semester => semester.id === selectedSemester)} />
      }


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </Box>
  )
}
