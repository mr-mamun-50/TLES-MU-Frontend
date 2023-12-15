import React from "react";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {

  let level = 0

  if (localStorage.getItem('userToken') || sessionStorage.getItem('userToken')) {
    level = ''
  } else if (localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')) {
    level = 'admin'
  }

  return level !== 0 ? <Navigate to={`/${level}`} /> : children;
}
