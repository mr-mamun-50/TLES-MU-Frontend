import { Box, Table, TableBody, TableCell, TableRow } from '@mui/material'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import CustomSnackbar from '../../../../../utilities/SnackBar'
import { BarChart } from '@mui/x-charts/BarChart';
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

export default function StudentDashboard() {

  // const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState()

  const student_id = useParams().id
  const location = useLocation()
  const assigned_class = location.state?.assigned_class
  const student = location.state?.student

  const [examMarksOfClass, setExamMarksOfClass] = useState([])
  // tab index for graph and details
  const [tabIndex, setTabIndex] = useState({ Midterm: '1', Final: '1' });


  // get all exam marks
  const getAllExamMarks = useCallback(() => {
    setLoading(true)
    axios.get(`/api/${role}/class_students/class_exam_marks/${student_id}/${assigned_class.id}`).then(res => {
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
  }, [assigned_class.id, role, student_id])


  useEffect(() => {
    localStorage.getItem('role') ?
      setRole(localStorage.getItem('role'))
      : setRole(sessionStorage.getItem('role'))

    role && getAllExamMarks()
  }, [getAllExamMarks, role])


  const totalExamMarks = examMarksOfClass.length > 0 && examMarksOfClass.reduce((sum, exam) => sum + exam.total_marks, 0);
  const totalFinalExamMarks = examMarksOfClass.length > 0 && examMarksOfClass.filter(exam => exam.exam_type === 'Final').reduce((sum, exam) => sum + exam.total_marks, 0);
  const totalMarksWithoutFinal = examMarksOfClass.length > 0 && examMarksOfClass.filter(exam => exam.exam_type !== 'Final').reduce((sum, exam) => sum + exam.total_marks, 0);

  // calculate obtained marks
  const obtainedMarks = () => {
    let total = 0;
    let final = 0;
    let totalWithoutFinal = 0

    examMarksOfClass.forEach(exam => {
      const obtainedExamMarks = exam.obtained_exam_marks.reduce((sum, obtainedMark) => sum + obtainedMark.marks, 0);
      const obtainedCaMarks = exam.obtained_ca_marks.length > 0 ? exam.obtained_ca_marks[0].marks : 0;
      total += obtainedExamMarks + obtainedCaMarks;

      if (exam.exam_type === 'Final') {
        final = obtainedExamMarks
      } else {
        totalWithoutFinal += obtainedExamMarks + obtainedCaMarks
      }
    })

    return { total, final, totalWithoutFinal }
  }

  // calculate gpa
  const calculateGpa = (obtained, total) => {
    let marks = obtained / total * 100;
    if (marks >= 80) return 'A+ (4.00)';
    if (marks >= 75) return 'A (3.75)';
    if (marks >= 70) return 'A- (3.50)';
    if (marks >= 65) return 'B+ (3.25)';
    if (marks >= 60) return 'B (3.00)';
    if (marks >= 55) return 'B- (2.75)';
    if (marks >= 50) return 'C+ (2.50)';
    if (marks >= 45) return 'C (2.25)';
    if (marks >= 40) return 'D (2.00)';
    return 'F (0.00)';
  }


  // console.log(totalFinalExamMarks)

  return (
    <Box className="container">
      <Box className="card my-2">
        {/* Heading section */}
        <Box className='card-header pb-0 d-flex justify-content-between align-items-center' sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box className='d-flex'>
            <button onClick={() => window.history.back()} className='btn btn-light btn-floating me-3 mt-2'>
              <i className='fas fa-arrow-left fa-lg'></i></button>
            <Box className='my-2'>
              <h5 className='card-title mb-1'>{assigned_class.course?.title}</h5>
              <small className='text-muted'>{` ${assigned_class.section?.batch.department.name} - ${assigned_class.section?.batch.batch_name} (${assigned_class.section?.section_name})`}</small>
            </Box>
          </Box>

          {/* See student profile */}
          <Link to={`${role === 'user' ? '' : `/${role}/assign-classes`}/classes/student-profile/${student_id}`} state={{ 'student': student }}
            className='btn btn-outline-dark'>
            <i className='fas fa-user-circle fa-lg me-1'></i> See Profile
          </Link>
        </Box>

        {/* body section */}
        <Box className="card-body">
          {/* student info and all marks */}
          <Box className="bg-light rounded-3 px-4 py-3 d-flex justify-content-between align-items-center">
            <Box>
              <h6 className="card-title" style={{ fontSize: '18px' }}>{student.name}</h6>
              <p className="card-title mb-0">ID: {student.student_id}</p>
            </Box>

            {/* total marks obtained from obtained exam marks and obtained ca marks and GPA */}
            {examMarksOfClass.length > 0 &&
              <Box className="d-flex align-items-center">
                {totalExamMarks === 100 ?
                  <span span className="badge badge-danger me-3">
                    {(obtainedMarks().totalWithoutFinal * 100) / totalMarksWithoutFinal < 40 ?
                      'Retake' : (obtainedMarks().final * 100) / totalFinalExamMarks < 40 ? 'Supple' : ''}
                  </span>
                  : <span className="badge badge-info me-3">Not Completed</span>
                }
                <Box>
                  <Box className="d-flex justify-content-end">
                    <h5 className="mb-0">{obtainedMarks().total}</h5>
                    <h5 className="mb-0 fw-normal">/{totalExamMarks}</h5>
                  </Box>
                  <p className='mb-0 mt-2 text-end'>
                    {calculateGpa((obtainedMarks().totalWithoutFinal * 100) / totalMarksWithoutFinal > 40 ? obtainedMarks().total : 0, totalExamMarks)}
                  </p>
                </Box>
              </Box>
            }
          </Box>

          {/* exam based info */}
          {examMarksOfClass.length > 0 ?
            <Box className="pt-3">
              <h5 className='pb-2 border-bottom my-4'>Exams</h5>

              {/* exams */}
              <Box className="row">
                {examMarksOfClass.map((exam, index) => {
                  if (exam.exam_type === 'Midterm' || exam.exam_type === 'Final') {

                    // calculate the sum of all the obtained marks
                    const obtainedMarks = exam.obtained_exam_marks.map(obtained_marks => obtained_marks.marks).reduce((acc, curr) => acc + curr, 0)

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

                    return (
                      <Box className="col-12 col-md-6 mb-4" key={index}>
                        <Box className="card border border-light-grey h-100">
                          <Box className="card-header d-flex justify-content-between align-items-center" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <h6 className='mb-0' style={{ fontSize: '18px' }}>{exam.exam_type}</h6>

                            <Box className="d-flex align-items-center">
                              {/* tab indexes */}
                              <Box className="btn-group shadow-0 align-items-center me-4">
                                <button className={`btn btn${exam.exam_type === 'Midterm' ? tabIndex.Midterm === '2' ? '-outline' : '' : tabIndex.Final === '2' ? '-outline' : ''}-secondary btn-sm btn-rounded`}
                                  onClick={() => setTabIndex({ ...tabIndex, [exam.exam_type === 'Midterm' ? 'Midterm' : 'Final']: '1' })}
                                  title='Graph'><i className="fas fa-chart-column"></i></button>

                                <button className={`btn btn${exam.exam_type === 'Midterm' ? tabIndex.Midterm === '1' ? '-outline' : '' : tabIndex.Final === '1' ? '-outline' : ''}-secondary btn-sm btn-rounded`}
                                  onClick={() => setTabIndex({ ...tabIndex, [exam.exam_type === 'Midterm' ? 'Midterm' : 'Final']: '2' })}
                                  title='Details'><i className="fas fa-list"></i></button>
                              </Box>

                              {/* marks */}
                              <p className="mb-0" style={{ fontSize: '18px' }}>
                                <b className={`${exam.exam_type === 'Final' && ((obtainedMarks * 100) / exam.total_marks) < 40 && 'text-danger'}`}>{obtainedMarks}</b>
                                /{exam.total_marks}
                              </p>
                            </Box>
                          </Box>

                          <Box className="card-body pt-3">
                            <TabContext value={exam.exam_type === 'Midterm' ? tabIndex.Midterm : tabIndex.Final}>

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
                    return (
                      <Box className="col-12 col-md-6 mb-4" key={index}>
                        <Box className="card border border-light-grey">
                          <Box className="card-body d-flex justify-content-between align-items-center">
                            <h6 className='mb-0 text-dark' style={{ fontSize: '18px' }}>{exam.exam_type}</h6>
                            <p className="mb-0"><b>{exam.obtained_ca_marks[0]?.marks ?? 0}</b>/{exam.total_marks}</p>
                          </Box>
                        </Box>
                      </Box>
                    )
                  }
                })}
              </Box>
            </Box>
            : loading ? <div className="text-center"><span className='spinner-border my-4'></span></div>
              : <div className="text-center my-5">No Exams Found</div>}
        </Box>
      </Box>


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </Box >
  )
}
