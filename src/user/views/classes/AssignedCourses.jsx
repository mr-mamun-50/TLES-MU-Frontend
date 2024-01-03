import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import CustomSnackbar from '../../../utilities/SnackBar'
import { Menu, MenuItem, TextField } from '@mui/material'
import { Link } from 'react-router-dom'

export default function AssignedCourses() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [classes, setClasses] = useState([])

  const [classStatus, setClassStatus] = useState(1)

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
  const getClasses = useCallback(() => {
    setLoading(true);
    axios.get(`/api/user/assigned-courses/${classStatus}`).then(res => {
      if (res.status === 200) {
        const fetchImagePromises = res.data.courses.map(course => {
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
            setClasses(res.data.courses);
            setLoading(false);
          })
          .catch(error => {
            setClasses(res.data.courses);
            setError(error.message + ' background images');
            setLoading(false);
          });
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
  }, [classStatus]);

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
    getClasses()
  }, [getClasses])


  return (
    <div className="container">
      {/* <div className='card my-2'> */}
      <div className='card-header d-flex justify-content-between align-items-center mb-3'>
        <h5 className='mt-3'>My Classes</h5>

        <div className="col-6 col-md-3 col-xl-2">
          <TextField select fullWidth margin='small' size='small' value={classStatus}
            onChange={(e) => { setClassStatus(e.target.value); }}>
            <MenuItem value={1}>Current classes</MenuItem>
            <MenuItem value={0}>Archived Classes</MenuItem>
          </TextField>
        </div>
      </div>


      {/* <div className='card-body'> */}
      <div className="row">
        {loading ? <div className="text-center"><span className='spinner-border my-4'></span></div>
          : classes.length > 0 ?
            classes.map((course, index) => (
              <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
                <div className='card border border-light-grey h-100 class-card' key={index}>

                  {/* linked card contents */}
                  <Link to={`/classes/${course.id}`} state={{ course: course }}>
                    <div className="card-header bg-dark d-flex align-items-end" style={{
                      height: '110px',
                      background: `linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)), url("${course.image}") no-repeat center/cover`
                    }}>
                      <div className="w-100 text-shadow">
                        <h5 className='text-white text-hide-ellipsis' title={`${course.course.course_code} :: ${course.course.title}`}
                          style={{ textShadow: '0 0 10px black' }}>
                          {course.course.course_code} :: {course.course.title}</h5>
                        <p className='card-text text-light' style={{ textShadow: '0 0 10px black' }}>Credit hours: {course.course.credit_hours}</p>
                      </div>
                    </div>


                    <div className='card-body p-3 small text-dark bg-white'>
                      <p className='mb-1 text-hide-ellipsis'>{course.section.batch.department.name}</p>
                      <p className='mb-1 fw-bold'>{course.section.batch.batch_name} ({course.section.section_name})</p>
                      <p className='mb-2'>{course.semester?.name}</p>
                      {/* <p className=''>Number of Students: {course.section.students.length}</p> */}
                    </div>
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
                    <MenuItem onClick={() => { moveToArchive(course.id); handleMenuClose() }}>
                      <i className="fas fa-inbox text-grey me-3"></i>Move to {classStatus === 1 ? 'Archive' : "Current"}
                    </MenuItem>
                  </Menu>
                </div>
              </div>
            )) : <div className='text-center my-5'>No Classes Found</div>}
      </div>
      {/* </div> */}
      {/* </div> */}


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </div >
  )
}
