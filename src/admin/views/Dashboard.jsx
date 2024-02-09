import { Box, MenuItem, TextField } from "@mui/material";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCountShowCard from "../../user/components/DashboardCountShowCard";
import DashboardAvgBloomsLevels from "../../user/components/DashboardAvgBloomsLevels";
import DashboardAvgGpa from "../../user/components/DashboardAvgGpa";
import CustomSnackbar from "../../utilities/SnackBar";

export default function AdminDashboard() {

  // const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchStudentLoading, setSearchStudentLoading] = useState(false);
  const [searchBatchLoading, setSearchBatchLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const [dashboardContent, setDashboardContent] = useState({});
  const [semesters, setSemesters] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedSemester, setSelectedSemester] = useState(0)
  const [selectedDepartment, setSelectedDepartment] = useState(0)
  const [inputStudentId, setInputStudentId] = useState('');
  const [inputBatchName, setInputBatchName] = useState('');


  // get batch students info of a batch
  const getDashboardContent = useCallback(() => {
    setLoading(true)
    axios.get(`/api/admin/dashboard/${selectedDepartment}/${selectedSemester}`).then(res => {
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
  }, [selectedDepartment, selectedSemester])

  // get departments
  const getDepartments = () => {
    axios.get('/api/admin/departments').then(res => {
      if (res.status === 200) {
        setDepartments(res.data.departments)
        setSelectedDepartment(res.data.departments[0].id)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    });
  }

  // get semesters
  const getSemesters = useCallback(() => {
    setLoading(true)
    axios.get(`/api/admin/semesters`).then(res => {
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

  // search student
  const searchStudent = (e) => {
    e.preventDefault();
    setSearchStudentLoading(true)
    axios.post(`/api/admin/students/search-student`, { student_id: inputStudentId }).then(res => {
      if (res.status === 200) {
        const student = res.data.student;
        navigate(`/admin/students/profile/${student.id}`, { state: { student: student } })
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
    axios.post(`/api/admin/batch_section/batch/search/${selectedDepartment}`, { batch_name: inputBatchName }).then(res => {
      if (res.status === 200) {
        const batch = res.data.batch;
        navigate(`/admin/batch-section/batch/${batch.id}/statistics`, { state: { batch: batch } })
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
    getDepartments()
    getSemesters()
  }, [getSemesters])

  useEffect(() => {
    if (selectedDepartment !== 0 && selectedSemester !== 0) {
      getDashboardContent()
    }
  }, [getDashboardContent, selectedDepartment, selectedSemester])



  return (
    <Box className="container">
      {/* title and select semester */}
      <Box className='card-header d-flex justify-content-between align-items-center mb-3'>
        <h5 className='mt-2'>Dashboard</h5>

        <Box className='col-8 col-md-6 col-xl-4 d-flex'>
          <TextField select fullWidth margin='small' size='small' value={selectedDepartment} className="me-2"
            onChange={(e) => { setSelectedDepartment(e.target.value); }}>
            {departments.map(department =>
              <MenuItem key={department.id} value={department.id}>{department.name}</MenuItem>
            )}
          </TextField>

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
          <DashboardCountShowCard label={'Semester Classes'} count={dashboardContent.current_classes_count}
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
                <h6 className="my-2">Average Blooms Levels</h6>
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



      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </Box>
  )
}
