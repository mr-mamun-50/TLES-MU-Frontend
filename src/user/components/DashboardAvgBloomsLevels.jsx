import { Box } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

export default function DashboardAvgBloomsLevels({ current_classes }) {

  // Initialize an array to hold blooms level marks for all classes
  const allClassBloomsLevelMarks = [];

  // Iterate over each class
  current_classes?.forEach((course) => {
    // Initialize overAllBloomsLevelMarks for the current class
    const overAllBloomsLevelMarks = {};

    // Iterate over all exams of the current class
    course.exams?.forEach((exam) => {
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

    // Push the blooms level marks for the current class to the array
    allClassBloomsLevelMarks.push(overAllBloomsLevelMarks);
  });

  // Initialize all blooms levels with 'Not answered'
  const overAllBloomsLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  // Initialize an object to hold total obtained marks and total marks for each blooms level
  const totalMarks = {};
  overAllBloomsLevels.forEach((bloomsLevel) => {
    totalMarks[bloomsLevel] = { totalMarks: 0, obtainedMarks: 0 };
  });

  // Aggregate total obtained marks and total marks for each blooms level across all classes
  allClassBloomsLevelMarks.forEach((bloomsLevelMarks) => {
    overAllBloomsLevels.forEach((bloomsLevel) => {
      if (bloomsLevelMarks[bloomsLevel]) {
        totalMarks[bloomsLevel].totalMarks += bloomsLevelMarks[bloomsLevel].totalMarks;
        totalMarks[bloomsLevel].obtainedMarks += bloomsLevelMarks[bloomsLevel].obtainedMarks;
      }
    });
  });

  // Calculate average percentage for each blooms level
  const averageBloomsLevelPercentages = overAllBloomsLevels.map((bloomsLevel) => {
    const { totalMarks: total, obtainedMarks: obtained } = totalMarks[bloomsLevel];
    const percentage = total > 0 ? ((obtained / total) * 100).toFixed(2) : 0;
    return { bloomsLevel, percentage };
  });


  // console.log(averageBloomsLevelPercentages);


  return (
    <Box className='row mb-4 me-0'>
      {/* show graph */}
      <Box className="col-md-7 col-lg-8">
        <BarChart
          xAxis={[{
            id: 'barCategories',
            data: averageBloomsLevelPercentages.map(level => level.bloomsLevel),
            scaleType: 'band',
          }]}
          series={[{
            data: averageBloomsLevelPercentages.map(level => level.percentage),
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
            {averageBloomsLevelPercentages.map((level, index) => (
              <li className='list-group-item d-flex justify-content-between align-items-center' key={index}>
                <small>{level.bloomsLevel}</small>
                <small>{level.percentage} %</small>
              </li>
            ))}
          </ul>
        </Box>
      </Box>
    </Box>
  )
}
