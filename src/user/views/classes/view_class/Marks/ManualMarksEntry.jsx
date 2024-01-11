import { Box, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material'
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CustomSnackbar from '../../../../../utilities/SnackBar';
import ModalDialog from '../../../../../utilities/ModalDialog';

export default function ManualMarksEntry() {

  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const location = useLocation();
  const course = location.state?.course;
  const exam = location.state?.exam;
  const question_sets = location.state?.question_sets;

  const [students, setStudents] = useState([])
  const [inputMarksData, setInputMarksData] = useState([]);

  const [editableMarks, setEditableMarks] = useState({})
  const [showEditMarksModal, setShowEditMarksModal] = useState(false);

  // console.log(editableMarks)

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


  // get students
  const getStudents = useCallback(() => {
    setLoading(true)
    axios.get(`/api/user/students-with-marks/${course.section.id}/${exam.id}`).then(res => {
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
  }, [course.section.id, exam.id])

  // submit exam marks
  const submitExamMarks = () => {
    setSubmitLoading(true)
    axios.post(`/api/user/obtained-exam-marks/${exam.id}`, inputMarksData).then(res => {
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
    getStudents()
  }, [getStudents])



  return (
    <Box className="container">
      <Box className='card mt-2'>

        {/* Heading section */}
        <Box className='card-header pb-0 d-flex justify-content-between align-items-end' sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box className='d-flex'>
            <button onClick={() => window.history.back()} className='btn btn-light btn-floating me-3 mt-2'>
              <i className='fas fa-arrow-left fa-lg'></i></button>
            <Box className='my-2'>
              <h5 className='card-title mb-1'>{`${course.semester?.name} ${exam.exam_type} Exam`}</h5>
              <small className='text-muted'>{` ${course.section?.batch.department.name} - ${course.section?.batch.batch_name} (${course.section?.section_name})`}</small> <br />
              <small className='text-muted my-1'>{`${course.course?.course_code} :: ${course.course?.title}`}</small>
            </Box>
          </Box>
          {/* import button and full marks */}
          <div className="text-end">
            <Link to={`/classes/import-marks/${exam.id}`} state={{ course: course, exam: exam, question_sets: exam.exam_question_sets, students: students }}
              className='btn btn-dark btn-sm mb-2'>Import / Export</Link>
            <p className="text-muted mt-1">Full marks: {exam.total_marks}</p>
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
                      <TableCell rowSpan={2} className="sticky-column">Student ID</TableCell>
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
                        <TableCell style={{ minWidth: '120px' }} className="sticky-column">{student.student_id}</TableCell>

                        {/* all questions input fields */}
                        {question_sets.map((question_set) => (
                          question_set.questions.map((question, question_index) => {
                            const obtainedMark = student.obtained_exam_marks.find(obtained_marks => obtained_marks.question_id === question.id);
                            const inputMarksValue = inputMarksData.find(entry => entry.student_id === student.id && entry.question_id === question.id)?.marks ?? '';

                            return (
                              <TableCell key={question_index} style={{ minWidth: '80px', padding: '0' }}>

                                {/* marks input field and edit button */}
                                {obtainedMark?.marks > -1 ?
                                  <button className='btn btn-block py-1' style={{ fontSize: '14px' }}
                                    onClick={() => {
                                      setEditableMarks({
                                        ...obtainedMark,
                                        qstn_no: `${question_set.sl}.${question_set.questions.length > 1 ? String.fromCharCode(question_index + 97) : ''}`,
                                        qstn_marks: question.marks,
                                        student_id: student.student_id
                                      });
                                      setShowEditMarksModal(true)
                                    }}>
                                    {obtainedMark.marks}</button>
                                  :
                                  <input type="number"
                                    className={`form-control marks-input ${inputMarksValue > question.marks && 'input-error'} ${inputMarksValue && 'input-active'}`}
                                    value={inputMarksValue}
                                    onChange={(e) => handleExamMarksChange(student.id, question.id, e.target.value)} />
                                }
                              </TableCell>
                            )
                          })
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                :
                // class activity marks table
                <Table className='table-bordered table-sm border-grey'>
                  <TableHead className='sticky-header'>
                    <TableRow>
                      <TableCell className="sticky-column">Student ID</TableCell>
                      <TableCell className="sticky-column">Marks</TableCell>
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
                              <button className='btn btn-block py-1 text-start' style={{ fontSize: '14px' }}
                                onClick={() => { setEditableMarks({ ...obtainedMark, student_id: student.student_id }); setShowEditMarksModal(true) }}>
                                {obtainedMark.marks}</button>
                              :
                              <input type="number"
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
            <Box className="text-end mt-3">
              <button className="btn btn-primary" onClick={(exam.exam_type === 'Midterm' || exam.exam_type === 'Final') ? submitExamMarks : submitCaMarks}
                disabled={inputMarksData.length === 0}>
                {submitLoading ? <span className='spinner-border spinner-border-sm'></span> : 'Save Changes'}</button>
            </Box>
          </Box>
        }
      </Box>


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
