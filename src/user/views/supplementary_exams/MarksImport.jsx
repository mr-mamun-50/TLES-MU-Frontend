import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import CustomSnackbar from "../../../utilities/SnackBar";
import FileInput from "../../../utilities/FileInput";
import axios from "axios";
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export default function SuppleMarksImport() {

  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const location = useLocation();
  const exam = location.state?.exam;
  const question_sets = location.state?.question_sets;
  const students = location.state?.students;

  const [uploadedFile, setUploadedFile] = useState('');
  const [inputMarksData, setInputMarksData] = useState([]);


  // console.log(inputMarksData)

  // sticky table classes manage
  const tableContainerRef = useRef(null);
  const handleScroll = () => {
    const tableContainer = tableContainerRef.current;
    const stickyHeader = tableContainer.querySelector('.sticky-header');
    const stickyColumn = tableContainer.querySelector('.sticky-column');

    if (stickyHeader && stickyColumn) {
      stickyHeader.style.left = `-${tableContainer.scrollLeft}px`;
      stickyColumn.style.top = `-${tableContainer.scrollTop}px`;
    }
  };

  // handle input file
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonResult = XLSX.utils.sheet_to_json(sheet, { header: 1 });


        setInputMarksData([])

        // bring out all questions from question_sets in one array
        const allQuestions = question_sets.
          map((question_set) => question_set.questions).
          flat();

        for (let i = 0; i < students.length; i++) {
          for (let j = 0; j < allQuestions.length; j++) {
            let data = jsonResult[i + 1][j + 1]
            if (data != null) {
              setInputMarksData(prev => [...prev, { student_id: students[i].id, question_id: allQuestions[j].id, marks: data }])
            }
          }
        }
      };

      reader.readAsBinaryString(file);
    }
  };

  // handle download excel file
  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Define columns
    const columns = [
      { header: 'Student ID', key: 'student_id', width: 12 },
      ...question_sets.flatMap(set =>
        set.questions.map((question, i) => (
          { header: `${set.sl}.${String.fromCharCode(i + 97)} (${question.marks})`, key: `${set.sl}.${String.fromCharCode(i + 97)}`, width: 8 }
        )))
    ];
    // Set columns in the worksheet
    worksheet.columns = columns;

    // add student id amd obtained marks to the worksheet
    students.forEach((student) => {
      const row = {
        student_id: student.student_id,
      };
      question_sets.forEach((question_set) => {
        question_set.questions.forEach((question, question_index) => {
          const obtainedMarks = student.obtained_supple_marks.find(obtained_marks => obtained_marks.question_id === question.id)?.marks;
          row[`${question_set.sl}.${String.fromCharCode(question_index + 97)}`] = obtainedMarks > -1 ? obtainedMarks : null;
        });
      })
      worksheet.addRow(row);
    });


    // Set colors on the 1st column
    worksheet.getColumn(1).eachCell({ includeEmpty: false }, (cell, _rowNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'C5D9F1' }, // Green color, you can replace it with your desired color
      };
    });
    // Set colors on the first row
    worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, _colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'C5D9F1' }, // Yellow color, you can replace it with your desired color
      };
    });

    // Set borders for a specific range
    for (let row = 1; row <= worksheet.rowCount; row++) {
      for (let col = 1; col <= worksheet.columnCount; col++) {
        const cell = worksheet.getCell(`${String.fromCharCode(64 + col)}${row}`);
        cell.border = {
          top: { style: 'thin', color: { argb: '6c757d' } },
          left: { style: 'thin', color: { argb: '6c757d' } },
          bottom: { style: 'thin', color: { argb: '6c757d' } },
          right: { style: 'thin', color: { argb: '6c757d' } },
        };
      }
    }

    // Freeze the first row and first column
    worksheet.views = [
      {
        state: 'frozen',
        xSplit: 1, // Number of columns to freeze
        ySplit: 1, // Number of rows to freeze
        topLeftCell: 'C2', // Cell reference for the top-left cell of the bottom-right pane
      }
    ];

    // Make the first row and 1st column read-only
    for (let row = 1; row <= worksheet.rowCount; row++) {
      worksheet.getCell(`A${row}`).dataValidation = {
        type: 'whole',
        operator: 'equal',
        formula1: '""', // empty string means any value is allowed
        formulae: ['"Read-only"'], // array of formulae to check
        showErrorMessage: true,
        errorTitle: 'Read-only',
        error: 'Editing not allowed in this cell.',
      };
    }
    for (let col = 1; col <= worksheet.columnCount; col++) {
      worksheet.getCell(`${String.fromCharCode(64 + col)}1`).dataValidation = {
        type: 'whole',
        operator: 'equal',
        formula1: '""', // empty string means any value is allowed
        formulae: ['"Read-only"'], // array of formulae to check
        showErrorMessage: true,
        errorTitle: 'Read-only',
        error: 'Editing not allowed in this cell.',
      };
    }

    // Create a buffer to store the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Convert buffer to Blob and create a download link
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${exam.semester?.name} Supple Exam ${exam.course?.course_code}-${exam.course?.title}`
    link.click();
  };


  // submit exam marks
  const submitExamMarks = () => {
    setSubmitLoading(true)
    axios.post(`/api/user/obtained-supple-marks/${exam.id}`, inputMarksData).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        setTimeout(() => { setSuccess('') }, 5000)
        window.history.back()
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
      setSubmitLoading(false)
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
      setSubmitLoading(false)
    })
  }



  return (
    <Box className="container">
      <Box className='card mt-2'>

        {/* Heading section */}
        <Box className='card-header pb-0 d-flex justify-content-between align-items-end' sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box className='d-flex'>
            <button onClick={() => window.history.back()} className='btn btn-light btn-floating me-3 mt-2'>
              <i className='fas fa-arrow-left fa-lg'></i></button>
            <Box className='my-2'>
              <h5 className='card-title mb-1'>{`${exam.semester?.name} Supplementary Exam`}</h5>
              <p className='text-muted my-1'>{`${exam.course?.course_code} :: ${exam.course?.title}`}</p>
            </Box>
          </Box>
          <p className="text-muted mt-1">Full marks: {exam.total_marks}</p>
        </Box>

        {/* Body section */}
        <Box className='card-body'>
          <Box className="d-flex justify-content-between mb-4">
            {/* download .xlsx file button */}
            <button onClick={downloadExcel} className='btn btn-outline-dark border-grey me-2' style={{ textTransform: 'none', fontSize: '14px' }}>
              <i className="fas fa-download me-2"></i> Download demo .xlsx file</button>

            {/* file input */}
            <Box className="col-6 col-lg-4">
              <FileInput label={'Upload .xlsx file'} onUpload={(e) => { handleFileChange(e); setUploadedFile(e.target.files[0]) }}
                state={uploadedFile} onDelete={() => { setUploadedFile(''); setInputMarksData([]) }} formats={'.xlsx, .xls'} />
            </Box>
          </Box>

          {/* input data table */}
          {inputMarksData.length > 0 ?
            <Box>
              <Box className="table-responsive" ref={tableContainerRef} onScroll={handleScroll} style={{ height: '70vh' }}>

                {/* exam marks table */}
                <Table className='table-bordered table-sm border-grey'>
                  <TableHead className='sticky-header'>
                    <TableRow>
                      <TableCell rowSpan={2} className="sticky-column text-center">Student ID</TableCell>
                      {/* question set numbers */}
                      {question_sets.map((question_set, set_index) => (
                        <TableCell colSpan={question_set.questions.length} key={set_index} className='text-center'>{question_set.sl}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      {/* all question numbers */}
                      {question_sets.map((question_set) => (
                        question_set.questions.map((question, question_index) => (
                          <TableCell key={question_index} className='text-center fw-bold'>
                            {question_set.questions.length > 1 && `${String.fromCharCode(question_index + 97)} `}
                            <small className='fw-normal'>{`(${question.marks})`}</small>
                          </TableCell>
                        ))
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {students.map((student, student_index) => (
                      <TableRow key={student_index}>
                        <TableCell style={{ minWidth: '120px' }} className="sticky-column text-center">{student.student_id}</TableCell>

                        {/* all questions marks */}
                        {question_sets.map((question_set) => (
                          question_set.questions.map((question, question_index) => {
                            const inputMarksValue = inputMarksData.find(entry => entry.student_id === student.id && entry.question_id === question.id)?.marks ?? '';
                            return (
                              <TableCell key={question_index} style={{ minWidth: '60px', textAlign: 'center' }}>
                                {inputMarksValue}
                              </TableCell>
                            )
                          })
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

              </Box>


              {/* save button */}
              <Box className="text-end mt-3">
                <button className="btn btn-primary" onClick={submitExamMarks}
                  disabled={inputMarksData.length === 0}>
                  {submitLoading ? <span className='spinner-border spinner-border-sm'></span> : 'Save Changes'}</button>
              </Box>
            </Box>
            : <Box className="my-5 text-center text-muted">Download demo file ➟ Edit the file ➟ Upload & recheck ➟ Save Changes</Box>
          }
        </Box>
      </Box>


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </Box>
  )
}
