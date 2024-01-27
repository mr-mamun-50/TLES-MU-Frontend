import { Box } from '@mui/material'
import Courses from '../../admin/views/department_courses/Courses'

export default function ModeratorCourses() {
  return (
    <Box className='container d-flex justify-content-center'>
      <Box className="col-lg-7 my-2">
        <Courses />
      </Box>
    </Box>
  )
}
