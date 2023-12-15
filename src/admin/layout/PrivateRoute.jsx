import React from 'react'
import { Navigate } from 'react-router-dom';


export default function AdminPrivateRoute({ children }) {

  let isAuth = sessionStorage.getItem('adminToken')
    || localStorage.getItem('adminToken')
    ? true : false;

  return isAuth ? children : <Navigate to='/admin/login' />;
}
