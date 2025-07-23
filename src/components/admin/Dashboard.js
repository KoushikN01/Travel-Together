import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  AppBar,
  Toolbar,
  Button,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  Person,
  Flight,
  Hotel,
  DirectionsWalk,
  Refresh,
  Logout,
  Delete,
  Visibility,
  Check,
  Close,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import UserDetails from './UserDetails';

const Dashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [tripActionLoading, setTripActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [usersResponse, tripsResponse] = await Promise.all([
        adminService.getUsers(),
        adminService.getTrips()
      ]);

      setUsers(usersResponse.data);
      setTrips(tripsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminService.adminLogout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Fetch activity logs
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
  }, []);

  // Delete user handler
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setUserActionLoading(true);
    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      alert('Failed to delete user');
    } finally {
      setUserActionLoading(false);
    }
  };

  // Approve/Reject trip handlers
  const handleApproveTrip = async (tripId) => {
    setTripActionLoading(true);
    try {
      await adminService.approveTrip(tripId);
      setTrips(trips.map(trip => trip.id === tripId ? { ...trip, status: 'confirmed' } : trip));
    } catch (err) {
      alert('Failed to approve trip');
    } finally {
      setTripActionLoading(false);
    }
  };
  const handleRejectTrip = async (tripId) => {
    setTripActionLoading(true);
    try {
      await adminService.rejectTrip(tripId);
      setTrips(trips.map(trip => trip.id === tripId ? { ...trip, status: 'rejected' } : trip));
    } catch (err) {
      alert('Failed to reject trip');
    } finally {
      setTripActionLoading(false);
    }
  };

  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const handleCloseUserDetails = () => {
    setUserDetailsOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <div style={{color: 'red', fontWeight: 'bold', fontSize: 20, textAlign: 'center', margin: 16}}>ADMIN DASHBOARD TEST</div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Admin Dashboard
            </Typography>
            <Button color="inherit" onClick={handleRefresh} startIcon={<Refresh />}>
              Refresh
            </Button>
            <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {users.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Trips
                  </Typography>
                  <Typography variant="h4">
                    {trips.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Active Trips
                  </Typography>
                  <Typography variant="h4">
                    {trips.filter(trip => trip.status === 'ongoing').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    New Users (Today)
                  </Typography>
                  <Typography variant="h4">
                    {users.filter(user => {
                      const today = new Date();
                      const userDate = new Date(user.joinDate);
                      return today.toDateString() === userDate.toDateString();
                    }).length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Users Table */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Users
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Join Date</TableCell>
                        <TableCell>Last Login</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                          <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={user.status}
                              color={user.status === 'active' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={user.role}
                              color={user.role === 'admin' ? 'primary' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleViewUserDetails(user)}
                              color="primary"
                              title="View Details"
                            >
                              <Visibility />
                            </IconButton>
                            {user.role !== 'admin' && (
                              <IconButton
                                onClick={() => handleDeleteUser(user.id)}
                                color="error"
                                disabled={userActionLoading}
                                title="Delete User"
                              >
                                <Delete />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Trips Table */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Trips
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Creator</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Activities</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {trips.map((trip) => (
                        <TableRow key={trip.id}>
                          <TableCell>{trip.title}</TableCell>
                          <TableCell>{trip.creator.name}</TableCell>
                          <TableCell>{new Date(trip.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(trip.endDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip 
                              label={trip.status}
                              color={
                                trip.status === 'confirmed'
                                  ? 'success'
                                  : trip.status === 'cancelled'
                                  ? 'error'
                                  : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{trip.activities}</TableCell>
                          <TableCell>
                            <IconButton
                                  onClick={() => handleApproveTrip(trip.id)}
                                  color="success"
                                  disabled={tripActionLoading}
                              title="Approve Trip"
                            >
                              <Check />
                            </IconButton>
                            <IconButton
                                  onClick={() => handleRejectTrip(trip.id)}
                                  color="error"
                                  disabled={tripActionLoading}
                              title="Reject Trip"
                            >
                              <Close />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* User Activity Log Section */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mt: 4 }}>
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
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* User Details Dialog */}
      <Dialog
        open={userDetailsOpen}
        onClose={handleCloseUserDetails}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          {selectedUser && (
            <UserDetails userId={selectedUser.id} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard; 