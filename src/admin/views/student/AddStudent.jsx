import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import CSVReader from 'react-csv-reader';
import DataTable from 'react-data-table-component'
import ModalDialog from '../../../utilities/ModalDialog';
import CustomSnackbar from '../../../utilities/SnackBar';
import { MenuItem, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function AddStudent() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([])
  const [batchs, setBatchs] = useState([])
  const [sections, setSections] = useState()

  const [acInfo, setAcInfo] = useState({ dept_id: 0, batch_id: 0, section_id: 0 })
  const [csvData, setCsvData] = useState([]);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editRowData, setEditRowData] = useState({ studentId: '', name: '', email: '', phone: '' });

  const [selectedStudents, setSelectedStudents] = useState([])
  const [showEditStudentModal, setShowEditStudentModal] = useState(false)

  // console.log(csvData)

  const handleEditClick = (rowIndex) => {
    setEditRowIndex(rowIndex);
    setEditRowData({
      studentId: csvData[rowIndex + 1][0],
      name: csvData[rowIndex + 1][1],
      email: csvData[rowIndex + 1][2] || '',
      phone: csvData[rowIndex + 1][3] || '',
    });
  };

  const handleSaveClick = () => {
    if (editRowIndex !== null) {
      // Update the 'csvData' state with the edited row data
      csvData[editRowIndex + 1][0] = editRowData.studentId;
      csvData[editRowIndex + 1][1] = editRowData.name;
      csvData[editRowIndex + 1][2] = editRowData.email;
      csvData[editRowIndex + 1][3] = editRowData.phone;

      setCsvData([...csvData]);

      // Clear editRowIndex and editRowData
      setEditRowIndex(null);
      setEditRowData({});

      // Close the modal
      setShowEditStudentModal(false)
    }
  };

  const handleDeleteClick = () => {
    if (selectedStudents.length > 0) {
      // Filter out the selected rows from 'csvData'
      const filteredData = csvData.filter((row, _rowIndex) => {
        return !selectedStudents.some((selectedRow) =>
          JSON.stringify(selectedRow) === JSON.stringify(row)
        );
      });
      setCsvData([...filteredData]);
      setSelectedStudents([]);
    }
  };

  // get departments
  const getDepartments = () => {
    axios.get('/api/admin/departments').then(res => {
      if (res.status === 200) {
        setDepartments(res.data.departments)
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    });
  }

  // get all batchs
  const getBatchs = useCallback((dept_id) => {
    axios.get(`/api/admin/batch_section/${dept_id}`).then(res => {
      if (res.status === 200) {
        setBatchs(res.data.batches)
        if (acInfo.batch_id !== 0) {
          res.data.batches.map((batch) => batch.id === acInfo.batch_id && setSections(batch.sections));
        }
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    });
  }, [acInfo.batch_id])

  // store student .csv data
  const storeCsvData = () => {
    setLoading(true)
    let data = { ac_info: acInfo, csv_data: csvData }
    axios.post('/api/admin/students/store-from-csv', data).then(res => {
      if (res.status === 200) {
        console.log(res.data)
        setSuccess(res.data.message)
        setLoading(false)
        setTimeout(() => { setSuccess('') }, 5000)
        navigate('/admin/students')
      } else {
        setError(res.data.message)
        setLoading(false)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setLoading(false)
      setTimeout(() => { setError('') }, 5000)
    });
  }

  // datatable columns
  const columns = [
    {
      name: 'Student ID',
      selector: row => row[0],
      sortable: true,
    },
    {
      name: 'Name',
      selector: row => row[1],
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row[2],
      sortable: true,
    },
    {
      name: 'Phone',
      selector: row => row[3],
      sortable: true,
    },
    {
      name: 'Edit',
      button: true,
      cell: row => <button className="btn btn-secondary btn-sm px-2" onClick={() => { handleEditClick(csvData.indexOf(row) - 1); setShowEditStudentModal(true) }}>
        <i className="fas fa-edit"></i></button>
    }
  ]

  useEffect(() => {
    if (sessionStorage.getItem('selectedId')) {
      setAcInfo(JSON.parse(sessionStorage.getItem('selectedId')))
      if (acInfo.dept_id !== 0)
        getBatchs(acInfo.dept_id)
    }
    getDepartments()
  }, [acInfo.batch_id, acInfo.dept_id, getBatchs])

  return (
    <div className="container">
      <div className='card my-2'>
        <div className='card-header d-flex align-items-center'>
          <button onClick={() => window.history.back()} className='btn btn-light btn-floating me-2 mt-2'>
            <i className='fas fa-arrow-left fa-lg'></i></button>
          <h5 className='mt-3'>Add students</h5>
        </div>

        <div className='card-body pt-3'>

          <div className='row'>
            {/* select departments */}
            <div className='col-6 col-md-4 col-lg-3'>
              <label htmlFor="department" className="form-label">Department</label>
              <TextField select fullWidth margin='small' size='small' value={acInfo.dept_id}
                onChange={(e) => {
                  setAcInfo({ ...acInfo, dept_id: e.target.value, batch_id: 0, section_id: 0 });
                  getBatchs(e.target.value);
                  sessionStorage.setItem('selectedId', JSON.stringify({ dept_id: e.target.value, batch_id: 0, section_id: 0 }))
                }}>
                <MenuItem value={0} disabled>Select Department</MenuItem>
                {departments.map((department) => (
                  <MenuItem value={department.id}>{department.name}</MenuItem>
                ))}
              </TextField>
            </div>

            {/* select batch */}
            <div className='col-6 col-md-4 col-lg-3'>
              <label htmlFor="department" className="form-label">Batch</label>
              <TextField select fullWidth margin='small' size='small' value={acInfo.batch_id}
                onChange={(e) => {
                  setAcInfo({ ...acInfo, batch_id: e.target.value, section_id: 0 });
                  batchs.map((batch) => batch.id === e.target.value && setSections(batch.sections));
                  sessionStorage.setItem('selectedId', JSON.stringify({ ...acInfo, batch_id: e.target.value, section_id: 0 }))
                }} disabled={acInfo.dept_id === 0}>
                <MenuItem value={0} disabled>Select Batch</MenuItem>
                {batchs.map((batch) => (
                  <MenuItem value={batch.id}>{batch.batch_name}</MenuItem>
                ))}
              </TextField>
            </div>

            {/* select section */}
            <div className='col-6 col-md-4 col-lg-3'>
              <label htmlFor="department" className="form-label">Section</label>
              <TextField select fullWidth margin='small' size='small' value={acInfo.section_id}
                onChange={(e) => {
                  setAcInfo({ ...acInfo, section_id: e.target.value });
                  sessionStorage.setItem('selectedId', JSON.stringify({ ...acInfo, section_id: e.target.value }))
                }} disabled={acInfo.batch_id === 0}>
                <MenuItem value={0} disabled>Select Section</MenuItem>
                {sections && sections.map((section) => (
                  <MenuItem value={section.id}>{section.section_name}</MenuItem>
                ))}
              </TextField>
            </div>

            {/* csv file input */}
            <div className='col-6 col-md-4 col-lg-3'>
              <div className="mb-2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <label htmlFor="department" className="form-label">Upload .csv file</label>
                <CSVReader cssClass="form-control px-2" onFileLoaded={(data) => setCsvData(data.slice(1))} disabled={acInfo.section_id === 0} />
              </div>
            </div>

            {/* submit button */}
            <div className='mb-3 d-flex justify-content-between align-items-center'>
              <a href="" className='btn-link'>Download .csv demo file</a>

              <button onClick={storeCsvData} className="btn btn-dark mt-3" disabled={csvData.length === 0}>
                {loading ? <span className="spinner-border spinner-border-sm"></span> : <span><i className="fas fa-save fa-lg me-2"></i> Save</span>}
              </button>
            </div>
          </div>


          <DataTable
            title={selectedStudents.length !== 0 ? ' ' : ''}
            columns={columns}
            data={csvData}
            pagination
            responsive
            highlightOnHover
            selectableRows
            selectableRowsHighlight
            onSelectedRowsChange={data => setSelectedStudents(data.selectedRows)}
            contextActions={<button className="btn btn-danger me-2 px-3" onClick={handleDeleteClick}>
              <i className="fas fa-trash-alt"></i></button>}
          />

        </div>
      </div>

      {/* Edit data modal */}
      <ModalDialog
        title={`Edit: ${editRowData.name}`}
        content={
          <form onSubmit={handleSaveClick}>
            <TextField label="Student ID" fullWidth value={editRowData.studentId}
              onChange={(e) => setEditRowData({ ...editRowData, studentId: e.target.value, })} margin='normal' size='small' />

            <TextField label="Name" fullWidth value={editRowData.name}
              onChange={(e) => setEditRowData({ ...editRowData, name: e.target.value, })} margin='normal' size='small' />

            <TextField label="Email" fullWidth value={editRowData.email}
              onChange={(e) => setEditRowData({ ...editRowData, email: e.target.value, })} margin='normal' size='small' />

            <TextField label="Phone" fullWidth value={editRowData.phone}
              onChange={(e) => setEditRowData({ ...editRowData, phone: e.target.value, })} margin='normal' size='small' />
          </form>
        }
        onOpen={showEditStudentModal}
        onClose={() => setShowEditStudentModal(false)}
        onConfirm={handleSaveClick}
        confirmText={'Update Input'}
      />

      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <CustomSnackbar message={success} status={'success'} />
    </div>
  );
}

