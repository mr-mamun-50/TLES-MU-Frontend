import { Accordion, AccordionDetails, AccordionSummary, Box, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { forwardRef } from "react";
import { PrintHeading } from "./components/PrintHeading";
import MarksRangeCount from "../classes/view_class/Statistics/MarksRangeCount";
import { BarChart } from "@mui/x-charts/BarChart";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GpaCountsPrint from "./components/GpaCounts";

// eslint-disable-next-line react/display-name
export const ClassStatsPrint = forwardRef((props, ref) => {

  const { examMarksOfClass, assigned_class } = props;

  console.log(assigned_class)

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





  return (
    <Box ref={ref} className="print-section">

      {/* heading section */}
      <PrintHeading content={
        <Box>
          <h5>
            {"Class Statistics"}
            <small className="fw-normal"> - {assigned_class.semester?.name}</small>
          </h5>
          <h6 className="mb-2">{`Course: ${assigned_class.course?.course_code} - ${assigned_class.course?.title}`}</h6>
          <h6 className="mb-1">Teacher: {assigned_class.teacher?.name}</h6>
          <small>{` ${assigned_class.section?.batch.department.name} - ${assigned_class.section?.batch.batch_name} (${assigned_class.section?.section_name})`}</small>
        </Box>
      } />

      {examMarksOfClass.length > 0 ?
        <Box className="pt-3">

          {/* overall performance */}
          <Box className="pb-2 border-bottom mb-3 d-flex justify-content-between align-items-center" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <h5 className='mb-0'>Overall Performance</h5>
          </Box>

          {/* category, blooms level and GPA progressbar and graph */}
          <h6 className="my-2">GPA:</h6>
          {/* GPA graph */}
          <Box className="pb-3" sx={{ width: '8.27in' }}>
            <GpaCountsPrint
              studentTotalMarks={studentTotalMarksArray}
              examTotalMarks={totalExamMarks}
            />
          </Box>

          <h6 className="my-2">Blooms Level:</h6>
          {/* blooms level */}
          <Box className="pb-3" sx={{ width: '8.35in' }}>
            <Box className='row mb-3 me-0'>
              {/* Show blooms graph */}
              <Box className="col-sm-8">
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
              <Box className="col-sm-4 border border-light-grey rounded-3">
                <ul className='list-group list-group-light list-group-small px-3'>
                  {overAllBloomsLevelPercentages.map(({ bloomsLevel, percentage }) => (
                    <li className='list-group-item d-flex justify-content-between align-items-center' key={bloomsLevel}>
                      <small>{bloomsLevel}</small>
                      <small className='fw-semibold'>{percentage !== 'N/A' ? `${percentage.toFixed(2)} %` : percentage}</small>
                    </li>
                  ))}
                </ul>
              </Box>
            </Box>
          </Box>


          {/* exam performance */}
          <h5 className='pb-2 border-bottom my-3'>Exam Performance</h5>

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
                  <Box className="col-12 col-md-6 mb-4" key={index} sx={{ width: '8.6in' }}>
                    <Box className="card border border-light-grey h-100">
                      {/* exam header with stats navs buttons */}
                      <Box className="card-header d-flex justify-content-between align-items-center" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        {/* title and marks */}
                        <Box className="d-flex">
                          <h6 className='mb-0' style={{ fontSize: '18px' }}>{exam.exam_type}</h6>
                          <small className="mb-0 ms-2 text-muted">(<b>{exam.total_marks}</b>)</small>
                        </Box>
                      </Box>

                      {/* exam body with stats */}
                      <Box className="card-body pt-3">

                        <Box className="row">
                          {/* bar chart of bloomsLevelPercentages */}
                          <h6>Blooms Level:</h6>
                          <Box className='col-sm-8' sx={{ minHeight: '220px' }}>
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

                          {/* table of bloomsLevelPercentages*/}
                          <Box className='col-sm-4'>
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

                        {/* marks range details */}
                        <h6 className="mt-5">Students With Different Marks:</h6>
                        <Box className='px-0 py-3'>
                          <MarksRangeCount
                            studentTotalMarks={studentTotalMarks}
                            examTotalMarks={exam.total_marks}
                          />
                        </Box>
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
                    <Accordion className='border border-light-grey' expanded>
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

        : <div className="text-center my-5">No Exams Found</div>}

    </Box>
  )
});
