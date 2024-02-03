import { Box, TextField } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ModalDialog from '../../../utilities/ModalDialog'
import axios from 'axios'
import CustomSnackbar from '../../../utilities/SnackBar'
import DataTable from 'react-data-table-component'

export default function ViewSuppleExam() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState()

  const location = useLocation();
  const exam = location.state?.exam;

  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [searchStudents, setSearchStudents] = useState('')
  const [filteredStudents, setFilteredStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [deleteStdInput, setDeleteStdInput] = useState('')

  const [inputStudentId, setInputStudentId] = useState([''])
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [showEditStudentModal, setShowEditStudentModal] = useState(false)
  const [showStdDelete, setShowStdDelete] = useState(false)

  // add & remove input field
  const handleAddField = () => {
    setInputStudentId([...inputStudentId, ''])
  }
  const handleInputChange = (value, index) => {
    const list = [...inputStudentId];
    list[index] = value.target.value;
    setInputStudentId(list);
  }
  const handleRemoveInput = (index) => {
    const list = [...inputStudentId];
    list.splice(index, 1);
    setInputStudentId(list);
  }

  // console.log(enrolledStudents)


  // add student to exam
  const addStudentToExam = () => {
    setLoading(true)
    let data = { exam_id: exam.id, student_ids: inputStudentId }
    axios.post(`/api/${role}/supplementary-exam/add-student`, data).then(res => {
      if (res.status === 200) {
        getEnrolledStudents()
        setSuccess(res.data.message)
        setTimeout(() => { setSuccess('') }, 5000)
        setInputStudentId([''])
        setShowAddStudentModal(false)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    }).finally(() => {
      setLoading(false)
    })
  }

  // get enrolled students
  const getEnrolledStudents = useCallback(() => {
    setLoading(true)
    axios.get(`/api/${role}/supplementary-exam/enrolled-students/${exam.id}`).then(res => {
      if (res.status === 200) {
        setEnrolledStudents(res.data.students)
        setFilteredStudents(res.data.students)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    }).finally(() => {
      setLoading(false)
    })
  }, [exam.id, role])



  // datatable columns
  const columns = [
    {
      name: 'Student ID',
      selector: row => row.student_id,
      cell: row => <Link to={`/${role}/students/profile/${row.id}`} state={{ 'student': row }} className='text-dark link'>{row.student_id}</Link>,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Name',
      selector: row => row.name,
      cell: row => <Link to={`/${role}/students/profile/${row.id}`} state={{ 'student': row }} className='fw-semibold text-dark link'>{row.name}</Link>,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Batch & Section',
      selector: row => row.section?.batch?.batch_name,
      cell: row => <span>{row.section?.batch?.batch_name} ({row.section?.section_name})</span>,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Email',
      selector: row => row.email,
      cell: row => <a href={'mailto:' + row.email} target='blank'>{row.email}</a>,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Phone',
      selector: row => <a href={'tel:' + row.phone} target='blank'>{row.phone}</a>,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Action',
      button: true,
      cell: row => <Box className="d-flex">
        <Link to={`/${role}/students/profile/${row.id}`} state={{ 'student': row }} className="btn btn-light border border-light-grey btn-sm px-2 me-2">
          <i className="fas fa-eye"></i>
        </Link>
      </Box>,
    }
  ]


  useEffect(() => {
    localStorage.getItem('role') ?
      setRole(localStorage.getItem('role'))
      : setRole(sessionStorage.getItem('role'))

    role && getEnrolledStudents()
  }, [getEnrolledStudents, role])


  useEffect(() => {
    const filteredData = enrolledStudents.filter(student => {
      return student.student_id?.toLowerCase().includes(searchStudents.toLowerCase())
        || student.name?.toLowerCase().includes(searchStudents.toLowerCase())
        || student.section?.batch?.batch_name?.toLowerCase().includes(searchStudents.toLowerCase())
        || student.email?.toLowerCase().includes(searchStudents.toLowerCase())
        || student.phone?.toLowerCase().includes(searchStudents.toLowerCase())
    })
    setFilteredStudents(filteredData)
  }, [searchStudents, enrolledStudents])


  return (
    <Box className="container">
      <Box className='card my-2'>

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
          <p className="text-muted">Full marks: {exam.total_marks}</p>
        </Box>

        {/* body section */}
        <Box className="card-body">
          {/* student datatable */}
          <DataTable
            title={
              <Box className="w-100 d-flex align-items-center justify-content-between my-2">
                <Box className="col-6 col-lg-3">
                  <Box className="input-group">
                    <Box className="input-group-text border-0 ps-0"><i className='fas fa-search'></i></Box>
                    <input type="text" className="form-control bb-input" placeholder="Search student" value={searchStudents} onChange={(e) => setSearchStudents(e.target.value)} />
                  </Box>
                </Box>
                <button className="btn btn-primary" onClick={() => { setShowAddStudentModal(true) }}><i className="fas fa-plus me-1"></i> Add Student</button>
              </Box>
            }
            columns={columns}
            data={filteredStudents}
            pagination
            responsive
            highlightOnHover
            noDataComponent={loading ? <span className="spinner-border my-4" role="status" aria-hidden="true"></span>
              : <Box className="text-center my-4">No students found</Box>}
            selectableRows
            selectableRowsHighlight
            onSelectedRowsChange={data => setSelectedStudents(data.selectedRows)}
            contextActions={<button className="btn btn-danger me-2 px-3" onClick={() => setShowStdDelete(true)}><i className="fas fa-trash-alt"></i></button>}
            clearSelectedRows={loading}
          />
        </Box>
      </Box>



      {/* add student modal */}
      <ModalDialog
        title={'Add Student'}
        content={
          <Box className='mt-2' sx={{ maxWidth: '350px', maxHeight: '400px' }}>
            {inputStudentId.map((inputValue, index) => {
              return (
                <Box className="mb-3 d-flex">
                  <TextField fullWidth label="Student ID" value={inputValue}
                    onChange={(e) => handleInputChange(e, index)} size='small' />

                  <button type="button" onClick={() => handleRemoveInput(index)}
                    className='btn btn-light btn-floating btn-sm ms-1 mt-1'><i className="fas fa-times"></i></button>
                </Box>
              )
            })}
            <Box><button type="button" onClick={() => handleAddField()} className="btn btn-rounded btn-sm bg-light">
              <i className="fas fa-plus me-1"></i> New</button></Box>
          </Box>
        }
        onOpen={showAddStudentModal}
        onClose={() => { setShowAddStudentModal(false) }}
        confirmText={'Add'}
        onConfirm={addStudentToExam}
        loading={loading}
      />


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </Box>
  )
}
