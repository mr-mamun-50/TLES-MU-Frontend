import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/images/logo/tles_logo_dark.png'
import vectorArt from '../assets/images/static/6101072.svg'
import axios from 'axios'
import CustomSnackbar from '../utilities/SnackBar'
import { Box } from '@mui/material'

export default function UserLogin() {

  const [error, setError] = useState('')
  const [loading, setLoading] = useState('')

  const [loginCredentials, setLoginCredentials] = useState({ role: 'user', email: '', password: '', remember: false })

  const navigate = useNavigate();

  // Login function
  const loginSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    axios.get('/sanctum/csrf-cookie').then(_response => {
      axios.post(`/api/${loginCredentials.role}/login`, loginCredentials).then(res => {
        if (res.status === 200) {
          if (loginCredentials.remember) {
            localStorage.setItem(`${loginCredentials.role}Token`, res.data.access_token)
            localStorage.setItem('user', JSON.stringify(res.data.user))
            localStorage.setItem('role', loginCredentials.role)
          } else {
            sessionStorage.setItem(`${loginCredentials.role}Token`, res.data.access_token)
            sessionStorage.setItem('user', JSON.stringify(res.data.user))
            sessionStorage.setItem('role', loginCredentials.role)
          }
          setLoading(false)
          navigate(`/${loginCredentials.role === 'User' ? '' : loginCredentials.role}`)
        } else {
          setLoading(false)
          setError(res.data.message)
          setTimeout(() => { setError('') }, 5000)
        }
      }).catch(err => {
        setLoading(false)
        setError(err.response.data.message)
        setTimeout(() => { setError('') }, 5000)
      });
    });
  }

  return (
    <Box>
      <Box className="container col-lg-10">

        {/* Heading Section */}
        <Box className="d-md-flex justify-content-between">
          <Box className="d-flex align-items-center py-2 ms-lg-4">
            <Box className="shadow rounded-8">
              <img className="my-4 px-2" src={logo} alt="MyADC" style={{ height: '35px', width: '80px' }} />
            </Box>
            <Box className="ms-4">
              <h1 className="text-primary mt-3 fw-bold mb-0">MU TLES</h1>
              <p>A teaching-learning evaluation system of MU</p>
            </Box>
          </Box>

          <Box className="d-flex align-items-center justify-content-end">
            <button className="btn btn-secondary">
              <i className="fas fa-book me-2"></i> User Manual
            </button>
          </Box>
        </Box>


        <Box className="row d-md-flex align-items-center">
          {/* left image */}
          <Box className="col-md-5 col-lg-6 p-3 p-lg-5 d-none d-md-block">
            <img className="img-fluid mb-3" src={vectorArt} alt='Welcome' style={{ width: '95%' }} />
          </Box>

          {/* login form box */}
          <Box className="col-md-7 col-lg-6 mt-4 mt-md-0">
            <Box className="card px-md-4 py-3 rounded-8 shadow-lg">
              <Box className="card-header">
                <h2>Login</h2>
                <p className='mb-0'>Input your login credentials here</p>
              </Box>

              <Box className="card-body pb-3">
                <form onSubmit={loginSubmit}>

                  {/* role select */}
                  <Box className="mb-3">
                    <label className='form-label' htmlFor="loginAs">Login as-</label>

                    <Box className="d-flex align-items-center">
                      <Box type='button' className={`btn pe-3 border w-100 d-flex justify-content-between align-items-center ${loginCredentials.role === 'user' && 'border-primary'}`}
                        onClick={() => setLoginCredentials({ ...loginCredentials, role: 'user' })} >
                        <span><i className="fas fa-user-pen text-secondary me-1"></i> Teacher</span>
                        <i className={`far fa-${loginCredentials.role === 'user' ? 'circle-dot text-primary' : 'circle text-grey'}`}></i>
                      </Box>

                      <Box type='button' className={`btn pe-3 border w-100 mx-3 d-flex justify-content-between align-items-center ${loginCredentials.role === 'moderator' && 'border-primary'}`}
                        onClick={() => setLoginCredentials({ ...loginCredentials, role: 'moderator' })} >
                        <span><i className="fas fa-user-gear text-secondary me-1"></i> HOD</span>
                        <i className={`far fa-${loginCredentials.role === 'moderator' ? 'circle-dot text-primary' : 'circle text-grey'}`}></i>
                      </Box>

                      <Box type='button' className={`btn pe-3 border w-100 d-flex justify-content-between align-items-center ${loginCredentials.role === 'admin' && 'border-primary'}`}
                        onClick={() => setLoginCredentials({ ...loginCredentials, role: 'admin' })} >
                        <span><i className="fas fa-user-shield text-secondary me-1"></i> Admin</span>
                        <i className={`far fa-${loginCredentials.role === 'admin' ? 'circle-dot text-primary' : 'circle text-grey'}`}></i>
                      </Box>
                    </Box>
                  </Box>

                  {/* email input */}
                  <Box className="mb-3">
                    <label className='form-label' htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" className='form-control form-control-lg' placeholder='user@example.com'
                      value={loginCredentials.email} onChange={(e) => setLoginCredentials({ ...loginCredentials, email: e.target.value })} />
                  </Box>

                  {/* password input */}
                  <Box className="mb-3">
                    <label className='form-label' htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" className='form-control form-control-lg' placeholder='********'
                      value={loginCredentials.password} onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })} />
                  </Box>

                  {/* remember me */}
                  <label htmlFor="remember" className='form-label mb-3'>
                    <input type="checkbox" name="remember" id="remember" checked={loginCredentials.remember}
                      onChange={(e) => setLoginCredentials({ ...loginCredentials, remember: e.target.checked })} /> Remember Me
                  </label>

                  {/* submit button */}
                  <button type="submit" className='btn btn-primary btn-block'>
                    {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> :
                      <>Login <i className="fas fa-sign-in ms-1"></i></>}
                  </button>
                </form>

                <Box className='mt-3 text-center'>
                  <Link to='/admin/forgot-password'>Forgot Password?</Link>
                </Box>
              </Box>
            </Box>
          </Box >
        </Box >
      </Box >


      {/* footer section */}
      <Box className="py-3 mt-5">
        <Box className="container">
          {/* <Box className="d-flex justify-content-center">
            <img src="{{ asset('images/logos/Digital-Bangladesh.png') }}" alt="" style={{ height: "45px" }} />
            <img className="ms-4" src={''} alt="" style={{ height: "45px" }} />
            <img className="ms-4" src={''} alt="" style={{ height: "45px" }} />
            <img className="ms-4" src={''} alt="" style={{ height: "45px" }} />
          </Box> */}
          <Box className="d-md-flex justify-content-center small mt-3">
            <Box className="text-muted">
              {`© ${new Date().getFullYear().toString()}. Developed by `}
              <a href="https://github.com/mr-mamun-50" target="blank">Mamunur Rashid Mamun</a> {' & '}
              <a href="https://github.com/mahfuz-99" target="blank">Mahfuzur Rahman Shanto</a>
            </Box>
            <Box className="ms-1">
              {" • "}
              <Link to={'#'}>Privacy Policy</Link>
              {" • "}
              <Link to={'#'}>Terms &amp; Conditions</Link>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </Box>
  )
}
