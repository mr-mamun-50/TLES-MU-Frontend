import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/images/logo/tles_logo_dark.png'
import vectorArt from '../assets/images/static/6101072.svg'
import axios from 'axios'
import CustomSnackbar from '../utilities/SnackBar'

export default function UserLogin() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  const [error, setError] = useState()
  const [loading, setLoading] = useState()

  const navigate = useNavigate();

  // Login function
  const loginSubmit = (e) => {
    e.preventDefault()
    let data = { email, password }
    setLoading(true)
    setError('')
    axios.get('/sanctum/csrf-cookie').then(_response => {
      axios.post('/api/user/login', data).then(res => {
        if (res.status === 200) {
          if (remember) {
            localStorage.setItem('userToken', res.data.access_token)
            localStorage.setItem('user', JSON.stringify(res.data.user))
          } else {
            sessionStorage.setItem('userToken', res.data.access_token)
            sessionStorage.setItem('user', JSON.stringify(res.data.user))
          }
          setLoading(false)
          navigate('/')
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
    <div>
      <div className="container col-lg-9">

        {/* Heading Section */}
        <div className="d-md-flex justify-content-between">
          <div className="d-flex align-items-center py-2">
            <div className="shadow rounded-8">
              {/* <img className="my-4" src={logo} alt="MyADC" style={{ width: '100px', height: '35px' }} /> */}
              <img className="my-4 px-2" src={logo} alt="MyADC" style={{ height: '35px', width: '80px' }} />
            </div>
            <div className="ms-4">
              <h1 className="text-primary mt-3 fw-bold mb-0">MU TLES</h1>
              <p>A teaching-learning evaluation system of MU</p>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-end mb-3">
            <Link to={'/admin'} className="btn btn-secondary" >
              <i className="fas fa-user-gear me-2"></i>
              Admin</Link>
          </div>
        </div>


        <div className="row d-md-flex align-items-center mt-4">
          {/* left image */}
          <div className="col-md-5 col-lg-6 p-3 p-lg-5">
            <img className="img-fluid mb-3" src={vectorArt} alt='Welcome' style={{ width: '90%' }} />
          </div>

          {/* login form box */}
          <div className="col-md-7 col-lg-6">
            <div className="card px-md-4 py-3 rounded-8 shadow-lg">
              <div className="card-header">
                <h2>Login</h2>
                <p>Input your login credentials here</p>
              </div>
              <div className="card-body">
                <form onSubmit={loginSubmit}>
                  <div className="mb-3">
                    <label className='form-label' htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" className='form-control form-control-lg'
                      value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className='form-label' htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" className='form-control form-control-lg'
                      value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>

                  <label htmlFor="remember" className='form-label mb-3'>
                    <input type="checkbox" name="remember" id="remember" checked={remember}
                      onChange={(e) => setRemember(e.target.checked)} /> Remember Me
                  </label>

                  <button type="submit" className='btn btn-primary btn-block'>
                    {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> :
                      <>Login <i className="fas fa-sign-in ms-1"></i></>}
                  </button>
                </form>

                <div className='mt-3 text-center'>
                  <Link to='/admin/forgot-password'>Forgot Password?</Link>
                </div>
              </div>
            </div>
          </div >
        </div >
      </div >


      {/* foother section */}
      <div className="py-3 mt-5">
        <div className="container">
          {/* <div className="d-flex justify-content-center">
            <img src="{{ asset('images/logos/Digital-Bangladesh.png') }}" alt="" style={{ height: "45px" }} />
            <img className="ms-4" src={''} alt="" style={{ height: "45px" }} />
            <img className="ms-4" src={''} alt="" style={{ height: "45px" }} />
            <img className="ms-4" src={''} alt="" style={{ height: "45px" }} />
          </div> */}
          <div className="d-md-flex justify-content-center small mt-3">
            <div className="text-muted">
              {`© ${new Date().getFullYear().toString()}. Developed by `}
              <a href="https://github.com/mr-mamun-50" target="blank">Mamunur Rashid Mamun</a> {' & '}
              <a href="https://github.com/mahfuz-99" target="blank">Mahfuzur Rahman Shanto</a>
            </div>
            <div className="ms-1">
              {" • "}
              <Link to={'#'}>Privacy Policy</Link>
              {" • "}
              <Link to={'#'}>Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>
      </div>

      {/* utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </div>
  )
}
