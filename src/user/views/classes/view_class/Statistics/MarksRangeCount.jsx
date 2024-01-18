import { Box } from '@mui/material'
import { useEffect, useState } from 'react';

export default function MarksRangeCount({ studentTotalMarks, examTotalMarks }) {

  const [marksCategory, setMarksCategory] = useState({ '100%': 0, '90-99%': 0, '80-89%': 0, '70-79%': 0, '60-69%': 0, '50-59%': 0, '40-49%': 0, '0-39%': 0 });

  // count student marks count(converting to persentage)
  useEffect(() => {
    let marksCategory = { '100%': 0, '90-99%': 0, '80-89%': 0, '70-79%': 0, '60-69%': 0, '50-59%': 0, '40-49%': 0, '0-39%': 0 };
    studentTotalMarks.map((student) => {
      let marks = student.marks ? student.marks * 100 / examTotalMarks : student.total_marks * 100 / examTotalMarks;
      if (marks === 100) {
        marksCategory['100%']++;
      } else if (marks >= 90) {
        marksCategory['90-99%']++;
      } else if (marks >= 80) {
        marksCategory['80-89%']++;
      } else if (marks >= 70) {
        marksCategory['70-79%']++;
      } else if (marks >= 60) {
        marksCategory['60-69%']++;
      } else if (marks >= 50) {
        marksCategory['50-59%']++;
      } else if (marks >= 40) {
        marksCategory['40-49%']++;
      } else {
        marksCategory['0-39%']++;
      }
    });
    setMarksCategory(marksCategory);
  }, [examTotalMarks, studentTotalMarks])



  return (
    <Box className='row'>

      {/* marks list */}
      {Object.keys(marksCategory).map((category, index) => {
        return (
          <Box className={`col-6 col-md-3 ${(index + 1) % 4 !== 0 && 'border-end'} py-1`} key={index}>
            <Box className='d-flex justify-content-between align-items-center'>
              <small className='mb-0'>{category}</small>
              <p className='mb-0 text-primary'><b>{marksCategory[category]}</b></p>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
