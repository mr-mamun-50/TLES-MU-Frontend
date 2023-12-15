import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/images/logo/tles_logo_dark.png'
import { useState } from 'react'
import axios from 'axios'
import CustomSnackbar from '../utilities/SnackBar'

export default function AdminLogin() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  const [error, setError] = useState()
  const [loading, setLoading] = useState()

  const navigate = useNavigate();

  const loginSubmit = (e) => {
    e.preventDefault()
    let data = { email, password }
    setLoading(true)
    setError('')
    axios.get('/sanctum/csrf-cookie').then(response => {
      axios.post('/api/admin/login', data).then(res => {
        if (res.status === 200) {
          if (remember) {
            localStorage.setItem('adminToken', res.data.access_token)
            localStorage.setItem('user', JSON.stringify(res.data.user))
          } else {
            sessionStorage.setItem('adminToken', res.data.access_token)
            sessionStorage.setItem('user', JSON.stringify(res.data.user))
          }
          setLoading(false)
          navigate('/admin')
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
    <div className='d-flex align-items-center justify-content-center p-5' style={{ minHeight: '100vh' }} >
      <div className='col-lg-4 col-md-6 col-12'>
        {/* Logo */}
        <Link to={'/'} >
          {/* <img src={logo} alt='logo' className='d-block mx-auto mb-3' height="50px" width="125px" /> */}
          <img src={logo} alt='logo' className='d-block mx-auto mb-3' height="50px" width="90" />
        </Link>
        <h4 className='text-center mb-4'>Admin Login</h4>

        {/* login form */}
        <div className='card card-body shadow-lg rounded-7'>
          <form onSubmit={loginSubmit}>
            <div className="mb-3">
              <label htmlFor="email">Email</label>
              <input type="email" name="email" id="email" className='form-control' value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="mb-3">
              <label htmlFor="password">Password</label>
              <input type="password" name="password" id="password" className='form-control' value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <label htmlFor="remember" className='mb-3'>
              <input type="checkbox" name="remember" id="remember" checked={remember}
                onChange={(e) => setRemember(e.target.checked)} /> Remember Me
            </label>


            <button type="submit" className='btn btn-primary btn-block'>
              {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> :
                <>Login <i className="fas fa-sign-in ms-1"></i></>}
            </button>

            <div className='mt-3 text-center'>
              <Link to='/admin/forgot-password'>Forgot Password?</Link>
            </div>
          </form>
        </div>
      </div>

      {/* utilities */}
      <CustomSnackbar message={error} status={'error'} />
    </div>
  )
}