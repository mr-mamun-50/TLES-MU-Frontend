import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import { AppBar, Box, createTheme, ThemeProvider } from '@mui/material';
import { useState } from "react";
import AllRoutes from "./Routes";


// axios.defaults.baseURL = 'http://localhost/teaching_learning_evaluation_system_mu/backend/public';
// axios.defaults.baseURL = 'http://tlesmu-server.000webhostapp.com';
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


function App() {

  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');

  const theme = createTheme({
    typography: {
      fontFamily: "Roboto, Noto Serif Bengali",
    },
    palette: {
      mode: themeMode,
    },
  });

  return (
    <Router>
      <ThemeProvider theme={theme}>

        <AllRoutes />

        <AppBar color='transparent' elevation={0} position={'fixed'} sx={{ height: '0px' }}>
          <Box className="ms-auto d-flex bg-info" sx={{ height: '0px' }}>

            <button className="btn btn-dark bg-secondary btn-floating mt-3" onClick={() => {
              setThemeMode(themeMode === 'light' ? 'dark' : 'light');
              localStorage.setItem('themeMode', themeMode === 'light' ? 'dark' : 'light');
              window.location.reload();
            }}>
              {themeMode === 'dark' ? <i className="bi bi-sun-fill fa-lg"></i> : <i className="bi bi-moon-fill fa-lg"></i>}
            </button>

            <Box sx={{ width: '210px' }}></Box>
          </Box>
        </AppBar>

      </ThemeProvider>
    </Router>
  );
}

export default App;
