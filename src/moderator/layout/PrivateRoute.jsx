import { Navigate } from 'react-router-dom';


export default function ModeratorPrivateRoute({ children }) {

  let isAuth = sessionStorage.getItem('moderatorToken')
    || localStorage.getItem('moderatorToken')
    ? true : false;

  return isAuth ? children : <Navigate to='/login' />;
}
