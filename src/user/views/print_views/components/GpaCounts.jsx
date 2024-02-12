import { Box } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useEffect, useState } from 'react'

export default function GpaCountsPrint({ studentTotalMarks, examTotalMarks }) {

  const [gpaCount, setGpaCount] = useState({
    'A+ (4.00)': 0, 'A (3.75)': 0, 'A- (3.50)': 0, 'B+ (3.25)': 0,
    'B (3.00)': 0, 'B- (2.75)': 0, 'C+ (2.50)': 0, 'C (2.25)': 0, 'D (2.00)': 0, 'F (0.00)': 0,
  });

  const gpaKeys = Object.keys(gpaCount);

  // Divide the GPA keys into two groups
  const firstColumn = gpaKeys.slice(0, 5);
  const secondColumn = gpaKeys.slice(5);

  // count student GPA
  useEffect(() => {
    let gpaCount = {
      'A+ (4.00)': 0, 'A (3.75)': 0, 'A- (3.50)': 0, 'B+ (3.25)': 0,
      'B (3.00)': 0, 'B- (2.75)': 0, 'C+ (2.50)': 0, 'C (2.25)': 0, 'D (2.00)': 0, 'F (0.00)': 0,
    };

    studentTotalMarks.map((student) => {
      let marks = student.total_marks * 100 / examTotalMarks;
      if (marks >= 80) {
        gpaCount['A+ (4.00)']++;
      } else if (marks >= 75) {
        gpaCount['A (3.75)']++;
      } else if (marks >= 70) {
        gpaCount['A- (3.50)']++;
      } else if (marks >= 65) {
        gpaCount['B+ (3.25)']++;
      } else if (marks >= 60) {
        gpaCount['B (3.00)']++;
      } else if (marks >= 55) {
        gpaCount['B- (2.75)']++;
      } else if (marks >= 50) {
        gpaCount['C+ (2.50)']++;
      } else if (marks >= 45) {
        gpaCount['C (2.25)']++;
      } else if (marks >= 40) {
        gpaCount['D (2.00)']++;
      } else {
        gpaCount['F (0.00)']++;
      }
    });
    setGpaCount(gpaCount);
  }, [examTotalMarks, studentTotalMarks])


  return (
    <Box className='row'>

      {/* Show GPA counts graph */}
      <Box className="col-sm-7 col-lg-8">
        <BarChart
          xAxis={[{
            id: 'GPA',
            data: Object.keys(gpaCount).reverse(),
            scaleType: 'band',
          }]}
          series={[{
            data: Object.values(gpaCount).reverse(),
            color: '#007bff',
          }]}
          height={230}
          margin={{ top: 15, right: 15, bottom: 20, left: 30 }}
        />
      </Box>

      {/* show list */}
      <Box className="col-sm-5 col-lg-4">

        <Box className='row mt-3 border border-light-grey rounded'>
          {/* First Column */}
          <Box className='col border-end'>
            <ul className='list-group list-group-light list-group-small px-3'>
              {firstColumn.map((gpa, index) => (
                <li className='list-group-item d-flex justify-content-between align-items-center' key={index}>
                  <small>{gpa}</small>
                  <small>{gpaCount[gpa]}</small>
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
                  <small>{gpaCount[gpa]}</small>
                </li>
              ))}
            </ul>
          </Box>
        </Box>

      </Box>
    </Box>
  )
}
