import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react'
import { Box, Tab } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Exams from './view_class/Exams';
import EnrolledStudents from './view_class/Students';
import CourseStatistics from './view_class/Statistics';

export default function ViewClass() {

  // tab index
  const [value, setValue] = useState('0');

  const location = useLocation();
  const assigned_class = location.state?.assigned_class;
  // console.log(assigned_class);


  useEffect(() => {
    const selectedTab = sessionStorage.getItem('selected-class-tab');
    selectedTab !== null ? setValue(selectedTab) : setValue('1');
  }, [])

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
                <h5 className='card-title mb-1'>{assigned_class.course?.title}</h5>
                <small className='text-muted'>{` ${assigned_class.section?.batch.department.name} - ${assigned_class.section?.batch.batch_name} (${assigned_class.section?.section_name})`}</small>
              </Box>
            </Box>

            <TabList onChange={(_e, val) => { setValue(val), sessionStorage.setItem('selected-class-tab', val) }} aria-label="lab API tabs example">
              <Tab label="Exams" value='1' />
              <Tab label="Students" value='2' />
              <Tab label="Statistics" value='3' />
              <Tab hidden value='0' />
            </TabList>
          </Box>

          {/* tab contents */}
          <TabPanel value='1' className='p-0'>
            <Box className="card-body">
              <Exams assigned_class={assigned_class} />
            </Box>
          </TabPanel>

          <TabPanel value='2' className='p-0'>
            <Box className="card-body">
              <EnrolledStudents assigned_class={assigned_class} />
            </Box>
          </TabPanel>

          <TabPanel value='3' className='p-0'>
            <Box className="card-body">
              <CourseStatistics assigned_class={assigned_class} />
            </Box>
          </TabPanel>

          <TabPanel value='0' className='p-0'>
            <Box className="card-body">
              {/* empty tab. it works when no tab is selected. It works for release extra loading */}
            </Box>
          </TabPanel>

        </TabContext>
      </Box>
    </Box>
  )
}
