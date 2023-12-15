import React from 'react'
import { Navigate } from 'react-router-dom';


export default function UserPrivateRoute({ children }) {

  let isAuth = sessionStorage.getItem('userToken')
    || localStorage.getItem('userToken')
    ? true : false;

  return isAuth ? children : <Navigate to='/login' />;
}
