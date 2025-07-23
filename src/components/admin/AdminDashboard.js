import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { AccountCircle, Logout, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import UsersList from './UsersList';
import TripsList from './TripsList';
import adminService from '../../services/adminService';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const adminUser = adminService.getAdminUser();
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    // Check admin authentication
    if (!adminService.isAdminAuthenticated()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        const res = await adminService.getUserActivity();
        setActivityLogs(res.data);
      } catch (err) {
        // ignore
      }
    };
    fetchActivityLogs();
  }, [refreshKey]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await adminService.adminLogout();
      // Clear admin data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      handleClose(); // Close the menu
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <>
      <div style={{color: 'red', fontWeight: 'bold', fontSize: 20, textAlign: 'center', margin: 16}}>ADMIN DASHBOARD TEST</div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Admin Console
            </Typography>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleRefresh}
              sx={{ mr: 2 }}
            >
              <Refresh />
            </IconButton>
            <div>
              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  {adminUser?.email || 'Admin'}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Logout fontSize="small" sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <UsersList key={`users-${refreshKey}`} />
          </Box>
          
          <Box>
            <TripsList key={`trips-${refreshKey}`} />
          </Box>
          {/* User Activity Log Section */}
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                User Activity Log
              </Typography>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Details</TableCell>
                      <TableCell>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activityLogs.map((log, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>
                          {typeof log.details === 'object' 
                            ? JSON.stringify(log.details) 
                            : log.details}
                        </TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default AdminDashboard; 