import { Box } from '@mui/material'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import CustomSnackbar from '../../../utilities/SnackBar'
import { Link } from 'react-router-dom'

export default function AssignedSupples() {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState()

  const [semesters, setSemesters] = useState([])
  const [supplementaryExams, setSupplementaryExams] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState({})


  // get semesters
  const getSemesters = useCallback((select = false) => {
    setLoading(true)
    axios.get(`/api/${role}/semesters`).then(res => {
      if (res.status === 200) {
        setSemesters(res.data.semesters)
        if (select) {
          setSelectedSemester(res.data.semesters[0])
        }
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

  // get supplementary exams
  const getSupplementaryExams = useCallback((page = 1) => {
    setLoading(true)
    axios.get(`/api/${role}/supplementary-exams/${selectedSemester.id}?page=${page}`).then(res => {
      if (res.status === 200) {
        setSupplementaryExams(res.data.exams.data)
        setCurrentPage(res.data.exams.current_page)
        setLastPage(res.data.exams.last_page)
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
  }, [role, selectedSemester])

  // handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    getSupplementaryExams(page);
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


  useEffect(() => {
    localStorage.getItem('role') ?
      setRole(localStorage.getItem('role'))
      : setRole(sessionStorage.getItem('role'));

    if (role && selectedSemester.id) {
      getSupplementaryExams();
    }
  }, [getSupplementaryExams, role, selectedSemester.id])


  useEffect(() => {
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

        {/* supplementary exams */}
        <Box className="col-12 col-md-6 col-lg-9 py-2">
          <Box className="card">
            <Box className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mt-2 mb-0">Supplementary Exams</h5>
            </Box>

            <Box className="card-body pb-2">
              {loading ? <Box className="text-center py-5"><span className="spinner-border"></span></Box>
                : supplementaryExams.length > 0 ?
                  supplementaryExams.map((exam) => (
                    <Box className='card card-body mb-3 border border-light-grey exam-card' key={exam.id}>
                      <Box className="d-flex align-items-center justify-content-between">
                        {/* basic info and clipboard icon */}
                        <Box className="d-flex align-items-center">
                          {/* icon */}
                          <Box className="rounded-circle bg-secondary d-flex justify-content-center align-items-center me-4" sx={{ width: '50px', height: '50px' }}>
                            <i className="fas fa-clipboard-list fa-xl text-light"></i>
                          </Box>

                          {/* basic info and action buttons */}
                          <Box className='d-grid'>
                            <h6 className="mb-2">{exam.course.title}</h6>
                            <small className="text-muted mb-1">
                              {`Code: ${exam.course.course_code} | Credit hours: ${exam.course.credit_hours}`}
                            </small>

                            {/* Action buttons */}
                            <Box className="d-flex align-items-center mt-2">
                              <Link to={`${role === 'user' ? '' : `/${role}`}/supplementary-exams/questions/${exam.id}`} state={{ exam: exam }}
                                className="btn btn-secondary btn-sm me-2">
                                <i className="fas fa-file-pen me-2"></i> Question
                              </Link>

                              <Link to={`${role === 'user' ? '' : `/${role}`}/supplementary-exams/marks/${exam.id}`} state={{ exam: exam, question_sets: exam.question_sets }}
                                className="btn btn-secondary btn-sm">
                                <i className="fas fa-edit me-2"></i> Marks</Link>
                            </Box>
                          </Box>
                        </Box>

                        {/* exam date and full marks */}
                        <Box className='text-end text-muted'>
                          <Box className="mb-1">
                            <small>{new Date(exam.exam_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', })}</small>
                          </Box>
                          <small>Total: <b>{exam.total_marks}</b> marks</small>
                          <br />
                          {<small>Created questions for: <b>{exam.added_marks}</b> marks</small>}
                        </Box>
                      </Box>
                    </Box>
                  ))
                  : <Box className="text-center py-5"><span className="text-muted">No supplementary exams assigned yet</span></Box>
              }
            </Box>

            {/* Render pagination buttons */}
            <Box className="card-footer d-flex justify-content-end">
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


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </Box>
  )
}
