import { Accordion, AccordionDetails, AccordionSummary, Box, Table, TableBody, TableCell, TableRow } from '@mui/material'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import CustomSnackbar from '../../../../utilities/SnackBar'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { BarChart } from '@mui/x-charts/BarChart'
import StudentCategoryCircularLevel from './Statistics/StudentCategoryCircularLevel'
import SpeedIcon from '@mui/icons-material/Speed';
import GpaCounts from './Statistics/GpaCounts'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MarksRangeCount from './Statistics/MarksRangeCount'

export default function CourseStatistics({ assigned_class }) {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState()

  const [examMarksOfClass, setExamMarksOfClass] = useState([])

  // tab index for graph and details
  const [examTabIndex, setExamTabIndex] = useState({ Midterm: '1', Final: '1' });
  const [performanceTabIndex, setPerformanceTabIndex] = useState('1')

  // total exam marks
  const totalExamMarks = examMarksOfClass.length > 0 && examMarksOfClass.reduce((sum, exam) => sum + exam.total_marks, 0);


  // calculate all student marks stated
  const studentTotalMarks = {};

  examMarksOfClass.forEach((exam) => {
    exam.obtained_exam_marks.forEach((obtainedMark) => {
      const studentId = obtainedMark.student_id;
      const marks = obtainedMark.marks;
      studentTotalMarks[studentId] = (studentTotalMarks[studentId] || 0) + marks;
    });

    exam.obtained_ca_marks.forEach((obtainedCaMark) => {
      const studentId = obtainedCaMark.student_id;
      const marks = obtainedCaMark.marks;
      studentTotalMarks[studentId] = (studentTotalMarks[studentId] || 0) + marks;
    });
  });

  const studentTotalMarksArray = Object.entries(studentTotalMarks).map(([studentId, totalMarks]) => ({
    student_id: parseInt(studentId),
    total_marks: totalMarks,
  }));
  // calculate all student marks ended



  // calculate overall blooms level percentages started
  // Initialize overAllBloomsLevelMarks for all exams
  const overAllBloomsLevelMarks = {};

  // Iterate over all exams
  examMarksOfClass.forEach((exam) => {
    // Iterate over obtained exam marks for each exam
    exam.obtained_exam_marks.forEach((obtainedMark) => {
      const bloomsLevel = obtainedMark.question.blooms_level;

      if (!overAllBloomsLevelMarks[bloomsLevel]) {
        overAllBloomsLevelMarks[bloomsLevel] = {
          totalMarks: 0,
          obtainedMarks: 0,
        };
      }

      overAllBloomsLevelMarks[bloomsLevel].totalMarks += obtainedMark.question.marks;
      overAllBloomsLevelMarks[bloomsLevel].obtainedMarks += obtainedMark.marks;
    });
  });

  // Initialize all blooms levels with 'Not answered'
  const overAllBloomsLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  // Calculate percentages for all blooms levels
  const overAllBloomsLevelPercentages = overAllBloomsLevels.map((bloomsLevel) => {
    if (overAllBloomsLevelMarks[bloomsLevel]) {
      const { totalMarks, obtainedMarks } = overAllBloomsLevelMarks[bloomsLevel];
      const percentage = (obtainedMarks / totalMarks) * 100 || 0;

      return {
        bloomsLevel,
        percentage,
      };
    } else {
      return {
        bloomsLevel,
        percentage: 'N/A',
      };
    }
  });
  // calculate overall blooms level percentages ended


  // console.log(overAllBloomsLevelPercentages);

  // get all exam marks
  const getAllExamMarks = useCallback(() => {
    setLoading(true)
    axios.get(`/api/${role}/class_exam_marks/${assigned_class.id}`).then(res => {
      if (res.status === 200) {
        setExamMarksOfClass(res.data.examMarks)
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
  }, [assigned_class.id, role])


  useEffect(() => {
    localStorage.getItem('role') ?
      setRole(localStorage.getItem('role'))
      : setRole(sessionStorage.getItem('role'))

    role && getAllExamMarks()
  }, [getAllExamMarks, role])


  return (
    <Box>

      {/* exam based info */}
      {examMarksOfClass.length > 0 ?
        <Box className="pt-3">

          {/* overall performance */}
          <Box className="pb-2 border-bottom mb-3 d-flex justify-content-between align-items-center" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <h5 className='mb-0'>Overall Performance</h5>

            {/* tab indexes */}
            <Box className="btn-group shadow-0 align-items-center">
              <button className={`btn btn${performanceTabIndex !== '1' ? '-outline' : ''}-secondary btn-sm btn-rounded`}
                onClick={() => setPerformanceTabIndex('1')}
                title='Graph'>Category</button>

              <button className={`btn btn${performanceTabIndex !== '2' ? '-outline' : ''}-secondary btn-sm btn-rounded`}
                onClick={() => setPerformanceTabIndex('2')}
                title='Details'>Blooms Level</button>

              <button className={`btn btn${performanceTabIndex !== '3' ? '-outline' : ''}-secondary btn-sm btn-rounded`}
                onClick={() => setPerformanceTabIndex('3')}
                title='Details'>GPA</button>
            </Box>
          </Box>

          {/* category, blooms level and GPA progressbar and graph */}
          <TabContext value={performanceTabIndex}>

            {/* category circular progress bar */}
            <TabPanel value='1' className='p-0'>
              <Box className="pb-2">
                <StudentCategoryCircularLevel
                  studentTotalMarks={studentTotalMarksArray}
                  examTotalMarks={totalExamMarks}
                  barWidth={'80px'}
                  colClasses={'col-4 col-md-2'}
                />
              </Box>
            </TabPanel>

            {/* blooms level */}
            <TabPanel value='2' className='p-0'>
              <Box className="pb-2">
                <Box className='row mb-3 me-0'>
                  {/* Show blooms graph */}
                  <Box className="col-md-7 col-lg-8">
                    <BarChart
                      xAxis={[{
                        id: 'barCategories',
                        data: overAllBloomsLevelPercentages.map(({ bloomsLevel }) => bloomsLevel),
                        scaleType: 'band',
                      }]}
                      series={[{
                        data: overAllBloomsLevelPercentages.map(({ percentage }) => percentage !== 'N/A' ? percentage : 0),
                        color: '#007bff',
                      }]}
                      height={220}
                      margin={{ top: 15, right: 15, bottom: 20, left: 30 }}
                    />
                  </Box>

                  {/* show list */}
                  <Box className="col-md-5 col-lg-4 border rounded-3">
                    <Table className='table-sm'>
                      <TableBody>
                        {overAllBloomsLevelPercentages.map(({ bloomsLevel, percentage }) => (
                          <TableRow key={bloomsLevel}>
                            <TableCell>{bloomsLevel}</TableCell>
                            <TableCell className='text-end fw-semibold'>{percentage !== 'N/A' ? `${percentage.toFixed(2)} %` : percentage}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Box>
              </Box>
            </TabPanel>

            {/* GPA graph */}
            <TabPanel value='3' className='p-0'>
              <Box className="pb-2">
                <GpaCounts
                  studentTotalMarks={studentTotalMarksArray}
                  examTotalMarks={totalExamMarks}
                />
              </Box>
            </TabPanel>
          </TabContext>


          {/* exam performance */}
          <h5 className='pb-2 border-bottom my-4'>Exam Performance</h5>

          {/* exams */}
          <Box className="row">
            {examMarksOfClass.map((exam, index) => {
              if (exam.exam_type === 'Midterm' || exam.exam_type === 'Final') {

                // Calculate blooms level percentages
                const bloomsLevelMarks = {};
                exam.obtained_exam_marks.forEach((obtainedMark) => {
                  const bloomsLevel = obtainedMark.question.blooms_level;

                  if (!bloomsLevelMarks[bloomsLevel]) {
                    bloomsLevelMarks[bloomsLevel] = {
                      totalMarks: 0,
                      obtainedMarks: 0,
                    };
                  }
                  bloomsLevelMarks[bloomsLevel].totalMarks += obtainedMark.question.marks;
                  bloomsLevelMarks[bloomsLevel].obtainedMarks += obtainedMark.marks;
                });

                // Initialize all blooms levels with 'Not answered'
                const allBloomsLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

                // Calculate percentages for all blooms levels
                const bloomsLevelPercentages = allBloomsLevels.map((bloomsLevel) => {
                  if (bloomsLevelMarks[bloomsLevel]) {
                    const { totalMarks, obtainedMarks } = bloomsLevelMarks[bloomsLevel];
                    const percentage = (obtainedMarks / totalMarks) * 100 || 0;
                    return {
                      bloomsLevel,
                      percentage,
                    };
                  } else {
                    return {
                      bloomsLevel,
                      percentage: 'N/A',
                    };
                  }
                });


                // calculated per student total marks like [{student_id: 109, total_marks: 34}, {student_id: 110, total_marks: 29}]
                const studentTotalMarks = exam.obtained_exam_marks.reduce((acc, obtainedMark) => {
                  const studentId = obtainedMark.student_id;
                  const studentTotalMarks = acc.find(item => item.student_id === studentId);
                  if (studentTotalMarks) {
                    studentTotalMarks.total_marks += obtainedMark.marks;
                  } else {
                    acc.push({ student_id: studentId, total_marks: obtainedMark.marks });
                  }
                  return acc;
                }, []);


                return (
                  <Box className="col-12 col-md-6 mb-4" key={index}>
                    <Box className="card border border-light-grey h-100">
                      {/* exam header with stats navs buttons */}
                      <Box className="card-header d-flex justify-content-between align-items-center" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        {/* title and marks */}
                        <Box className="d-flex">
                          <h6 className='mb-0' style={{ fontSize: '18px' }}>{exam.exam_type}</h6>
                          <small className="mb-0 ms-2 text-muted">(<b>{exam.total_marks}</b>)</small>
                        </Box>

                        {/* tab indexes */}
                        <Box className="btn-group shadow-0 align-items-center">
                          <button className={`btn btn${exam.exam_type === 'Midterm' ? examTabIndex.Midterm !== '1' ? '-outline' : '' : examTabIndex.Final !== '1' ? '-outline' : ''}-secondary btn-sm btn-rounded`}
                            onClick={() => setExamTabIndex({ ...examTabIndex, [exam.exam_type === 'Midterm' ? 'Midterm' : 'Final']: '1' })}
                            title='Graph'><i className="fas fa-chart-column"></i></button>

                          <button className={`btn btn${exam.exam_type === 'Midterm' ? examTabIndex.Midterm !== '2' ? '-outline' : '' : examTabIndex.Final !== '2' ? '-outline' : ''}-secondary btn-sm btn-rounded`}
                            onClick={() => setExamTabIndex({ ...examTabIndex, [exam.exam_type === 'Midterm' ? 'Midterm' : 'Final']: '2' })}
                            title='Details'><i className="fas fa-list"></i></button>

                          <button className={`btn btn${exam.exam_type === 'Midterm' ? examTabIndex.Midterm !== '3' ? '-outline' : '' : examTabIndex.Final !== '3' ? '-outline' : ''}-secondary btn-sm btn-rounded`}
                            onClick={() => setExamTabIndex({ ...examTabIndex, [exam.exam_type === 'Midterm' ? 'Midterm' : 'Final']: '3' })}
                            title='Student Category'><SpeedIcon sx={{ fontSize: '16px' }} /></button>

                          <button className={`btn btn${exam.exam_type === 'Midterm' ? examTabIndex.Midterm !== '4' ? '-outline' : '' : examTabIndex.Final !== '4' ? '-outline' : ''}-secondary btn-sm btn-rounded`}
                            onClick={() => setExamTabIndex({ ...examTabIndex, [exam.exam_type === 'Midterm' ? 'Midterm' : 'Final']: '4' })}
                            title='GPA'><InfoOutlinedIcon sx={{ fontSize: '16px' }} /></button>
                        </Box>
                      </Box>

                      {/* exam body with stats */}
                      <Box className="card-body pt-3">
                        <TabContext value={exam.exam_type === 'Midterm' ? examTabIndex.Midterm : examTabIndex.Final}>

                          {/* bar chart of bloomsLevelPercentages */}
                          <TabPanel value='1' className='p-0'>
                            <BarChart
                              xAxis={[{
                                id: 'barCategories',
                                data: bloomsLevelPercentages.map(({ bloomsLevel }) => bloomsLevel),
                                scaleType: 'band',
                              }]}
                              series={[{
                                data: bloomsLevelPercentages.map(({ percentage }) => percentage !== 'N/A' ? percentage : 0),
                                color: '#007bff',
                              }]}
                              height={220}
                              margin={{ top: 15, right: 15, bottom: 20, left: 30 }}
                            />
                          </TabPanel>

                          {/* table of bloomsLevelPercentages*/}
                          <TabPanel value='2' className='p-0'>
                            <Table className='table-sm'>
                              <TableBody>
                                {bloomsLevelPercentages.map(({ bloomsLevel, percentage }) => (
                                  <TableRow key={bloomsLevel}>
                                    <TableCell>{bloomsLevel}</TableCell>
                                    <TableCell className='text-end fw-semibold'>{percentage !== 'N/A' ? `${percentage.toFixed(2)} %` : percentage}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TabPanel>

                          {/* Student category circular level */}
                          <TabPanel value='3' className='p-0'>
                            <StudentCategoryCircularLevel
                              studentTotalMarks={studentTotalMarks}
                              examTotalMarks={exam.total_marks}
                              barWidth={'70px'}
                              colClasses={'col-6 col-md-4'}
                            />
                          </TabPanel>

                          {/* marks range details */}
                          <TabPanel value='4' className='px-0 py-3'>
                            <MarksRangeCount
                              studentTotalMarks={studentTotalMarks}
                              examTotalMarks={exam.total_marks}
                            />
                          </TabPanel>
                        </TabContext>
                      </Box>
                    </Box>
                  </Box>
                )
              }
            })}
          </Box>


          {/* class activities */}
          <h5 className='pb-2 border-bottom my-4'>Class Activities</h5>

          <Box className="row">
            {examMarksOfClass.map((exam, index) => {

              if (exam.exam_type !== 'Midterm' && exam.exam_type !== 'Final') {

                let marksObtained = exam.obtained_ca_marks;

                return (
                  <Box className="col-12 col-md-6 mb-4" key={index}>

                    {/* collapsable card */}
                    <Accordion className='border border-light-grey'>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header" className='border-bottom'>
                        <Box className="w-100 d-flex justify-content-between align-items-center me-3">
                          <h6 className='mb-0' style={{ fontSize: '18px' }}>{exam.exam_type}</h6>
                          <p className="mb-0"><b>{exam.total_marks}</b></p>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails className='px-4 py-3'>
                        <MarksRangeCount
                          studentTotalMarks={marksObtained}
                          examTotalMarks={exam.total_marks}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                )
              }
            })}
          </Box>
        </Box>
        : loading ? <div className="text-center"><span className='spinner-border my-4'></span></div>
          : <div className="text-center my-5">No Exams Found</div>}


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </Box>
  )
}
