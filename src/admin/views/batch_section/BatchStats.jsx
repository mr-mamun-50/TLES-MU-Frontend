import { Box } from '@mui/material';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom'
import CustomSnackbar from '../../../utilities/SnackBar';
import { BarChart } from '@mui/x-charts/BarChart';

export default function BatchStats() {

  // const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState();

  const batch_id = useParams().batch_id;
  const location = useLocation();
  const batch = location.state.batch;

  const [batchProfiles, setBatchProfiles] = useState([])


  // get batch students info of a batch
  const getBatchInfo = useCallback(() => {
    setLoading(true)
    axios.get(`/api/${role}/batch_section/batch/${batch_id}`).then(res => {
      if (res.status === 200) {
        setBatchProfiles(res.data.batch_profiles)
        // console.log(res.data.batch_profiles)
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
  }, [batch_id, role])


  useEffect(() => {
    localStorage.getItem('role') ?
      setRole(localStorage.getItem('role'))
      : setRole(sessionStorage.getItem('role'))

    role && getBatchInfo()
  }, [getBatchInfo, role])



  // calculate GPA points
  const calculateGpaPoints = (obtained, total) => {
    let marks = obtained / total * 100;
    if (marks >= 80) return 4;
    if (marks >= 75) return 3.75;
    if (marks >= 70) return 3.50;
    if (marks >= 65) return 3.25;
    if (marks >= 60) return 3;
    if (marks >= 55) return 2.75;
    if (marks >= 50) return 2.50;
    if (marks >= 45) return 2.25;
    if (marks >= 40) return 2;
    return 0;
  }

  // calculate obtained marks
  const calculateObtainedMarks = (exams) => {
    let total = 0;
    let final = 0;
    let totalWithoutFinal = 0

    exams.forEach(exam => {
      const obtainedExamMarks = exam.obtainedExamMarks.reduce((sum, obtainedMark) => sum + obtainedMark.marks, 0);
      const obtainedCaMarks = exam.obtainedCaMarks.reduce((sum, obtainedMark) => sum + obtainedMark.marks, 0);
      total += obtainedExamMarks + obtainedCaMarks;

      if (exam.exam_type === 'Final') {
        final = obtainedExamMarks
      } else {
        totalWithoutFinal += obtainedExamMarks + obtainedCaMarks
      }
    })

    return { total, final, totalWithoutFinal }
  }

  // calculate all students CGPA
  const calculateStudentsCGPA = () => {
    let allStudentsCGPA = [];

    batchProfiles.forEach(studentData => {
      let totalCompletedCredit = 0;
      let semestersCgpa = {};
      let completedCoursesGpa = [];
      let studentCGPA = {};

      studentData.map(semester => {
        let completedCredit = 0;

        const totalGpaPoints = semester.assigned_classes.map(class_data => {
          // obtained marks
          const obtainedMarksWithoutFinal = calculateObtainedMarks(class_data.exams).totalWithoutFinal;
          let obtainedFinalMarks = calculateObtainedMarks(class_data.exams).final;

          if (typeof class_data.obtainedSuppleMarks === 'object' && Object.keys(class_data.obtainedSuppleMarks).length > 0) {
            // calculate the marks of each values of each keys
            Object.keys(class_data.obtainedSuppleMarks).forEach(examId => {
              let newMark = class_data.obtainedSuppleMarks[examId].reduce((acc, curr) => acc + curr.marks, 0);
              if (newMark > obtainedFinalMarks) {
                obtainedFinalMarks = newMark;
              }
            });
          }
          const obtainedMarks = obtainedMarksWithoutFinal + obtainedFinalMarks;

          // total marks
          const totalExamMarks = class_data.exams.reduce((acc, curr) => acc + curr.total_marks, 0);
          const totalFinalExamMarks = class_data.exams.filter(exam => exam.exam_type === 'Final').reduce((acc, curr) => acc + curr.total_marks, 0);
          const totalMarksWithoutFinal = class_data.exams.filter(exam => exam.exam_type !== 'Final').reduce((acc, curr) => acc + curr.total_marks, 0);

          // calculate GPA
          const gpa = (obtainedFinalMarks * 100) / totalFinalExamMarks >= 40 ?
            (obtainedMarksWithoutFinal * 100) / totalMarksWithoutFinal >= 40 ?
              calculateGpaPoints(obtainedMarks, totalExamMarks)
              : calculateGpaPoints(0, 0)
            : calculateGpaPoints(0, 0);

          if (gpa === 0) return 0;

          // add course to completedCoursesGpa array, adding completed credit, totalCompletedCredit
          completedCoursesGpa.push({
            'course_name': class_data.course_details.title,
            'gpa': gpa,
            'credit_hours': class_data.course_details.credit_hours,
          });
          completedCredit += parseFloat(class_data.course_details.credit_hours);
          totalCompletedCredit += parseFloat(class_data.course_details.credit_hours);

          return gpa * class_data.course_details.credit_hours;
        }).reduce((acc, curr) => acc + curr, 0);

        // semester CGPA
        const semesterCgpa = totalGpaPoints / completedCredit;
        // add semester CGPA to semestersCgpa object
        semestersCgpa[semester.name] = semesterCgpa > 0 ?
          { 'semesterCgpa': semesterCgpa.toFixed(2), 'completedCredit': completedCredit }
          : { 'semesterCgpa': 0, 'completedCredit': 0 };
      });

      // calculate CGPA (SUM(course credit * gpa) / total completed credit) credit
      let cgpa = completedCoursesGpa.map(course => {
        return course.gpa * course.credit_hours
      }).reduce((acc, curr) => acc + curr, 0) / totalCompletedCredit

      cgpa = cgpa > 0 ? cgpa : 0;

      studentCGPA = {
        'cgpa': cgpa.toFixed(2),
        'completedCredit': totalCompletedCredit,
        'semestersCgpa': semestersCgpa,
        'completedCoursesGpa': completedCoursesGpa,
      };

      allStudentsCGPA.push(studentCGPA);
    });


    // Count the number of CGPAs
    let countCGPAs = {
      'F (0.00)': 0, 'D (2.00+)': 0, 'C (2.25+)': 0, 'C+ (2.50+)': 0,
      'B- (2.75+)': 0, 'B (3.00+)': 0, 'B+ (3.25+)': 0, 'A- (3.50+)': 0, 'A (3.75+)': 0, 'A+ (4.00)': 0,
    };

    allStudentsCGPA.forEach(student => {
      let cgpa = student.cgpa;
      if (cgpa === 4.00)
        countCGPAs['A+ (4.00)']++;
      else if (cgpa >= 3.75)
        countCGPAs['A (3.75+)']++;
      else if (cgpa >= 3.50)
        countCGPAs['A- (3.50+)']++;
      else if (cgpa >= 3.25)
        countCGPAs['B+ (3.25+)']++;
      else if (cgpa >= 3.00)
        countCGPAs['B (3.00+)']++;
      else if (cgpa >= 2.75)
        countCGPAs['B- (2.75+)']++;
      else if (cgpa >= 2.50)
        countCGPAs['C+ (2.50+)']++;
      else if (cgpa >= 2.25)
        countCGPAs['C (2.25+)']++;
      else if (cgpa >= 2.00)
        countCGPAs['D (2.00+)']++;
      else
        countCGPAs['F (0.00)']++;
    });

    return {
      'allStudentsCGPA': allStudentsCGPA,
      'countCGPAs': countCGPAs,
    };
  }

  // calculate blooms level
  const calculateStudentsBloomsLevel = () => {
    let allStudentsBloomsLevel = [];

    batchProfiles.forEach(studentData => {
      let studentBloomsLevel = {};
      let bloomsLevelMarks = {};

      studentData.forEach(semester => {
        semester.assigned_classes.forEach(class_data => {
          class_data.exams.forEach((exam) => {
            exam.obtainedExamMarks.forEach((obtainedMark) => {
              const bloomsLevel = obtainedMark.question_details.blooms_level;

              if (!bloomsLevelMarks[bloomsLevel]) {
                bloomsLevelMarks[bloomsLevel] = {
                  totalMarks: 0,
                  obtainedMarks: 0,
                };
              }

              bloomsLevelMarks[bloomsLevel].totalMarks += obtainedMark.question_details.marks;
              bloomsLevelMarks[bloomsLevel].obtainedMarks += obtainedMark.marks;
            });
          });
        });
      });

      const allBloomsLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

      const bloomsLevelPercentages = allBloomsLevels.map((bloomsLevel) => {
        if (bloomsLevelMarks[bloomsLevel]) {
          const { totalMarks, obtainedMarks } = bloomsLevelMarks[bloomsLevel];
          const percentage = (obtainedMarks / totalMarks) * 100 || 0;

          return {
            bloomsLevel,
            percentage,
          };
        }
        else {
          return {
            bloomsLevel,
            percentage: 0,
          };
        }
      });

      studentBloomsLevel = bloomsLevelPercentages;

      allStudentsBloomsLevel.push(studentBloomsLevel);
    });

    // average levels of all students
    let averageBloomsLevel = [];
    allStudentsBloomsLevel.forEach(studentBloomsLevel => {
      studentBloomsLevel.forEach(level => {
        if (!averageBloomsLevel[level.bloomsLevel]) {
          averageBloomsLevel[level.bloomsLevel] = 0;
        }
        averageBloomsLevel[level.bloomsLevel] += level.percentage;
      });
    });
    Object.keys(averageBloomsLevel).forEach(level => {
      averageBloomsLevel[level] = (averageBloomsLevel[level] / allStudentsBloomsLevel.length).toFixed(2);
    });

    return averageBloomsLevel;
  }


  const gpaKeys = Object.keys(calculateStudentsCGPA().countCGPAs);

  // Divide the GPA keys into two groups
  const firstColumn = gpaKeys.slice(0, 5);
  const secondColumn = gpaKeys.slice(5);


  // console.log(batchProfiles);

  return (
    <Box className="container">
      <Box className="card my-2">
        {/* seading section */}
        <Box className='card-header pb-0 d-flex justify-content-between align-items-center' sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box className='d-flex'>
            <button onClick={() => window.history.back()} className='btn btn-light btn-floating me-3 mt-2'>
              <i className='fas fa-arrow-left fa-lg'></i></button>
            <Box className='my-2'>
              <h5 className='card-title mb-1'>
                Batch: {batch.batch_name}
              </h5>
              <small> Sections:
                {batch.sections.map((section, index) => (
                  <span className='fw-semibold'>
                    {` ${section.section_name}${batch.sections.length - 1 !== index ? ', ' : ''}`}
                  </span>
                ))}
              </small> <br />
              <small className='text-muted'>{`${batch.department.name}`}</small>
            </Box>
          </Box>
        </Box>

        {/* body section */}
        <Box className="card-body">
          {batchProfiles.length > 0 ?
            <Box className='mx-2'>
              <h5 className='pb-2 border-bottom mb-4 mt-2'>CGPA At A Glance</h5>

              {/* CGPA Counts section */}
              <Box className='row mb-5 me-0'>
                {/* Show GPA counts graph */}
                <Box className="col-md-7 col-lg-8">
                  <BarChart
                    xAxis={[{
                      id: 'GPA',
                      data: Object.keys(calculateStudentsCGPA().countCGPAs),
                      scaleType: 'band',
                    }]}
                    series={[{
                      data: Object.values(calculateStudentsCGPA().countCGPAs),
                      color: '#007bff',
                    }]}
                    height={220}
                    margin={{ top: 15, right: 15, bottom: 20, left: 30 }}
                  />
                </Box>

                {/* show list */}
                <Box className="col-md-5 col-lg-4">
                  <Box className='row mt-4 border border-light-grey rounded'>
                    {/* First Column */}
                    <Box className='col border-end'>
                      <ul className='list-group list-group-light list-group-small px-3'>
                        {firstColumn.map((gpa, index) => (
                          <li className='list-group-item d-flex justify-content-between align-items-center' key={index}>
                            <small>{gpa}</small>
                            <small>{calculateStudentsCGPA().countCGPAs[gpa]}</small>
                          </li>
                        ))}
                      </ul>
                    </Box>

                    {/* Second Column */}
                    <Box className='col'>
                      <ul className='list-group list-group-light list-group-small px-3'>
                        {secondColumn.map((gpa, index) => (
                          <li className='list-group-item d-flex justify-content-between align-items-center' key={index}>
                            <small>{gpa}</small>
                            <small>{calculateStudentsCGPA().countCGPAs[gpa]}</small>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  </Box>
                </Box>
              </Box>


              {/* blooms level */}
              <h5 className='pb-2 border-bottom mb-4 pt-3'>Blooms Level Based Performance</h5>

              {/* blooms level counts */}
              <Box className='row mb-4 me-0'>
                {/* show graph */}
                <Box className="col-md-7 col-lg-8">
                  <BarChart
                    xAxis={[{
                      id: 'barCategories',
                      data: Object.keys(calculateStudentsBloomsLevel()),
                      scaleType: 'band',
                    }]}
                    series={[{
                      data: Object.values(calculateStudentsBloomsLevel()),
                      color: '#007bff',
                    }]}
                    height={230}
                    margin={{ top: 15, right: 15, bottom: 20, left: 30 }}
                  />
                </Box>

                {/* show list details */}
                <Box className="col-md-5 col-lg-4">
                  <Box className='border border-light-grey rounded'>
                    <ul className='list-group list-group-light list-group-small px-3'>
                      {Object.keys(calculateStudentsBloomsLevel()).map((level, index) => (
                        <li className='list-group-item d-flex justify-content-between align-items-center' key={index}>
                          <small>{level}</small>
                          <small>{calculateStudentsBloomsLevel()[level]} %</small>
                        </li>
                      ))}
                    </ul>
                  </Box>
                </Box>
              </Box>

            </Box>
            : loading ? <div className="text-center"><span className='spinner-border my-4'></span></div>
              : <div className="text-center my-5">No Data Found</div>}
        </Box>
      </Box>


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </Box>
  )
}
