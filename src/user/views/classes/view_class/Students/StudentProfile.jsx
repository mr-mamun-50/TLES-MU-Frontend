import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material'
import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import CustomSnackbar from '../../../../../utilities/SnackBar'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart';
import { useReactToPrint } from 'react-to-print'
import { StudentProfilePrint } from '../../../print_views/StudentProfile'
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import MuLogo from '../../../../../assets/images/logo/mu_logo.png';
import TlesLogo from '../../../../../assets/images/logo/tles_logo_dt.png';


export default function StudentProfile() {

  // const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState()

  const student_id = useParams().id
  const location = useLocation()
  const student = location.state?.student

  const [semesterWithMarks, setSemesterWithMarks] = useState([])


  // get profile data
  const getProfileData = useCallback(() => {
    setLoading(true)
    axios.get(`/api/${role}/student/profile/${student_id}`).then(res => {
      if (res.status === 200) {
        setSemesterWithMarks(res.data.semesters)
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
  }, [role, student_id])


  useEffect(() => {
    localStorage.getItem('role') ?
      setRole(localStorage.getItem('role'))
      : setRole(sessionStorage.getItem('role'))

    role && getProfileData()
  }, [getProfileData, role])


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


  // calculate average CGPA (SUM(all semester CGPA) / number of semesters)
  const averageCgpa = () => {
    let totalCompletedCredit = 0;
    let semestersCgpa = {};
    let completedCoursesGpa = [];

    semesterWithMarks?.map(semester => {
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

    return {
      'cgpa': cgpa,
      'completedCredit': totalCompletedCredit,
      'semestersCgpa': semestersCgpa,
      'completedCoursesGpa': completedCoursesGpa,
    }
  }

  // console.log(averageCgpa().semestersCgpa)


  const componentRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useReactToPrint({
    documentTitle: `${student.student_id} - Academic Record`,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    },
    content: () => componentRef.current,
    onAfterPrint: () => {
      setIsPrinting(false);
    }
  });


  const downloadPDF = () => {
    const input = document.getElementById('pdf-content');

    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgWidth = 210 - (0.5 * 2) * 25.4; // A4 width - 0.7 inch margin converted to mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const marginLeft = 0.5 * 25.4; // Convert inches to mm for jsPDF
        const marginTop = 0.7 * 25.4; // Convert inches to mm for jsPDF

        // student profile text
        pdf.setFontSize(16);
        pdf.text('Student Profile', marginLeft, marginTop);
        //  name
        pdf.setFontSize(12);
        pdf.text('Name: ' + student.name, marginLeft, marginTop + 7);
        // id
        pdf.setFontSize(10);
        pdf.text('ID: ' + student.student_id, marginLeft, marginTop + 13);
        // department
        pdf.setFontSize(10);
        pdf.text('Department: ' + student.department?.name, marginLeft, marginTop + 19);
        // batch, section
        pdf.setFontSize(10);
        pdf.text('Batch: ' + student.batch?.batch_name + ', Section: ' + student.section?.section_name, marginLeft, marginTop + 25);

        // Right side
        const rightMarginProfile = marginLeft + imgWidth - 80; // Adjust as needed
        const rightMarginLabels = rightMarginProfile + 15;
        const rightMarginValues = rightMarginProfile + 60; // Adjust as needed
        const logoHeight = 10; // Adjust as needed

        // Add MU Logo
        const muLogoImg = new Image();
        muLogoImg.src = MuLogo;
        pdf.addImage(muLogoImg, 'PNG', rightMarginProfile, marginTop - 5, 30, logoHeight);

        // draw a vertical line as a divider of two logo
        pdf.setLineWidth(0.1);
        pdf.line(rightMarginProfile + 35, marginTop - 5, rightMarginProfile + 35, marginTop - 5 + logoHeight);

        // Add TLES Logo
        const tlesLogoImg = new Image();
        tlesLogoImg.src = TlesLogo;
        pdf.addImage(tlesLogoImg, 'PNG', rightMarginProfile + 40, marginTop - 5, 30, logoHeight);

        const cgpaTopMargin = marginTop + logoHeight + 8;
        pdf.text('CGPA:', rightMarginLabels, cgpaTopMargin);
        pdf.text(averageCgpa().cgpa.toFixed(2), rightMarginValues, cgpaTopMargin);

        const creditCompletedTopMargin = cgpaTopMargin + 6;
        pdf.text('Credit Completed:', rightMarginLabels, creditCompletedTopMargin);
        pdf.text(averageCgpa().completedCredit.toFixed(), rightMarginValues, creditCompletedTopMargin);

        // Draw a horizontal line below the Student Profile section
        const lineY = marginTop + 30; // Adjust the vertical position of the line as needed
        pdf.setLineWidth(0.3); // Adjust line width as needed
        pdf.line(12, lineY, marginLeft + imgWidth, lineY);

        pdf.addImage(imgData, 'PNG', marginLeft, marginTop + 35, imgWidth, imgHeight);

        pdf.save(`${student.student_id} - Student Profile`);
      });
  };


  return (
    <Box className="container">
      <Box className="card my-2">
        {/* Heading section */}
        <Box className='card-header pb-0 d-flex justify-content-between align-items-center' sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box className='d-flex'>
            <button onClick={() => window.history.back()} className='btn btn-light btn-floating me-3 mt-2'>
              <i className='fas fa-arrow-left fa-lg'></i></button>
            <Box className='my-2'>
              <h5 className='card-title mb-1'>{student.name}</h5>
              <p className='text-muted mb-0'>ID: {student.student_id}</p>
            </Box>
          </Box>

          {semesterWithMarks.length > 0 &&
            <Box className='text-end'>
              <h5 className="mb-1" style={{ fontSize: '18px' }}><span className='fw-normal'>CGPA: </span>{averageCgpa().cgpa.toFixed(2)}</h5>
              <p className='text-muted mb-0' style={{ fontSize: '14px' }}>Credit completed: <b>{averageCgpa().completedCredit}</b></p>
            </Box>
          }
        </Box>

        {/* Print button */}
        <Box className="d-flex justify-content-end mb-2 px-4 pt-3">
          {/* download snapshot */}
          <button className="btn btn-outline-dark border-grey ms-2 d-flex align-items-center" onClick={downloadPDF}>
            <i className="fas fa-download me-2"></i> Snapshot
          </button>
          {/* print button */}
          <button className="btn btn-outline-dark border-grey ms-2 d-flex align-items-center" onClick={handlePrint}>
            <i className="fas fa-print me-2"></i> Print
          </button>
        </Box>


        {/* body section */}
        <Box className="card-body pt-2" id="pdf-content">

          {/* semester performance graph */}
          {Object.values(averageCgpa().semestersCgpa).length > 0 &&
            <Box className="mb-5 px-2">
              <LineChart
                xAxis={[{
                  data: Object.keys(averageCgpa().semestersCgpa),
                  scaleType: 'point',
                }]}
                series={[{
                  data: Object.values(averageCgpa().semestersCgpa).map(semester => semester.semesterCgpa),
                  color: '#007bff',
                }]}
                height={220}
                margin={{ top: 15, bottom: 20 }}
              />
            </Box>
          }


          {/* semester wise result accordion */}
          {semesterWithMarks.length > 0 ?
            semesterWithMarks.map((semester, semester_index) => {

              let totalCredit = semester.assigned_classes.reduce((acc, curr) => acc + parseFloat(curr.course_details.credit_hours), 0);

              return (
                <Box className='my-3 mx-2' key={semester_index}>
                  <Accordion className='border border-light-grey' >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} color='red' aria-controls="panel1-content" id="panel1-header">
                      <Box className="w-100 d-flex justify-content-between align-items-center me-3">
                        <Box>
                          <h6 className='mb-1' style={{ fontSize: '18px' }}>{semester.name}</h6>
                          <small className="text-muted">
                            {`${new Date(semester.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                          - ${new Date(semester.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`}
                          </small>
                        </Box>
                        <Box className='text-end'>
                          <p className='mb-1'>CGPA: <b>{averageCgpa().semestersCgpa[semester.name].semesterCgpa}</b></p>
                          <small>Credit completed: <b>{averageCgpa().semestersCgpa[semester.name].completedCredit}</b>/{totalCredit}</small>
                        </Box>
                      </Box>
                    </AccordionSummary>

                    {/* course list */}
                    <AccordionDetails className='p-3 border-top bg-light-primary'>
                      {semester.assigned_classes?.map((class_data, class_index) => {
                        // obtained marks
                        const obtainedMarksWithoutFinal = calculateObtainedMarks(class_data.exams).totalWithoutFinal;
                        let obtainedFinalMarks = calculateObtainedMarks(class_data.exams).final;
                        let withSupple = false;

                        if (typeof class_data.obtainedSuppleMarks === 'object' && Object.keys(class_data.obtainedSuppleMarks).length > 0) {
                          // calculate the marks of each values of each keys
                          Object.keys(class_data.obtainedSuppleMarks).forEach(examId => {
                            let newMark = class_data.obtainedSuppleMarks[examId].reduce((acc, curr) => acc + curr.marks, 0);
                            if (newMark > obtainedFinalMarks) {
                              obtainedFinalMarks = newMark;
                              withSupple = true;
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
                            calculateGpa(obtainedMarks, totalExamMarks)
                            : calculateGpa(0, 0)
                          : calculateGpa(0, 0);


                        // Initialize bloomsLevelMarks for all exams
                        const bloomsLevelMarks = {};

                        // Iterate over all exams
                        class_data.exams.forEach((exam) => {
                          // Iterate over obtained exam marks for each exam
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
                          <Accordion key={class_index}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
                              <Box className="w-100 d-flex justify-content-between align-items-center me-3">
                                <Box>
                                  <h6 className='mb-1' style={{ fontSize: '16px' }}>
                                    {class_data.course_details?.title}
                                    <span className="badge badge-warning ms-2">{class_data.retake ? 'Retaken' : withSupple ? 'With Supple' : ''}</span>
                                  </h6>
                                  <small className="text-muted">Code: {class_data.course_details?.course_code} | Credit hours: {class_data.course_details?.credit_hours}</small>
                                </Box>

                                <Box className='text-end my-1'>
                                  <Box>
                                    <span className="border-end border-dark pe-2 me-2">{gpa}</span>
                                    <small><b>{obtainedMarks}</b>/{totalExamMarks}</small>
                                  </Box>
                                  {totalExamMarks === 100 ?
                                    <span span className="badge badge-danger mt-2">
                                      {(obtainedMarksWithoutFinal * 100) / totalMarksWithoutFinal < 40 ?
                                        'Retake' : (obtainedFinalMarks * 100) / totalFinalExamMarks < 40 ? 'Supple' : ''}
                                    </span>
                                    : <span className="badge badge-info mt-2">Incomplete</span>
                                  }
                                </Box>
                              </Box>
                            </AccordionSummary>

                            <AccordionDetails className='p-3 border-top'>
                              <Box className="row">
                                {/* graph section */}
                                <Box className="col-md-7 col-lg-8">
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
                                </Box>

                                {/* marks section */}
                                <Box className="col-md-5 col-lg-4">
                                  <ul className="list-group mt-2">
                                    {/* obtained exam marks */}
                                    {class_data.exams.map((exam, exam_index) => {
                                      if (exam.exam_type === 'Midterm' || exam.exam_type === 'Final') {

                                        // calculate the sum of all the obtained marks
                                        let obtainedMarks = exam.obtainedExamMarks?.map(obtained_marks => obtained_marks.marks).reduce((acc, curr) => acc + curr, 0)

                                        if (exam.exam_type === 'Final' &&
                                          typeof class_data.obtainedSuppleMarks === 'object' &&
                                          Object.keys(class_data.obtainedSuppleMarks).length > 0
                                        ) {
                                          // calculate the marks of each values of each keys
                                          Object.keys(class_data.obtainedSuppleMarks).forEach(examId => {
                                            let newMark = class_data.obtainedSuppleMarks[examId].reduce((acc, curr) => acc + curr.marks, 0);
                                            if (newMark > obtainedMarks)
                                              obtainedMarks = newMark;
                                          });
                                        }

                                        return (
                                          <li className='list-group-item d-flex justify-content-between align-items-center' key={exam_index}>
                                            {exam.exam_type}
                                            <small><b>{obtainedMarks}</b>/{exam.total_marks}</small>
                                          </li>
                                        )
                                      }
                                    })}

                                    {/* class avtivities marks */}
                                    {class_data.exams.map((exam, exam_index) => {

                                      if (exam.exam_type !== 'Midterm' && exam.exam_type !== 'Final') {
                                        return (
                                          <li className='list-group-item d-flex justify-content-between align-items-center' key={exam_index}>
                                            {exam.exam_type}
                                            <small><b>{exam.obtainedCaMarks[0]?.marks}</b>/{exam.total_marks}</small>
                                          </li>
                                        )
                                      }
                                    })}
                                  </ul>
                                </Box>
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        )
                      })
                      }
                    </AccordionDetails>
                  </Accordion>
                </Box>
              )
            })
            : loading ? <div className="text-center"><span className='spinner-border my-4'></span></div>
              : <div className="text-center my-5">No Semesters Found</div>}
        </Box>
      </Box>


      {/* print view */}
      {isPrinting &&
        <StudentProfilePrint
          ref={componentRef}
          student={student}
          semesterWithMarks={semesterWithMarks}
        />
      }

      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </Box>
  )
}
