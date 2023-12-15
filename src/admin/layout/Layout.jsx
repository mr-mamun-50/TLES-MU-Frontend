import * as React from 'react';
import PropTypes from 'prop-types';
import { AppBar, Avatar, Box, Button, CssBaseline, Divider, Drawer, IconButton, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { Outlet, useNavigate } from 'react-router-dom';
import Swal, { } from "sweetalert2";
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import CustomSnackbar from '../../utilities/SnackBar';
import PasswordChangeDialog from '../../utilities/PasswordChangeDialog';
import AdminSideNav from './SideNav';
import config from '../../config';

const drawerWidth = 240;

export default function AdminLayout(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [error, setError] = useState()
  // const [success, setSuccess] = useState("")
  // const [loading, setLoading] = useState()
  const [userDetails, setUserDetails] = useState([])
  const navigate = useNavigate();
  const [openChangePass, setOpenChangePass] = useState(false);


  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const container = window !== undefined ? () => window().document.body : undefined;

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };


  // Logout function
  const handleLogOut = () => {
    handleClose()

    Swal.fire({
      title: 'Are you sure?',
      text: "You will be redirect to login!",
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: '#1976D2',
      cancelButtonColor: '#707070',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.post('/api/admin/logout').then(res => {
          if (res.status === 200) {
            localStorage.clear()
            sessionStorage.clear()

            navigate('/admin/login')
          } else {
            setError(res.data.message)
            setTimeout(() => { setError('') }, 5000)
          }
        }).catch(err => {
          setError(err.response.data.message)
          setTimeout(() => { setError('') }, 5000)
        });
      }
    })
  }

  // get user details
  const getUser = useCallback(() => {
    axios.get('/api/admin/profile').then(res => {
      if (res.status === 200) {
        setUserDetails(res.data.user)
        if (userDetails.mustChangePass) {
          setOpenChangePass(true)
        }
      } else {
        setError(res.data.message)
        setTimeout(() => { setError('') }, 5000)
      }
    }).catch(err => {
      setError(err.response.data.message)
      setTimeout(() => { setError('') }, 5000)
    });
  }, [userDetails.mustChangePass])

  useEffect(() => {
    getUser()
  }, [getUser])


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* TopNav   */}
      <AppBar position="fixed" color='transparent' className='shadow-1 bg-white'
        sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start"
            onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>

          {/* user info */}
          {/* <Box className="border px-2 px-md-3 py-1 me-2 rounded-7 wrap50p">
            <h6 className='m-0 p-0'>{userDetails.name}</h6>
            <p className='m-0 p-0' style={{ fontSize: '12px', fontWeight: '200', color: '#707070' }}>
              {userDetails.email}</p>
          </Box> */}
          {/* dropdown list */}
          <Box className='ms-auto'>
            <div className="bg-light rounded-7 ps-1">
              <Button size="large" aria-label="account" aria-controls="menu-appbar" aria-haspopup="true"
                onClick={handleMenu} color="inherit" style={{ textTransform: 'none' }}>

                <Typography mr={1}>{userDetails.name}</Typography>
                <Avatar src={`${config.s3BaseUrl}${userDetails.photo}`} sx={{ width: 32, height: 32 }} />
              </Button>
            </div>

            <Menu id="menu-appbar" anchorEl={anchorEl} sx={{ mt: '40px' }}
              anchorOrigin={{ vertical: 'top', horizontal: 'right', }} keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right', }}
              open={Boolean(anchorEl)} onClose={handleClose}>

              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); setOpenChangePass(true) }}>Change Password</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogOut}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* SideNav */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer container={container} variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}>
          <AdminSideNav onClose={handleDrawerToggle} />
        </Drawer>

        <Drawer variant="permanent" className='bg-dark'
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }} open>
          <AdminSideNav />
        </Drawer>
      </Box>

      {/* main */}
      <Box component="main" className='bg-light' sx={{ minHeight: '105vh', flexGrow: 1, p: 2, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>


      {/* Utilities */}
      <CustomSnackbar message={error} status={'error'} />
      <PasswordChangeDialog level={'admin'} onOpen={openChangePass} onClose={() => { getUser(); setOpenChangePass(false) }}
        mustChange={userDetails.mustChangePass ? true : false} />
    </Box >
  );
}

AdminLayout.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};
