import { Box } from "@mui/material"
import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import DataTable from "react-data-table-component"
import { Link, useParams } from "react-router-dom"
import CustomSnackbar from "../../../../utilities/SnackBar"

export default function EnrolledStudents() {

  // const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const classId = useParams().id

  const [students, setStudents] = useState([])

  const [searchStudents, setSearchStudents] = useState('')
  const [filteredStudents, setFilteredStudents] = useState([])
  // const [selectedStudents, setSelectedStudents] = useState([])

  // console.log(students)

  // get students
  const getStudents = useCallback(() => {
    setLoading(true)
    axios.get(`/api/user/enrolled-students/${classId}`).then(res => {
      if (res.status === 200) {
        setStudents(res.data.course.section.students)
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
  }, [classId])

  // datatable columns
  const columns = [
    {
      name: 'Student ID',
      selector: row => row.student_id,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Email',
      selector: row => <a href={'mailto:' + row.email} target='blank'>{row.email}</a>,
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
      cell: row => <Link to={`/classes/student/${row.id}`} className="btn btn-secondary btn-sm px-2">
        <i className="fas fa-eye" ></i></Link >,
    }
  ]


  useEffect(() => {
    getStudents()
  }, [getStudents])



  useEffect(() => {
    const filteredData = students.filter(student => {
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
          <div className='col-4'>
            <div className="input-group">
              <div className="input-group-text border-0 ps-0"><i className='fas fa-search'></i></div>
              <input type="text" className="form-control bb-input" placeholder="Search student" value={searchStudents} onChange={(e) => setSearchStudents(e.target.value)} />
            </div>
          </div>
        }
        columns={columns}
        data={filteredStudents}
        pagination
        responsive
        highlightOnHover
        noDataComponent={loading ? <div className="text-center"><span className='spinner-border my-4'></span></div>
          : <div className="text-center my-5">No students found</div>}
        selectableRows
        selectableRowsHighlight
        // onSelectedRowsChange={data => setSelectedStudents(data.selectedRows)}
        contextActions={<button className="btn btn-primary me-2 px-3" onClick={() => { }}><i className="fas fa-copy"></i></button>}
      />


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </Box>
  )
}
