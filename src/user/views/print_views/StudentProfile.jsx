import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { PrintHeading } from "./components/PrintHeading";
import { forwardRef } from "react";
import { LineChart } from "@mui/x-charts/LineChart";

// eslint-disable-next-line react/display-name
export const StudentProfilePrint = forwardRef((props, ref) => {

  const { student, semesterWithMarks } = props;


  // calculate gpa
  const calculateLG = (gpa_point) => {
    if (gpa_point === 4) return 'A+';
    if (gpa_point === 3.75) return 'A';
    if (gpa_point === 3.5) return 'A-';
    if (gpa_point === 3.25) return 'B+';
    if (gpa_point === 3) return 'B';
    if (gpa_point === 2.75) return 'B-';
    if (gpa_point === 2.5) return 'C+';
    if (gpa_point === 2.25) return 'C';
    if (gpa_point === 2) return 'D';
    return 'F';
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


  // console.log(student)

  return (
    <Box ref={ref} className="print-section">

      {/* heading section */}
      <PrintHeading content={
        <Box>
          <h5>{"Academic Record "}</h5>
          <h6 className="mb-2">{student.name}</h6>
          <h6 className="mb-1">ID: {student.student_id}</h6>
          <small>Department: {student.department?.name}</small><br />
          <small>Batch: {student.batch?.batch_name}, </small>
          <small>Section: {student.section?.section_name}</small>
        </Box>
      } />

      {/* CGPA and total completed credit */}
      <Box className="d-flex justify-content-between align-items-center bg-light py-2 px-3 my-4">
        <h5 className="mb-0" style={{ fontSize: '18px' }}><span className='fw-normal'>CGPA: </span>{averageCgpa().cgpa.toFixed(2)}</h5>
        <p className='mb-0' style={{ fontSize: '14px' }}>Credit completed: <b>{averageCgpa().completedCredit}</b></p>
      </Box>

      {/* semester performance graph */}
      {Object.values(averageCgpa().semestersCgpa).length > 0 &&
        <Box className="px-2" sx={{ width: '8.25in' }}>
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
            <Box key={semester_index} className="mt-5 border border-light-grey">
              <Box className="d-flex justify-content-between align-items-center bg-light py-2 px-3">
                <h6 className='mb-1' style={{ fontSize: '18px' }}>{semester.name}</h6>
                <Box className='text-end'>
                  <p className='mb-1'>CGPA: <b>{averageCgpa().semestersCgpa[semester.name].semesterCgpa}</b></p>
                  <small>Credit completed: <b>{averageCgpa().semestersCgpa[semester.name].completedCredit}</b>/{totalCredit}</small>
                </Box>
              </Box>

              <Table className="table-sm mt-1">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>CH</TableCell>
                    <TableCell>LG</TableCell>
                    <TableCell>GPA</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {semester.assigned_classes.map((class_data, class_index) => {

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
                        calculateGpaPoints(obtainedMarks, totalExamMarks)
                        : calculateGpaPoints(0, 0)
                      : calculateGpaPoints(0, 0);


                    return (
                      <TableRow key={class_index}>
                        <TableCell>{class_data.course_details.course_code}</TableCell>
                        <TableCell>{class_data.course_details.title}</TableCell>
                        <TableCell>{class_data.retake ? 'Retaken' : withSupple ? 'With Supple' : 'Regular'}</TableCell>
                        <TableCell>{class_data.course_details.credit_hours}</TableCell>
                        <TableCell>
                          <Box>
                            {totalExamMarks === 100 ?
                              (obtainedMarksWithoutFinal * 100) / totalMarksWithoutFinal < 40 ?
                                'F(R)' : (obtainedFinalMarks * 100) / totalFinalExamMarks < 40 ? 'F(S)' : calculateLG(gpa)
                              : ''}
                          </Box>
                        </TableCell>
                        <TableCell>{gpa}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          );
        })
        : <div className="text-center my-5">No Semesters Found</div>}
    </Box>
  )
})
