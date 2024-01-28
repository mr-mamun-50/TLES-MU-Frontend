import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom'
import CourseStatistics from '../../../user/views/classes/view_class/Statistics';

export default function TeacherClassStats() {

  const location = useLocation();
  const assigned_class = location.state?.assigned_class;
  const profile = location.state?.profile

  // console.log(assigned_class)

  return (
    <Box className="container">
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

          <Box className="text-end d-grid my-2">
            <h6 className="mb-2">{assigned_class.course.title}</h6>
            <small className="text-muted mb-1">
              {`Code: ${assigned_class.course.course_code} | Credit hours: ${assigned_class.course.credit_hours}`}
            </small>
            <small>
              {`${assigned_class.section.batch.department.name} - ${assigned_class.section.batch.batch_name} (${assigned_class.section.section_name})`}
            </small>
          </Box>
        </Box>

        <Box className="card-body">
          <CourseStatistics assigned_class={assigned_class} />
        </Box>
      </Box>
    </Box>
  )
}
