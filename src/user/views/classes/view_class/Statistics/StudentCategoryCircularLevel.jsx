import { Box } from '@mui/material'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useEffect, useState } from 'react';

export default function StudentCategoryCircularLevel({ studentTotalMarks, examTotalMarks, barWidth, colClasses }) {

  const [marksCategory, setMarksCategory] = useState({ 'Best': 0, 'Above Average': 0, 'Average': 0, 'Below Average': 0, 'Pass': 0, 'Fail': 0 })

  // count student category by marks(converting to persentage)
  // Grand: 90-100
  // Best: 80-89
  // Above Average: 70-79
  // Average: 60-69
  // Below Average: 50-59
  // Pass: 40-49
  // Fail: 0-39
  useEffect(() => {
    let marksCategory = { 'Best': 0, 'Above Average': 0, 'Average': 0, 'Below Average': 0, 'Pass': 0, 'Fail': 0 };
    studentTotalMarks.map((student) => {
      let marks = student.total_marks * 100 / examTotalMarks;
      if (marks >= 80) {
        marksCategory['Best']++;
      } else if (marks >= 70) {
        marksCategory['Above Average']++;
      } else if (marks >= 60) {
        marksCategory['Average']++;
      } else if (marks >= 50) {
        marksCategory['Below Average']++;
      } else if (marks >= 40) {
        marksCategory['Pass']++;
      } else {
        marksCategory['Fail']++;
      }
    });
    setMarksCategory(marksCategory);
  }, [examTotalMarks, studentTotalMarks])


  // category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Best':
        return '#1f78b4'; // Dark Blue for Best
      case 'Above Average':
        return '#6a3d9a'; // Purple for Above Average
      case 'Average':
        return '#33a02c'; // Green for Average
      case 'Below Average':
        return '#008080'; // Teal for Below Average
      case 'Pass':
        return '#ff7f00'; // Orange for Pass
      case 'Fail':
        return '#e41a1c'; // Red for Fail
      default:
        return '#000000'; // Default color (black) if category is not recognized
    }
  };



  // console.log(marksCategory);


  return (
    <Box className='row'>

      {/* circular progressbar by marks category */}
      {Object.keys(marksCategory).map((category, index) => {
        return (
          <Box className={`${colClasses} text-center p-2`} key={index}>
            <Box className="border border-light-grey rounded-3 px-3 py-3 h-100">
              <Box className='d-flex justify-content-center mb-2'>
                <Box sx={{ width: barWidth }}>
                  <CircularProgressbar
                    value={marksCategory[category] * 100 / studentTotalMarks.length}
                    text={`${(marksCategory[category] * 100 / studentTotalMarks.length).toFixed(1)}%`}
                    styles={{
                      path: {
                        stroke: getCategoryColor(category),
                      },
                      text: {
                        fill: getCategoryColor(category),
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </Box>
              </Box>
              <span className='text-muted'>{category}: {marksCategory[category]}</span>
              <br />
              <span className='text-muted' style={{ fontSize: '13px' }}>Marks: {
                index === 0 ? '≥ 80' : index === 1 ? '≥ 70' : index === 2 ? '≥ 60' : index === 3 ? '≥ 50' : index === 4 ? '≥ 40' : '< 40'
              }</span>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
