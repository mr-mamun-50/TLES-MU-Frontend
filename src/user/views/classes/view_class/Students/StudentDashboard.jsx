import { Box, Table, TableBody, TableCell, TableRow } from '@mui/material'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import CustomSnackbar from '../../../../../utilities/SnackBar'

export default function StudentDashboard() {

  // const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const student_id = useParams().id
  const location = useLocation()
  const assigned_class = location.state?.assigned_class
  const student = location.state?.student

  const [examMarksOfClass, setExamMarksOfClass] = useState([])

  const totalExamMarks = examMarksOfClass.length > 0 && examMarksOfClass.reduce((sum, exam) => sum + exam.total_marks, 0);

  const totalObtainedMarks = examMarksOfClass.length > 0 && examMarksOfClass.map((exam) => {
    const obtainedExamMarks = exam.obtained_exam_marks.reduce((sum, obtainedMark) => sum + obtainedMark.marks, 0);
    const obtainedCaMarks = exam.obtained_ca_marks ? exam.obtained_ca_marks.marks : 0;
    return obtainedExamMarks + obtainedCaMarks;
  }).reduce((sum, obtainedMarks) => sum + obtainedMarks, 0);

  // console.log(totalObtainedMarks)


  // get all exam marks
  const getAllExamMarks = useCallback(() => {
    setLoading(true)
    axios.get(`/api/user/students/class_exam_marks/${student_id}/${assigned_class.id}`).then(res => {
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
  }, [assigned_class.id, student_id])


  useEffect(() => {
    getAllExamMarks()
  }, [getAllExamMarks])



  return (
    <Box className="container">
      <Box className="card my-2">
        {/* seading section */}
        <Box className='card-header pb-0 d-flex justify-content-between align-items-end' sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box className='d-flex'>
            <button onClick={() => window.history.back()} className='btn btn-light btn-floating me-3 mt-2'>
              <i className='fas fa-arrow-left fa-lg'></i></button>
            <Box className='my-2'>
              <h5 className='card-title mb-1'>{assigned_class.course?.title}</h5>
              <small className='text-muted'>{` ${assigned_class.section?.batch.department.name} - ${assigned_class.section?.batch.batch_name} (${assigned_class.section?.section_name})`}</small>
            </Box>
          </Box>
        </Box>

        {/* body section */}
        <Box className="card-body">
          {/* student info and all marks */}
          <Box className="bg-light rounded px-4 py-3 d-flex justify-content-between align-items-center">
            <Box>
              <h6 className="card-title" style={{ fontSize: '18px' }}>{student.name}</h6>
              <p className="card-title mb-0">ID: {student.student_id}</p>
            </Box>
            {/* total marks obtained from obtained exam marks and obtained ca marks */}
            <Box className="d-flex">
              <h5 className='mb-0'>{totalObtainedMarks}</h5>
              <h5 className="mb-0 fw-normal">/{totalExamMarks}</h5>
            </Box>
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
                        // If blooms level is not present in obtained marks
                        return {
                          bloomsLevel,
                          percentage: 'N/A',
                        };
                      }
                    });

                    return (
                      <Box className="col-12 col-md-6 mb-4" key={index}>
                        <Box className="card border border-light-grey">
                          <Box className="card-header d-flex justify-content-between align-items-center bg-light">
                            <h6 className='mb-0' style={{ fontSize: '18px' }}>{exam.exam_type}</h6>
                            <p className="mb-0"><b>{obtainedMarks}</b>/{exam.total_marks}</p>
                          </Box>

                          <Box className="card-body pt-3">
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
                            <h6 className='mb-0' style={{ fontSize: '18px' }}>{exam.exam_type}</h6>
                            <p className="mb-0"><b>{exam.obtained_ca_marks?.marks ?? 0}</b>/{exam.total_marks}</p>
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
    </Box>
  )
}
