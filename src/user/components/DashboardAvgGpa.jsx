import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";

export default function DashboardAvgGpa({ current_classes }) {

  let studentsCollectiveMarks = [];

  current_classes?.forEach(classData => {

    const studentTotalMarks = {};
    const total_exam_marks = classData.exams.length > 0 && classData.exams.reduce((sum, exam) => sum + exam.total_marks, 0);

    classData.exams.forEach((exam) => {
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
      total_obtained_marks: totalMarks,
      total_exam_marks: total_exam_marks,
      class_count: 1,
    }));

    // sum students new marks with studentsCollectiveMarks students
    studentTotalMarksArray.forEach((studentTotalMarks) => {
      const existingStudent = studentsCollectiveMarks.find(student => student.student_id === studentTotalMarks.student_id);
      if (existingStudent) {
        existingStudent.total_obtained_marks += studentTotalMarks.total_obtained_marks;
        existingStudent.class_count += 1;
        existingStudent.total_exam_marks += studentTotalMarks.total_exam_marks;
      } else {
        studentsCollectiveMarks.push(studentTotalMarks);
      }
    })
  });

  const studentsAverageTotalMarks = studentsCollectiveMarks.map(student => ({
    student_id: student.student_id,
    average_obtained_marks: student.total_obtained_marks / student.class_count,
    total_exam_marks: student.total_exam_marks / student.class_count,
  }));




  const countGpa = () => {
    let gpaCount = {
      'F (0.00)': 0, 'D (2.00)': 0, 'C (2.25)': 0, 'C+ (2.50)': 0,
      'B- (2.75)': 0, 'B (3.00)': 0, 'B+ (3.25)': 0, 'A- (3.50)': 0, 'A (3.75)': 0, 'A+ (4.00)': 0,
    };

    studentsAverageTotalMarks.map((student) => {
      let marks = student.average_obtained_marks * 100 / student.total_exam_marks;
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
    return gpaCount;
  }


  return (
    <PieChart
      series={[{
        data: Object.entries(countGpa()).map(([label, value]) => ({ id: label, value: value, label: label })),
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
  )
}
