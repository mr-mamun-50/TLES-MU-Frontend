import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import "mdb-ui-kit/css/mdb.min.css";
import "./assets/css/style.css";

if (localStorage.getItem('themeMode') === 'dark') {
  import("mdb-ui-kit/css/mdb.dark.min.css");
  import("./assets/css/style.colors.dark.css");
} else {
  import("./assets/css/style.colors.light.css");
}
import 'bootstrap-icons/font/bootstrap-icons.min.css'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
