import { Box, TextField } from "@mui/material"
import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import DataTable from "react-data-table-component"
import { Link, useParams } from "react-router-dom"
import CustomSnackbar from "../../../../utilities/SnackBar"
import ModalDialog from "../../../../utilities/ModalDialog"

export default function EnrolledStudents({ assigned_class }) {

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [role, setRole] = useState()
  const classId = useParams().id

  const [students, setStudents] = useState([])

  const [searchStudents, setSearchStudents] = useState('')
  const [filteredStudents, setFilteredStudents] = useState([])
  // const [selectedStudents, setSelectedStudents] = useState([])
  const [inputStudentId, setInputStudentId] = useState([''])
  const [showAddRetakeStudentModal, setShowAddRetakeStudentModal] = useState(false)

  // console.log(assigned_class)

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


  // get students
  const getStudents = useCallback(() => {
    setLoading(true)
    axios.get(`/api/${role}/class_students/${classId}/${assigned_class.section.id}`).then(res => {
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
  }, [assigned_class.section.id, classId, role])

  // add student to exam
  const addStudentToClass = () => {
    setLoading(true)
    let data = { class_id: classId, student_ids: inputStudentId }
    axios.post(`/api/${role}/retake-students`, data).then(res => {
      if (res.status === 200) {
        getStudents()
        setSuccess(res.data.message)
        setTimeout(() => { setSuccess('') }, 5000)
        setInputStudentId([''])
        setShowAddRetakeStudentModal(false)
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


  // datatable columns
  const columns = [
    {
      name: 'Student ID',
      selector: row => row.student_id,
      cell: row => <Link to={`${role === 'user' ? '' : `/${role}/assign-classes`}/classes/student-dashboard/${row.id}`} state={{ 'assigned_class': assigned_class, 'student': row }}
        className="text-dark link">{row.student_id}</Link>,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Name',
      selector: row => row.name,
      cell: row => <Link to={`${role === 'user' ? '' : `/${role}/assign-classes`}/classes/student-dashboard/${row.id}`} state={{ 'assigned_class': assigned_class, 'student': row }}
        className="fw-semibold text-dark link">{row.name}</Link >,
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
      selector: row => row.phone,
      cell: row => <a href={'tel:' + row.phone} target='blank'>{row.phone}</a>,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Type',
      selector: row => row.type ?? 'Regular',
      cell: row => <span className={`badge ${row.type ? 'badge-warning' : 'badge-primary'}`}>{row.type ?? 'Regular'}</span>,
      sortable: true,
      button: true,
    },
    {
      name: 'Details',
      button: true,
      cell: row => <Link to={`${role === 'user' ? '' : `/${role}/assign-classes`}/classes/student-dashboard/${row.id}`} state={{ 'assigned_class': assigned_class, 'student': row }}
        className="btn btn-light border border-light-grey btn-sm px-2"><i className="fas fa-eye" ></i></Link >,
    }
  ]


  useEffect(() => {
    localStorage.getItem('role') ?
      setRole(localStorage.getItem('role'))
      : setRole(sessionStorage.getItem('role'))

    role && getStudents()
  }, [getStudents, role])

  useEffect(() => {
    const filteredData = students?.filter(student => {
      return student.student_id.toLowerCase().includes(searchStudents.toLowerCase())
        || student.name.toLowerCase().includes(searchStudents.toLowerCase())
        || student.email && student.email.toLowerCase().includes(searchStudents.toLowerCase())
        || student.phone && student.phone.toLowerCase().includes(searchStudents.toLowerCase())
    })
    setFilteredStudents(filteredData)
  }, [students, searchStudents])


  return (
    <Box>
      <DataTable
        title={
          <Box className="w-100 d-flex align-items-center justify-content-between my-2">
            <Box className="col-6 col-lg-3">
              <Box className="input-group">
                <Box className="input-group-text border-0 ps-0"><i className='fas fa-search'></i></Box>
                <input type="text" className="form-control bb-input" placeholder="Search student" value={searchStudents} onChange={(e) => setSearchStudents(e.target.value)} />
              </Box>
            </Box>
            {(role === 'moderator' || role === 'admin') &&
              <button className="btn btn-primary" onClick={() => { setShowAddRetakeStudentModal(true) }}><i className="fas fa-plus me-1"></i> Retake Student</button>}
          </Box>
        }
        columns={columns}
        data={filteredStudents}
        pagination
        responsive
        highlightOnHover
        noDataComponent={loading ? <Box className="text-center"><span className='spinner-border my-4'></span></Box>
          : <Box className="text-center my-5">No students found</Box>}
      // selectableRows
      // selectableRowsHighlight
      // onSelectedRowsChange={data => setSelectedStudents(data.selectedRows)}
      // contextActions={<button className="btn btn-primary me-2 px-3" onClick={() => { }}><i className="fas fa-copy"></i></button>}
      />



      {/* add student modal */}
      <ModalDialog
        title={'Add Retake Student'}
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
        onOpen={showAddRetakeStudentModal}
        onClose={() => { setShowAddRetakeStudentModal(false) }}
        confirmText={'Add'}
        onConfirm={addStudentToClass}
        loading={loading}
      />


      {/* Utilities */}
      <CustomSnackbar message={success} status={'success'} />
      <CustomSnackbar message={error} status={'error'} />
    </Box>
  )
}
