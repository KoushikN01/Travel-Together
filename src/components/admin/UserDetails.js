import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';

const UserDetails = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    priority: 'normal',
  });

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getUserCompleteData(userId);
      setUserData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch user data');
      toast.error('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await adminService.deleteUserTrip(tripId);
        toast.success('Trip deleted successfully');
        fetchUserData(); // Refresh data after deletion
      } catch (err) {
        toast.error('Failed to delete trip');
      }
    }
  };

  const handleSendNotification = async () => {
    try {
      await adminService.sendUserNotification(userId, notificationData);
      toast.success('Notification sent successfully');
      setNotificationDialog(false);
      setNotificationData({ title: '', message: '', priority: 'normal' });
      fetchUserData(); // Refresh data to show new notification
    } catch (err) {
      toast.error('Failed to send notification');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <Box>
      {/* User Profile Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5">
              {userData.user.firstName} {userData.user.lastName}
            </Typography>
            <Typography color="textSecondary">{userData.user.email}</Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<NotificationsIcon />}
              onClick={() => setNotificationDialog(true)}
              sx={{ mr: 1 }}
            >
              Send Notification
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchUserData}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabs for different sections */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Trips" />
          <Tab label="Activity" />
          <Tab label="Payments" />
          <Tab label="Support Tickets" />
          <Tab label="Documents" />
          <Tab label="Preferences" />
        </Tabs>

        {/* Trips Tab */}
        {activeTab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userData.trips.map((trip) => (
                  <TableRow key={trip._id}>
                    <TableCell>{trip.title}</TableCell>
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
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteTrip(trip._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Activity Tab */}
        {activeTab === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userData.activityLogs.map((log) => (
                  <TableRow key={log._id || log.timestamp}>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      {typeof log.details === 'object'
                        ? JSON.stringify(log.details)
                        : log.details}
                    </TableCell>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Payments Tab */}
        {activeTab === 2 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Amount</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userData.payments && userData.payments.length > 0 ? (
                  userData.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.amount}</TableCell>
                      <TableCell>{payment.currency}</TableCell>
                      <TableCell>
                        <Chip label={payment.status} size="small" color={
                          payment.status === 'completed' ? 'success' :
                          payment.status === 'pending' ? 'warning' :
                          payment.status === 'refunded' ? 'info' :
                          payment.status === 'failed' ? 'error' : 'default'
                        } />
                      </TableCell>
                      <TableCell>{payment.type}</TableCell>
                      <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No payments found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Support Tickets Tab */}
        {activeTab === 3 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userData.supportTickets && userData.supportTickets.length > 0 ? (
                  userData.supportTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <Chip label={ticket.status} size="small" color={
                          ticket.status === 'resolved' ? 'success' :
                          ticket.status === 'open' ? 'primary' :
                          ticket.status === 'in_progress' ? 'warning' :
                          ticket.status === 'closed' ? 'default' : 'default'
                        } />
                      </TableCell>
                      <TableCell>
                        <Chip label={ticket.priority} size="small" color={
                          ticket.priority === 'urgent' ? 'error' :
                          ticket.priority === 'high' ? 'warning' :
                          ticket.priority === 'medium' ? 'info' : 'default'
                        } />
                      </TableCell>
                      <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No support tickets found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Documents Tab */}
        {activeTab === 4 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Document Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userData.documents && userData.documents.length > 0 ? (
                  userData.documents.map((doc) => (
                    <TableRow key={doc._id || doc.id}>
                      <TableCell>{doc.fileName || doc.name}</TableCell>
                      <TableCell>{doc.fileType || doc.type}</TableCell>
                      <TableCell>{doc.uploadDate ? new Date(doc.uploadDate).toLocaleString() : (doc.createdAt ? new Date(doc.createdAt).toLocaleString() : '')}</TableCell>
                      <TableCell>
                        {doc.cloudinaryUrl || doc.url ? (
                          <IconButton color="primary" component="a" href={doc.cloudinaryUrl || doc.url} target="_blank" rel="noopener noreferrer">
                            <DownloadIcon />
                          </IconButton>
                        ) : null}
                        <IconButton color="error" onClick={() => {
                          // TODO: Implement document deletion logic
                          toast.info('Document deletion functionality not yet implemented.');
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No documents found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Preferences Tab */}
        {activeTab === 5 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">User Preferences</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">
                Language: {userData.user.preferences?.language || userData.user.settings?.account?.language || 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                Currency: {userData.user.preferences?.currency || 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                Timezone: {userData.user.preferences?.timezone || userData.user.settings?.account?.timezone || 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                Email Notifications: {userData.user.settings?.notifications?.emailNotifications !== undefined ? (userData.user.settings.notifications.emailNotifications ? 'Enabled' : 'Disabled') : 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                Push Notifications: {userData.user.settings?.notifications?.pushNotifications !== undefined ? (userData.user.settings.notifications.pushNotifications ? 'Enabled' : 'Disabled') : 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                Trip Updates: {userData.user.settings?.notifications?.tripUpdates !== undefined ? (userData.user.settings.notifications.tripUpdates ? 'Enabled' : 'Disabled') : 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                Price Alerts: {userData.user.settings?.notifications?.priceAlerts !== undefined ? (userData.user.settings.notifications.priceAlerts ? 'Enabled' : 'Disabled') : 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                Promotional Emails: {userData.user.settings?.notifications?.promotionalEmails !== undefined ? (userData.user.settings.notifications.promotionalEmails ? 'Enabled' : 'Disabled') : 'N/A'}
              </Typography>
              <Typography variant="subtitle1">
                Security Alerts: {userData.user.settings?.notifications?.securityAlerts !== undefined ? (userData.user.settings.notifications.securityAlerts ? 'Enabled' : 'Disabled') : 'N/A'}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Notification Dialog */}
      <Dialog
        open={notificationDialog}
        onClose={() => setNotificationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={notificationData.title}
              onChange={(e) =>
                setNotificationData({ ...notificationData, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={notificationData.message}
              onChange={(e) =>
                setNotificationData({ ...notificationData, message: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={notificationData.priority}
                onChange={(e) =>
                  setNotificationData({ ...notificationData, priority: e.target.value })
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSendNotification}
            variant="contained"
            color="primary"
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDetails; 