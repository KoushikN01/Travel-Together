import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Select,
  FormControl,
  InputLabel,
  ListItemSecondaryAction,
  IconButton as MuiIconButton,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  Sort as SortIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../../config';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('=== Fetching Notifications ===');
      const token = localStorage.getItem('token');
      console.log('Token present:', !!token);
      console.log('Token value:', token);
      
      if (!token) {
        setError('Please log in to view notifications');
        return;
      }
      
      const response = await axios.get(`${API_URL}/user/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Notifications response:', response.data);
      setNotifications(response.data.notifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/user/notifications/${id}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(notifications.map(notification =>
        notification._id === id ? { ...notification, read: true } : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleReadAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/user/notifications/read-all`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/user/notifications/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(notifications.filter(notification => notification._id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/user/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications([]);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
    }
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsActiveIcon /> : <NotificationsIcon />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 440,
            background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)',
            borderRadius: 4,
            boxShadow: 6,
            p: 0,
          }
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 3,
          py: 2,
          background: 'linear-gradient(90deg, #2563eb 30%, #7c3aed 90%)',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          mb: 1
        }}>
          <NotificationsActiveIcon sx={{ color: 'white', fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700} color="white">Notifications</Typography>
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort</InputLabel>
              <Select
                value={sortOrder}
                onChange={handleSortChange}
                label="Sort"
                size="small"
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </FormControl>
            {notifications.length > 0 && (
              <>
                <Tooltip title="Mark all as read">
                  <IconButton size="small" onClick={handleReadAll} sx={{ color: 'white' }}>
                    <CheckCircleIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete all">
                  <IconButton size="small" onClick={handleDeleteAll} sx={{ color: 'white' }}>
                    <DeleteSweepIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>
        <Divider />
        <Box sx={{ p: 2, pt: 1 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center">{error}</Typography>
          ) : notifications.length === 0 ? (
            <Typography align="center" color="text.secondary">No notifications</Typography>
          ) : (
            <List>
              {sortedNotifications.map((notification) => (
                <ListItem
                  key={notification._id}
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notification.read ? 'rgba(255,255,255,0.85)' : 'rgba(124,58,237,0.08)',
                    borderRadius: 2,
                    mb: 1,
                    boxShadow: notification.read ? 0 : 2,
                    transition: 'background 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(124,58,237,0.15)',
                    },
                  }}
                  secondaryAction={
                    <MuiIconButton edge="end" aria-label="delete" onClick={() => handleDelete(notification._id)}>
                      <DeleteIcon />
                    </MuiIconButton>
                  }
                  onClick={() => handleRead(notification._id)}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={notification.read ? 400 : 700} color={notification.read ? 'text.secondary' : 'primary'}>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBell; 