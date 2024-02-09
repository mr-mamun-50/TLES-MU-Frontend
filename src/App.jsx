import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import { createTheme, ThemeProvider } from '@mui/material';
import AllRoutes from "./Routes";


// axios.defaults.baseURL = 'http://localhost/teaching_learning_evaluation_system_mu/backend/public';
axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.withCredentials = true;

// if server respond with 401 error, clear session storage and local storage
axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error.response.status === 401) {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "/";
  }
  return Promise.reject(error);
});

axios.interceptors.request.use(function (config) {
  const userToken = sessionStorage.getItem('userToken') || localStorage.getItem('userToken');
  const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
  const moderatorToken = sessionStorage.getItem('moderatorToken') || localStorage.getItem('moderatorToken');

  // Check the API route and attach the appropriate token
  if (config.url.includes('/api/user/')) {
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
  } else if (config.url.includes('/api/admin/')) {
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else if (config.url.includes('/api/moderator/')) {
    if (moderatorToken) {
      config.headers.Authorization = `Bearer ${moderatorToken}`;
    }
  }
  return config;
});

const theme = createTheme({
  typography: {
    fontFamily: "Roboto, Noto Serif Bengali",
  },
  // palette: {
  //   mode: 'dark',
  // },
});


function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AllRoutes />
      </ThemeProvider>
    </Router>
  );
}

export default App;
