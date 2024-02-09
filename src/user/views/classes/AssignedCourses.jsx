import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import CustomSnackbar from '../../../utilities/SnackBar'
import { Box, Menu, MenuItem, TextField } from '@mui/material'
import { Link } from 'react-router-dom'

export default function AssignedCourses() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [classes, setClasses] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filterClass, setFilterClass] = useState({ classStatus: '', page: '' })

  // open menu and modals
  const [anchorEl, setAnchorEl] = useState(null);
  const [openMenus, setOpenMenus] = useState(Array(classes.length).fill(false));

  const handleMenuClick = (index, event) => {
    setAnchorEl(event.currentTarget);
    const newOpenMenus = [...openMenus];
    newOpenMenus[index] = true;
    setOpenMenus(newOpenMenus);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpenMenus(Array(classes.length).fill(false));
  };

  // console.log(classes)

  // get classes
  const getClasses = useCallback((status, page = 1) => {
    setLoading(true);
    axios.get(`/api/user/assigned-courses/${status}?page=${page}`).then(res => {
      if (res.status === 200) {
        const fetchImagePromises = res.data.courses.data.map(course => {
          return fetch(`https://api.pexels.com/v1/search?query=${course.course.title}&per_page=1`, {
            method: "GET",
            headers: { Authorization: '563492ad6f91700001000001ac753ee053684dec8a9cd6095935f22a' },
          })
            .then(response => response.json())
            .then(data => {
              course.image = data.photos[0].src.medium;
            });
        });

        Promise.all(fetchImagePromises)
          .then(() => {
            setClasses(res.data.courses.data);
            setLoading(false);
          })
          .catch(error => {
            setClasses(res.data.courses.data);
            setError(error.message + ' background images');
            setLoading(false);
          });
        setCurrentPage(res.data.courses.current_page);
        setLastPage(res.data.courses.last_page);
      } else {
        setError(res.data.message);
        setTimeout(() => { setError('') }, 5000);
        setLoading(false);
      }
    }).catch(err => {
      setError(err.response.data.message);
      setTimeout(() => { setError('') }, 5000);
      setLoading(false);
    });
  }, []);

  // handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    getClasses(filterClass.classStatus, page);
    setFilterClass({ classStatus: filterClass.classStatus, page: page })
    sessionStorage.setItem('filterClass', JSON.stringify({ classStatus: filterClass.classStatus, page: page }))
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


  // move to archive
  const moveToArchive = (id) => {
    setLoading(true)
    axios.put(`/api/user/assigned-courses/move-to-archive/${id}`).then(res => {
      if (res.status === 200) {
        getClasses()
        setSuccess(res.data.message)
        setTimeout(() => { setSuccess('') }, 5000)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
      setLoading(false)
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
      setLoading(false)
    })
  }


  useEffect(() => {
    if (sessionStorage.getItem('filterClass')) {
      let filterData = JSON.parse(sessionStorage.getItem('filterClass'));
      getClasses(filterData.classStatus, filterData.page);
      setFilterClass(filterData);
    } else {
      getClasses(1);
      setFilterClass({ classStatus: 1, page: 1 })
    }
  }, [currentPage, getClasses])


  return (
    <Box className="container">
      {/* <Box className='card my-2'> */}
      <Box className='card-header d-flex justify-content-between align-items-center mb-3'>
        <h5 className='mt-2'>My Classes</h5>

        <Box className="col-6 col-md-3 col-xl-2">
          <TextField select fullWidth margin='small' size='small' value={filterClass.classStatus}
            onChange={(e) => {
              getClasses(e.target.value, 1);
              setFilterClass({ classStatus: e.target.value, page: 1 });
              sessionStorage.setItem('filterClass', JSON.stringify({ classStatus: e.target.value, page: 1 }));
            }}>
            <MenuItem value={1}>Current classes</MenuItem>
            <MenuItem value={0}>Archived Classes</MenuItem>
          </TextField>
        </Box>
      </Box>


      <Box style={{ minHeight: '70vh' }}>
        <Box className="row">
          {loading ? <Box className="text-center py-5"><span className='spinner-border'></span></Box>
            : classes.length > 0 ?
              classes.map((assigned_class, index) => (
                <Box className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4" key={index}>
                  <Box className='card border border-light-grey h-100 class-card'>

                    {/* linked card contents */}
                    <Link to={`/classes/${assigned_class.id}`} state={{ assigned_class: assigned_class }}>
                      <Box className="card-header bg-dark d-flex align-items-end" style={{
                        height: '110px',
                        background: `linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)), url("${assigned_class.image}") no-repeat center/cover`
                      }}>
                        <Box className="w-100 text-shadow">
                          <h5 className='text-white text-hide-ellipsis' title={`${assigned_class.course.course_code} :: ${assigned_class.course.title}`}
                            style={{ textShadow: '0 0 10px black' }}>
                            {assigned_class.course.course_code} :: {assigned_class.course.title}</h5>
                          <p className='card-text text-light' style={{ textShadow: '0 0 10px black' }}>Credit hours: {assigned_class.course.credit_hours}</p>
                        </Box>
                      </Box>


                      <Box className='card-body p-3 small text-dark bg-white'>
                        <p className='mb-1 text-hide-ellipsis'>{assigned_class.section.batch.department.name}</p>
                        <p className='mb-1 fw-bold'>{assigned_class.section.batch.batch_name} ({assigned_class.section.section_name})</p>
                        <p className='mb-2'>{assigned_class.semester?.name}</p>
                        {/* <p className=''>Number of Students: {course.section.students.length}</p> */}
                      </Box>
                    </Link>


                    {/* more button */}
                    <button className='btn btn-dark btn-floating btn-sm position-absolute end-0 m-2' style={{ background: 'rgba(0, 0, 0, 0.5)' }}
                      id={`basic-button-${index}`} aria-controls={openMenus[index] ? `basic-menu-${index}` : undefined}
                      aria-haspopup="true" aria-expanded={openMenus[index] ? 'true' : undefined}
                      onClick={(event) => handleMenuClick(index, event)}
                    >
                      <i className="fas fa-ellipsis-v fa-lg"></i>
                    </button>

                    <Menu id={`basic-menu-${index}`} anchorEl={anchorEl} open={openMenus[index]}
                      onClose={handleMenuClose} MenuListProps={{ 'aria-labelledby': `basic-button-${index}` }}
                    >
                      <MenuItem onClick={() => { moveToArchive(assigned_class.id); handleMenuClose() }}>
                        <i className="fas fa-inbox text-grey me-3"></i>Move to {filterClass.classStatus === 1 ? 'Archive' : "Current"}
                      </MenuItem>
                    </Menu>
                  </Box>
                </Box>
              ))
              : <Box className='text-center py-5'>No Classes Found</Box>}
        </Box>
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
      {/* </Box> */}


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </Box >
  )
}
