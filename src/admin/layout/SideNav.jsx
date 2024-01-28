import { useState } from 'react'
import { Toolbar } from "@mui/material";
import logo from '../../assets/images/logo/tles_logo.png';
import { NavLink } from 'react-router-dom';


export default function AdminSideNav({ onClose }) {

  const [showClinicalSubMenu, setShowClinicalSubMenu] = useState(false);

  return (
    <div>
      {/* navbar */}
      <nav id="sidebarMenu" className="collapse d-block sidebar">
        <Toolbar className='d-flex align-items-center justify-content-between pt-0'>
          {/* <img className='rounded-9' src={logo} alt="logo" style={{ height: '40px', filter: 'drop-shadow(0 0 10px #fff)' }} /> */}
          <img className='' src={logo} alt="logo" style={{ height: '45px' }} />

          {/* Close button */}
          <button className='btn rounded-circle text-white d-block d-sm-none px-2 py-1'
            onClick={onClose} style={{ background: '#787a7b' }}>
            <i className="fas fa-close fa-lg"></i>
          </button>
          {/* Fullscreen button */}
          <button className="btn btn-floating btn-sm text-white d-none d-sm-block" style={{ background: '#787a7b' }}
            onClick={e => { e.preventDefault(); document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen() }}>
            <i className={`bi ${document.fullscreenElement ? 'bi-fullscreen-exit' : 'bi-arrows-fullscreen'}`}></i>
          </button>
        </Toolbar>

        <div className="position-sticky">
          <div className="list-group list-group-flush mt-4">

            <small className='text-muted ms-4'>Core</small>
            <hr className='mb-1 mt-0 text-light' />

            <NavLink to="/admin" end>
              <span className="list-group-item list-group-item-action py-2 ripple">
                <i className="fas fa-chart-area fa-fw me-3"></i> <span> Dashboard</span>
              </span>
            </NavLink>
            <NavLink to="/">
              <span className="list-group-item list-group-item-action py-2 ripple">
                <i className="fas fa-clipboard-list fa-fw me-3"></i> <span> Notices</span>
              </span>
            </NavLink>

            <small className='text-muted mt-2 ms-4'>Administrative</small>
            <hr className='mb-1 mt-0 text-light' />

            <NavLink to="/admin/students">
              <span className="list-group-item list-group-item-action py-2 ripple">
                <i className="fas fa-people-roof fa-fw me-3"></i><span> Students</span>
              </span>
            </NavLink>

            <NavLink to="/admin/teachers">
              <span className="list-group-item list-group-item-action py-2 ripple">
                <i className="fas fa-user-tie fa-fw me-3"></i><span> Teachers</span>
              </span>
            </NavLink>

            <NavLink to="/admin/semester">
              <span className="list-group-item list-group-item-action py-2 ripple">
                <i className="fas fa-diagram-next fa-fw me-3"></i><span> Semesters</span>
              </span>
            </NavLink>

            <NavLink to="/admin/batch-section">
              <span className="list-group-item list-group-item-action py-2 ripple">
                <i className="fas fa-users-rectangle fa-fw me-3"></i><span> Batches</span>
              </span>
            </NavLink>

            <NavLink to="/admin/moderators">
              <span className="list-group-item list-group-item-action py-2 ripple">
                <i className="fas fa-user-gear fa-fw me-3"></i><span> Head of Departments</span>
              </span>
            </NavLink>

            <NavLink to="/admin/departments-courses">
              <span className="list-group-item list-group-item-action py-2 ripple">
                <i className="fas fa-layer-group fa-fw me-3"></i><span> Dept. & Courses</span>
              </span>
            </NavLink>

            <span className="list-group-item list-group-item-action py-2" onClick={() => setShowClinicalSubMenu(!showClinicalSubMenu)} >
              <i className="fas fa-university fa-fw me-3"></i>{" "}
              <span>Others</span>
              <i className={`fas ${showClinicalSubMenu ? "fa-angle-down" : "fa-angle-right"} float-end mt-1`}></i>
            </span>
            <div className={`${showClinicalSubMenu ? "show" : "collapse"} glassy`}>
              <NavLink to="/" className="list-group-item">
                <span>
                  <i className="fas fa-layer-group fa-fw me-3"></i>
                  <span>Demo 1</span>
                </span>
              </NavLink>
              <NavLink to="/" className="list-group-item">
                <span>
                  <i className="fas fa-layer-group fa-fw me-3"></i>
                  <span>Demo 2</span>
                </span>
              </NavLink>
            </div>
          </div>
        </div>

      </nav >
    </div >
  )
}
