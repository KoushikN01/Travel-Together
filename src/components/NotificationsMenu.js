import React, { useState, useEffect } from 'react';
import {
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  FlightTakeoff as TripIcon,
  Payment as PaymentIcon,
  Message as MessageIcon,
  Event as EventIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { API_URL } from '../config';

const NotificationItem = ({ notification, onRead }) => {
  const navigate = useNavigate();
  const getIcon = () => {
    switch (notification.type) {
      case 'trip':
        return <TripIcon color="primary" />;
      case 'payment':
        return <PaymentIcon color="success" />;
      case 'message':
        return <MessageIcon color="info" />;
      case 'event':
        return <EventIcon color="warning" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  const getColor = () => {
    switch (notification.priority) {
      case 'high':
        return 'error.main';
      case 'medium':
        return 'warning.main';
      case 'low':
        return 'info.main';
      default:
        return 'text.secondary';
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <ListItem
      button
      onClick={handleClick}
      sx={{
        bgcolor: notification.read ? 'inherit' : 'action.hover',
        '&:hover': {
          bgcolor: 'action.selected',
        },
      }}
    >
      <ListItemIcon>{getIcon()}</ListItemIcon>
      <ListItemText
        primary={
          <Typography
            variant="subtitle2"
            sx={{ color: getColor(), fontWeight: notification.read ? 'normal' : 'bold' }}
          >
            {notification.title}
          </Typography>
        }
        secondary={
          <>
            <Typography variant="body2" color="text.primary">
              {notification.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
};

const NotificationsMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('=== Fetching Notifications ===');
      const token = localStorage.getItem('adminToken');
      console.log('Token present:', !!token);
      
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
      if (err.response?.status === 401) {
        setError('Please log in to view notifications');
      } else {
        setError('Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRead = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
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
      const token = localStorage.getItem('adminToken');
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)',
            },
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleReadAll}
              startIcon={<CheckIcon />}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="error" align="center">
                    {error}
                  </Typography>
                }
              />
            </ListItem>
          ) : notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary" align="center">
                    No notifications
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <React.Fragment key={notification._id}>
                <NotificationItem
                  notification={notification}
                  onRead={handleRead}
                />
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>
      </Menu>
    </>
  );
};

export default NotificationsMenu; 