import { Box, Button, MobileStepper, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material'
import axios from 'axios';
import { createRef, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ExcelJS from 'exceljs';
import CustomSnackbar from '../../../../../utilities/SnackBar';
import ModalDialog from '../../../../../utilities/ModalDialog';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

export default function ManualMarksEntry() {

  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [role, setRole] = useState()

  const location = useLocation();
  const assigned_class = location.state?.assigned_class;
  const exam = location.state?.exam;
  const question_sets = location.state?.question_sets;

  const [students, setStudents] = useState([])
  const [inputMarksData, setInputMarksData] = useState([]);
  const [inputStudent, setInputStudent] = useState({});

  const [editableMarks, setEditableMarks] = useState({})
  const [showEditMarksModal, setShowEditMarksModal] = useState(false);
  const [showAddMarksModal, setShowAddMarksModal] = useState(false);

  // console.log(inputMarksData)

  // add marks modal interactivity
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = question_sets?.length;
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // auto focus next input field
  const inputRefs = useRef(Array.from({ length: question_sets[activeStep]?.questions.length }, () => createRef()));
  useEffect(() => {
    inputRefs.current = Array.from({ length: question_sets[activeStep]?.questions.length }, (_, index) => inputRefs.current[index] || createRef());
  }, [activeStep, question_sets]);


  // handle input exam marks changes
  const handleExamMarksChange = (studentId, questionId, marks) => {
    // Find if the entry already exists
    const existingEntryIndex = inputMarksData.findIndex(
      entry => entry.student_id === studentId && entry.question_id === questionId
    );

    // If the entry exists, update the marks; otherwise, create a new entry
    if (existingEntryIndex !== -1) {
      // if marks === '' then remove the object else update the data
      if (marks === '') {
        setInputMarksData(prevMarksData => prevMarksData.filter(entry => entry.student_id !== studentId || entry.question_id !== questionId));
      } else {
        setInputMarksData(prevMarksData => {
          const updatedEntries = [...prevMarksData];
          updatedEntries[existingEntryIndex].marks = marks;
          return updatedEntries;
        });
      }
    } else {
      setInputMarksData(prevMarksData => [
        ...prevMarksData,
        { student_id: studentId, question_id: questionId, marks: marks }
      ]);
    }

    // Focus the next input field
    const currentIndex = inputRefs.current.findIndex((ref) => ref.current.name === questionId.toString());
    if (currentIndex !== -1 && currentIndex < inputRefs.current.length - 1) {
      if (marks !== '') {
        inputRefs.current[currentIndex + 1].current?.focus();
      }
    }
    // else {
    //   handleNext();
    // }
  };

  // handle input class activities marks changes
  const handleCaMarksChange = (studentId, marks) => {
    // Find if the entry already exists
    const existingEntryIndex = inputMarksData.findIndex(
      entry => entry.student_id === studentId
    );

    // If the entry exists, update the marks; otherwise, create a new entry
    if (existingEntryIndex !== -1) {
      // if marks === '' then remove the object else update the data
      if (marks === '') {
        setInputMarksData(prevMarksData => prevMarksData.filter(entry => entry.student_id !== studentId));
      } else {
        setInputMarksData(prevMarksData => {
          const updatedEntries = [...prevMarksData];
          updatedEntries[existingEntryIndex].marks = marks;
          return updatedEntries;
        });
      }
    } else {
      setInputMarksData(prevMarksData => [
        ...prevMarksData,
        { student_id: studentId, marks: marks }
      ]);
    }
  }


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


  // handle download excel file
  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Define columns
    const columns = (exam.exam_type === 'Midterm' || exam.exam_type === 'Final') ? [
      { header: 'Student ID', key: 'student_id', width: 12 },
      ...question_sets.flatMap(set =>
        set.questions.map((question, i) => (
          { header: `${set.sl}.${String.fromCharCode(i + 97)} (${question.marks})`, key: `${set.sl}.${String.fromCharCode(i + 97)}`, width: 8 }
        )))
    ] : [
      { header: 'Student ID', key: 'student_id', width: 12 },
      { header: 'Marks', key: 'marks', width: 12 },
    ];
    // Set columns in the worksheet
    worksheet.columns = columns;

    // add student id amd obtained marks to the worksheet
    students.forEach((student) => {
      const row = {
        student_id: student.student_id,
      };
      (exam.exam_type === 'Midterm' || exam.exam_type === 'Final') ?
        question_sets.forEach((question_set) => {
          question_set.questions.forEach((question, question_index) => {
            const obtainedMarks = student.obtained_exam_marks.find(obtained_marks => obtained_marks.question_id === question.id)?.marks;
            row[`${question_set.sl}.${String.fromCharCode(question_index + 97)}`] = obtainedMarks > -1 ? obtainedMarks : null;
          });
        })
        : row.marks = student.obtained_ca_marks.find(obtained_marks => obtained_marks.exam_id === exam.id)?.marks;
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
    link.download = `${assigned_class.semester?.name} ${exam.exam_type} ${assigned_class.course?.course_code}-${assigned_class.course?.title} ${assigned_class.section?.batch.batch_name} (${assigned_class.section?.section_name})-${assigned_class.section?.batch.department.name}`
    link.click();
  };


  // get students
  const getStudents = useCallback(() => {
    setLoading(true)
    axios.get(`/api/${role}/students-with-marks/${assigned_class.section.id}/${exam.id}`).then(res => {
      if (res.status === 200) {
        setStudents(res.data.students)
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
  }, [assigned_class.section.id, exam.id, role])

  // submit exam marks
  const submitExamMarks = () => {
    setSubmitLoading(true)
    axios.post(`/api/user/obtained-exam-marks/${exam.id}`, inputMarksData).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        setTimeout(() => { setSuccess('') }, 5000)
        getStudents()
        setShowAddMarksModal(false)
        setInputMarksData([])
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

  // submit class activities marks
  const submitCaMarks = () => {
    setSubmitLoading(true)
    axios.post(`/api/user/obtained-ca-marks/${exam.id}`, inputMarksData).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        setTimeout(() => { setSuccess('') }, 5000)
        getStudents()
        setInputMarksData([])
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

  // edit / delete exam marks
  const updateOrDeleteExamMarks = () => {
    setLoading(true)
    axios.put(`/api/user/obtained-exam-marks/${editableMarks.id}`, editableMarks).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        setTimeout(() => { setSuccess('') }, 5000)
        getStudents()
        setShowEditMarksModal(false)
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
  }

  // edit / delete class activities marks
  const updateOrDeleteCaMarks = () => {
    setLoading(true)
    axios.put(`/api/user/obtained-ca-marks/${editableMarks.id}`, editableMarks).then(res => {
      if (res.status === 200) {
        setSuccess(res.data.message)
        setTimeout(() => { setSuccess('') }, 5000)
        getStudents()
        setShowEditMarksModal(false)
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
  }


  useEffect(() => {
    localStorage.getItem('role') ?
      setRole(localStorage.getItem('role'))
      : setRole(sessionStorage.getItem('role'))

    role && getStudents()
  }, [getStudents, role])



  return (
    <Box className={`container ${(exam.exam_type !== 'Midterm' && exam.exam_type !== 'Final') && 'd-flex justify-content-center'}`}>
      <Box className={`card my-2 ${(exam.exam_type !== 'Midterm' && exam.exam_type !== 'Final') && 'col-lg-7'}`}>

        {/* Heading section */}
        <Box className='card-header pb-0 d-flex justify-content-between align-items-end' sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box className='d-flex'>
            <button onClick={() => window.history.back()} className='btn btn-light btn-floating me-3 mt-2'>
              <i className='fas fa-arrow-left fa-lg'></i></button>
            <Box className='my-2'>
              <h5 className='card-title mb-1'>{`${assigned_class.semester?.name} ${exam.exam_type} Exam`}</h5>
              <small className='text-muted'>{` ${assigned_class.section?.batch.department.name} - ${assigned_class.section?.batch.batch_name} (${assigned_class.section?.section_name})`}</small> <br />
              <small className='text-muted my-1'>{`${assigned_class.course?.course_code} :: ${assigned_class.course?.title}`}</small>
            </Box>
          </Box>
          {/* import/Export button and full marks */}
          <div className="text-end">
            <p className="text-muted mb-2">Full marks: {exam.total_marks}</p>

            {role === 'user' &&
              <Link to={`/classes/import-marks/${exam.id}`} state={{ assigned_class: assigned_class, exam: exam, question_sets: exam.exam_question_sets, students: students }}
                className='btn btn-outline-dark border btn-sm mb-3'><i className="fas fa-file-import text-muted me-1"></i> Import</Link>}

            <button onClick={() => downloadExcel()}
              className='btn btn-outline-dark border btn-sm mb-3 ms-2'><i className="fas fa-file-export text-muted me-1"></i> Export</button>
          </div>
        </Box>


        {loading ? <div className="text-center"><span className='spinner-border my-5'></span></div> :
          <Box className="card-body">
            <Box className="table-responsive" ref={tableContainerRef} onScroll={handleScroll} style={{ height: '70vh' }}>

              {(exam.exam_type === 'Midterm' || exam.exam_type === 'Final') ?

                // exam marks table
                <Table className='table-bordered table-sm border-grey'>
                  <TableHead className='sticky-header'>
                    <TableRow>
                      <TableCell rowSpan={2} className="sticky-column text-center">Student ID</TableCell>
                      <TableCell rowSpan={2} className="sticky-column-2 text-center">Total Marks</TableCell>
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
                    {students.map((student, student_index) => {
                      // calculate total obtained marks
                      const totalObtainedMarks = student.obtained_exam_marks.reduce((acc, obtained_marks) => acc + obtained_marks.marks, 0);

                      return (
                        <TableRow key={student_index}>
                          <TableCell style={{ minWidth: '120px', padding: '0' }} className="sticky-column">
                            <button onClick={() => {
                              if (role === 'user') {
                                setShowAddMarksModal(true);
                                setInputStudent(student);
                              }
                            }}
                              className='btn btn-light rounded-0 btn-block px-1 border border-light-grey' style={{ fontSize: '14px' }}>
                              {student.student_id}
                            </button>
                          </TableCell>
                          <TableCell style={{ minWidth: '60px', padding: '0' }} className="sticky-column-2 text-center">{totalObtainedMarks}</TableCell>

                          {/* all questions input fields */}
                          {question_sets.map((question_set) => (
                            question_set.questions.map((question, question_index) => {
                              const obtainedMark = student.obtained_exam_marks.find(obtained_marks => obtained_marks.question_id === question.id);

                              return (
                                <TableCell key={question_index} style={{ minWidth: '60px', padding: '0' }}>

                                  {/* marks with edit button */}
                                  {obtainedMark?.marks > -1 &&
                                    <button className='btn btn-block text-dark py-1' style={{ fontSize: '14px' }}
                                      onClick={() => {
                                        if (role === 'user') {
                                          setEditableMarks({
                                            ...obtainedMark,
                                            qstn_no: `${question_set.sl}${question_set.questions.length > 1 ? `.${String.fromCharCode(question_index + 97)}` : ''}`,
                                            qstn_marks: question.marks,
                                            student_id: student.student_id
                                          });
                                          setShowEditMarksModal(true);
                                        }
                                      }}>
                                      {obtainedMark.marks}
                                    </button>
                                  }
                                </TableCell>
                              )
                            })
                          ))}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                :
                // class activity marks table
                <Table className='table-bordered table-sm border-grey'>
                  <TableHead className='sticky-header'>
                    <TableRow>
                      <TableCell className="sticky-column w-50">Student ID</TableCell>
                      <TableCell className="sticky-column w-50">Marks</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {students.map((student, student_index) => {
                      const obtainedMark = student.obtained_ca_marks.find(obtained_marks => obtained_marks.exam_id === exam.id);
                      const inputMarksValue = inputMarksData.find(entry => entry.student_id === student.id)?.marks ?? '';

                      return (
                        <TableRow key={student_index}>
                          <TableCell style={{ minWidth: '120px' }} className="sticky-column">{student.student_id}</TableCell>
                          <TableCell style={{ minWidth: '80px', padding: '0' }}>

                            {/* marks input field and edit button */}
                            {obtainedMark?.marks > -1 ?
                              <button className='btn btn-block py-1 text-start text-dark' style={{ fontSize: '14px' }}
                                onClick={() => {
                                  if (role === 'user') {
                                    setEditableMarks({ ...obtainedMark, student_id: student.student_id });
                                    setShowEditMarksModal(true);
                                  }
                                }}>
                                {obtainedMark.marks}</button>
                              : role === 'user' &&
                              <input type='number'
                                className={`form-control marks-input ${inputMarksValue > exam.total_marks && 'input-error'} ${inputMarksValue && 'input-active'}`}
                                value={inputMarksValue}
                                onChange={(e) => handleCaMarksChange(student.id, e.target.value)} />
                            }
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              }
            </Box>

            {/* save button */}
            {(exam.exam_type !== 'Midterm' && exam.exam_type !== 'Final') &&
              <Box className="text-end mt-3">
                <button className="btn btn-primary" onClick={(exam.exam_type === 'Midterm' || exam.exam_type === 'Final') ? submitExamMarks : submitCaMarks}
                  disabled={inputMarksData.length === 0}>
                  {submitLoading ? <span className='spinner-border spinner-border-sm'></span> : 'Save Changes'}</button>
              </Box>
            }
          </Box>
        }
      </Box>


      {/* add marks modal */}
      <ModalDialog
        title={`Add Marks: ${inputStudent?.student_id}`}
        content={
          <Box>
            {/* question set's questions input field */}
            <Box className='scroll' sx={{ height: 300, width: 300, overflowY: 'scroll' }}>
              <h6 className='mt-3'>Question no: {question_sets[activeStep]?.sl}</h6>

              {question_sets[activeStep]?.questions.map((question, question_index) => {
                const obtainedMark = inputStudent.obtained_exam_marks?.find(obtained_marks => obtained_marks.question_id === question.id);
                const inputMarksValue = inputMarksData.find(entry => entry.student_id === inputStudent.id && entry.question_id === question.id)?.marks ?? '';

                return (
                  <Box className='d-flex align-items-center' key={question_index}>
                    {/* marks input field and edit button */}
                    <TextField label={question_sets[activeStep].questions.length > 1 ? `(${String.fromCharCode(question_index + 97)}) marks` : `marks`} type='number' key={question.id}
                      value={obtainedMark?.marks ?? inputMarksValue} error={inputMarksValue > question.marks} disabled={obtainedMark?.marks > -1}
                      onChange={(e) => handleExamMarksChange(inputStudent.id, question.id, e.target.value)} margin='normal' size='small' fullWidth
                      inputRef={inputRefs.current[question_index]}
                      name={question.id.toString()}
                    />

                    <h6 className='mx-2 mb-0 mt-2 d-flex'><span className='me-1'>/</span> {question.marks}</h6>
                  </Box>
                )
              })}
            </Box>

            {/* manage steps */}
            <MobileStepper className='bg-light rounded-3 py-1 mt-3' variant="text" steps={maxSteps} position="static" activeStep={activeStep}
              nextButton={
                <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
                  Next <KeyboardArrowRight /></Button>
              }
              backButton={
                <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                  <KeyboardArrowLeft /> Back</Button>
              }
            />
          </Box>
        }
        onOpen={showAddMarksModal}
        onClose={() => { setShowAddMarksModal(false), setActiveStep(0), setInputMarksData([]), setInputStudent({}) }}
        onConfirm={submitExamMarks}
        confirmText={'Submit'}
        loading={submitLoading}
      />


      {/* edit marks modal */}
      <ModalDialog
        title={(exam.exam_type === 'Midterm' || exam.exam_type === 'Final') ? `${editableMarks.student_id} (${editableMarks.qstn_no})` : `${editableMarks.student_id}`}
        content={
          <Box>
            {(exam.exam_type === 'Midterm' || exam.exam_type === 'Final') ?
              <Box className="d-flex align-items-center">
                <TextField label={'Marks'} type='number' value={editableMarks.marks} error={editableMarks.marks > editableMarks.qstn_marks}
                  onChange={(e) => setEditableMarks({ ...editableMarks, marks: e.target.value })} margin='normal' size='small' />
                <h5 className='text-muted ms-2 mt-3'> / {editableMarks.qstn_marks}</h5>
              </Box>
              :
              <Box className="d-flex align-items-center">
                <TextField label={'Marks'} type='number' value={editableMarks.marks} error={editableMarks.marks > exam.total_marks}
                  onChange={(e) => setEditableMarks({ ...editableMarks, marks: e.target.value })} margin='normal' size='small' />
                <h5 className='text-muted ms-2 mt-3'> / {exam.total_marks}</h5>
              </Box>
            }
            <small className='text-muted'><i>* save empty data to delete</i></small>
          </Box>
        }
        onOpen={showEditMarksModal}
        onClose={() => setShowEditMarksModal(false)}
        onConfirm={(exam.exam_type === 'Midterm' || exam.exam_type === 'Final') ? updateOrDeleteExamMarks : updateOrDeleteCaMarks}
        confirmText={editableMarks.marks !== '' ? 'Save' : 'Delete'}
        actionColor={editableMarks.marks !== '' ? 'primary' : 'error'}
        loading={loading}
      />


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </Box>
  )
}
