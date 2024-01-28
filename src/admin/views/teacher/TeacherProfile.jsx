import { Box } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import CustomSnackbar from "../../../utilities/SnackBar";
import axios from "axios";

export default function TeacherProfile() {

  // const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState()

  const location = useLocation()
  const profile = location.state?.profile

  const [semesters, setSemesters] = useState([])
  const [selectedSemester, setSelectedSemester] = useState({})
  const [conductedCourses, setConductedCourses] = useState([])

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);


  // console.log(conductedCourses)

  // get conducted courses
  const getConductedCourses = useCallback((page = 1) => {
    setLoading(true);
    axios.get(`/api/${role}/teacher/conducted-courses/${profile.id}/${selectedSemester.id}?page=${page}`)
      .then(res => {
        if (res.status === 200) {
          setConductedCourses(res.data.courses.data);
          setCurrentPage(res.data.courses.current_page);
          setLastPage(res.data.courses.last_page);
          setLoading(false);
        } else {
          setError(res.data.message);
          setLoading(false);
          setTimeout(() => setError(''), 5000);
        }
      })
      .catch(err => {
        setError(err.response.data.message);
        setLoading(false);
        setTimeout(() => setError(''), 5000);
      });
  }, [profile.id, role, selectedSemester.id]);

  // handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    getConductedCourses(page);
  };

  // pagination buttons component
  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= lastPage; i++) {
      buttons.push(
        <button key={i} onClick={() => handlePageChange(i)} className={`page-item page-link ${currentPage === i ? 'active' : ''}`}>
          {i}
        </button>
      );
    }
    return buttons;
  };


  // get semesters
  const getSemesters = useCallback(() => {
    setLoading(true)
    axios.get(`/api/${role}/semesters`).then(res => {
      if (res.status === 200) {
        setSemesters(res.data.semesters)
        setSelectedSemester(res.data.semesters[0])
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


  useEffect(() => {
    localStorage.getItem('role') ?
      setRole(localStorage.getItem('role'))
      : setRole(sessionStorage.getItem('role'));

    if (role && selectedSemester.id) {
      getConductedCourses();
    }
  }, [getConductedCourses, role, selectedSemester.id])


  useEffect(() => {
    if (role) {
      getSemesters();
    }
  }, [getSemesters, role])


  return (
    <Box className='container'>
      <Box className="card my-2">
        {/* seading section */}
        <Box className='card-header pb-0 d-flex justify-content-between align-items-center' sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box className='d-flex'>
            <button onClick={() => window.history.back()} className='btn btn-light btn-floating me-3 mt-2'>
              <i className='fas fa-arrow-left fa-lg'></i></button>
            <Box className='my-2'>
              <h5 className='card-title mb-1'>{profile.name}</h5>
              <small className='text-muted'>{` ${profile.department.name}`}</small>
            </Box>
          </Box>
        </Box>

        {/* body section */}
        <Box className="card-body">
          <Box className="row">
            {/* select semester */}
            <Box className="col-12 col-md-6 col-lg-3">
              <Box className='card border border-light-grey'>
                <Box className='card-header d-flex justify-content-between align-items-center'>
                  <h6 className='mt-1 mb-0'>Semester</h6>
                </Box>

                <Box className="card-body p-3">
                  <Box className="list-group list-group-light" style={{ height: "300px", overflowY: "scroll" }}>
                    {semesters.map((semester) => (
                      <button onClick={() => setSelectedSemester(semester)}
                        className={`list-group-item list-group-item-action px-3 py-2 ${selectedSemester.id === semester.id && 'active'}`}>
                        <i className={`${selectedSemester.id === semester.id ? 'fas' : 'far'} fa-circle-check me-2`}></i>{semester.name}
                      </button>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* assign courses */}
            <Box className="col-12 col-md-6 col-lg-9">

              <Box style={{ minHeight: '60vh' }}>
                {/* Render your data */}
                {loading ? <Box className="text-center py-5"><span className="spinner-border"></span></Box>
                  : conductedCourses.length > 0 ?
                    conductedCourses.map(course => (
                      <Box className='card card-body mb-3 border border-light-grey exam-card' key={course.id}>
                        <Box className="d-flex align-items-center justify-content-between">
                          {/* basic info and clipboard icon */}
                          <Box className="d-flex align-items-center">
                            {/* icon */}
                            <Box className="rounded-circle bg-secondary d-flex justify-content-center align-items-center me-4" sx={{ width: '50px', height: '50px' }}>
                              <i className="fas fa-clipboard-list fa-xl text-light"></i>
                            </Box>

                            {/* basic info */}
                            <Box className='d-grid'>
                              <h6 className="mb-2">{course.course.title}</h6>
                              <small className="text-muted mb-1">
                                {`Code: ${course.course.course_code} | Credit hours: ${course.course.credit_hours}`}
                              </small>
                              <small>
                                {`${course.section.batch.department.name} - ${course.section.batch.batch_name} (${course.section.section_name})`}
                              </small>
                            </Box>
                          </Box>

                          {/* right icon */}
                          <Link to={`/${role}/teachers/profile/class-statistics`} className="btn btn-light btn-floating btn-lg" state={{ 'assigned_class': course, 'profile': profile }}>
                            <i className="fas fa-chevron-right fa-lg text-muted"></i>
                          </Link>
                        </Box>
                      </Box>
                    ))
                    : <Box className="text-center py-5"><span className="text-muted">No conducted courses found</span></Box>
                }
              </Box>

              {/* Render pagination buttons */}
              <Box className="d-flex justify-content-end mt-4">
                <Box className="pagination">
                  <button className={`page-item page-link ${currentPage === 1 && 'disabled'}`} onClick={() => handlePageChange(currentPage - 1)}>
                    &laquo; Previous
                  </button>

                  {renderPaginationButtons()}

                  <button className={`page-item page-link ${currentPage === lastPage && 'disabled'}`} onClick={() => handlePageChange(currentPage + 1)}>
                    Next &raquo;
                  </button>
                </Box>
              </Box>

            </Box>
          </Box>
        </Box>
      </Box>


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </Box>
  )
}
