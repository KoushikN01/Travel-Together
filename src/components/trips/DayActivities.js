import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Stack,
  Chip,
  Box,
  Button,
} from '@mui/material';
import {
  Edit,
  Delete,
  Flight,
  Hotel,
  DirectionsWalk,
  Restaurant,
  AccessTime,
  LocationOn,
} from '@mui/icons-material';

const DayActivities = ({ day, onEdit, onDelete }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'flight':
        return <Flight />;
      case 'hotel':
        return <Hotel />;
      case 'restaurant':
        return <Restaurant />;
      case 'activity':
      default:
        return <DirectionsWalk />;
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {new Date(day.date).toLocaleDateString(undefined, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </Typography>
      
      {day.activities && day.activities.length > 0 ? (
        <List>
          {day.activities.map((activity, index) => (
            <ListItem
              key={activity._id || index}
              sx={{
                mb: 1,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    {getActivityIcon(activity.type)}
                    <Typography variant="subtitle1">
                      {activity.title}
                    </Typography>
                  </Stack>
                }
                secondary={
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {activity.location && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOn fontSize="small" />
                        <Typography variant="body2">
                          {activity.location}
                        </Typography>
                      </Stack>
                    )}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTime fontSize="small" />
                      <Typography variant="body2">
                        {formatTime(activity.startTime)}
                        {activity.duration && ` (${activity.duration})`}
                      </Typography>
                    </Stack>
                    {activity.description && (
                      <Typography variant="body2" color="text.secondary">
                        {activity.description}
                      </Typography>
                    )}
                    {activity.cost && (
                      <Typography variant="body2">
                        Cost: ₹{activity.cost}
                      </Typography>
                    )}
                    {activity.bookingReference && (
                      <Typography variant="body2">
                        Booking Ref: {activity.bookingReference}
                      </Typography>
                    )}
                  </Stack>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => onEdit(activity)}
                  sx={{ mr: 1 }}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => onDelete(activity._id)}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No activities planned for this day
        </Typography>
      )}
    </Box>
  );
};

export default DayActivities; 