import { useLocation } from 'react-router-dom';
import { useState } from 'react'
import { Box, Tab } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Exams from './view_class/Exams';
import EnrolledStudents from './view_class/Students';
import CourseStatistics from './view_class/Statistics';

export default function ViewClass() {

  // tab index
  const [value, setValue] = useState('1');

  const location = useLocation();
  const course = location.state?.course;
  // console.log(course);

  return (
    <Box className="container">
      <Box className='card my-2'>
        <TabContext value={value}>

          {/* tab nav list */}
          <Box className='card-header pb-0 d-flex justify-content-between align-items-end' sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Box className='d-flex'>
              <button onClick={() => window.history.back()} className='btn btn-light btn-floating me-3 mt-2'>
                <i className='fas fa-arrow-left fa-lg'></i></button>
              <Box className='my-2'>
                <h5 className='card-title mb-1'>{course.course?.title}</h5>
                <small className='text-muted'>{` ${course.section?.batch.department.name} - ${course.section?.batch.batch_name} (${course.section?.section_name})`}</small>
              </Box>
            </Box>

            <TabList onChange={(_e, val) => setValue(val)} aria-label="lab API tabs example">
              <Tab label="Exams" value="1" />
              <Tab label="Students" value="2" />
              <Tab label="Statistics" value="3" />
            </TabList>
          </Box>

          {/* tab contents */}
          <TabPanel value="1" className='p-0'>
            <Box className="card-body">
              <Exams course={course} />
            </Box>
          </TabPanel>

          <TabPanel value="2" className='p-0'>
            <Box className="card-body">
              <EnrolledStudents />
            </Box>
          </TabPanel>

          <TabPanel value="3" className='p-0'>
            <Box className="card-body">
              <CourseStatistics />
            </Box>
          </TabPanel>

        </TabContext>
      </Box>
    </Box>
  )
}
