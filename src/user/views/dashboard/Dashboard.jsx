import { Box } from "@mui/material";
import DashboardCountShowCard from "./components/DashboardCountShowCard";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import CustomSnackbar from "../../../utilities/SnackBar";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';

export default function UserDashboard() {

  // const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [dashboardContent, setDashboardContent] = useState({});

  // get batch students info of a batch
  const getDashboardContent = useCallback(() => {
    setLoading(true)
    axios.get(`/api/user/dashboard`).then(res => {
      if (res.status === 200) {
        setDashboardContent(res.data.content)
        // console.log(res.data.content)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    }).finally(() => {
      setLoading(false)
    });
  }, [])


  useEffect(() => {
    getDashboardContent()
  }, [getDashboardContent])


  // calculate blooms level
  const calculateStudentsBloomsLevel = () => {
    let allStudentsBloomsLevel = [];

    dashboardContent.student_profiles?.forEach(studentData => {
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

    dashboardContent.student_profiles?.forEach(studentData => {
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

  // console.log(calculateStudentsCGPA())

  return (
    <Box className="container">
      {loading ? <Box className="text-center"><span className="spinner-border my-5" role="status"></span></Box>
        :
        <Box className="row my-2">

          {/* heading cards */}
          <DashboardCountShowCard label={'Current Semester Classes'} count={dashboardContent.assigned_classes}
            icon={'fas fa-chalkboard-user'} color={'success'} />

          <DashboardCountShowCard label={'Assigned Students'} count={dashboardContent.assigned_students}
            icon={'fas fa-people-roof'} color={'info'} />

          <DashboardCountShowCard label={'Retake Students'} count={dashboardContent.retake_students}
            icon={'fas fa-person-walking-arrow-loop-left'} color={'danger'} />

          <DashboardCountShowCard label={'Total Conducted Classes'} count={dashboardContent.total_classes}
            icon={'fas fa-clipboard-check'} color={'primary'} />


          {/* blooms level counts */}
          <Box className="col-12 col-lg-8 mb-4">
            <Box className="card h-100">
              <Box className="card-header">
                <h6 className="my-2">Average Blooms Levels of My Classes</h6>
              </Box>

              <Box className="card-body">
                {dashboardContent.student_profiles?.length > 0 ?
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
                  : <Box className='text-center my-5'>Not enough data to show this report</Box>
                }
              </Box>
            </Box>
          </Box>

          {/* average GPA of my classes */}
          <Box className="col-12 col-lg-4 mb-4">
            <Box className="card h-100">
              <Box className="card-header">
                <h6 className="my-2">Average GPA of My Classes</h6>
              </Box>

              <Box className="card-body">
                {dashboardContent.student_profiles?.length > 0 ?
                  <PieChart
                    series={[{
                      data: Object.entries(calculateStudentsCGPA().countCGPAs).map(([label, value]) => ({ id: label, value: value, label: label })),
                      arcLabel: (d) => `${d.id}: ${d.value}`,
                      arcLabelMinAngle: 20,
                    }]}
                    height={240}
                    slotProps={{
                      legend: {
                        labelStyle: {
                          fontSize: 12,
                        },
                        itemGap: 5,
                        itemMarkHeight: 15,
                        itemMarkWidth: 15,
                      },
                    }}
                    sx={{
                      [`& .${pieArcLabelClasses.root}`]: {
                        fill: 'white',
                        fontSize: 12,
                      },
                    }}
                  />
                  : <Box className='text-center my-5'>Not enough data to show this report</Box>
                }
              </Box>
            </Box>
          </Box>

        </Box>
      }



      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </Box>
  )
}
