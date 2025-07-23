import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Tooltip
} from '@mui/material';
import adminService from '../../services/adminService';

const TripsList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await adminService.getTrips();
        setTrips(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleApproveTrip = async (tripId) => {
    try {
      await adminService.approveTrip(tripId);
      setTrips(trips.map(trip => trip.id === tripId ? { ...trip, status: 'confirmed' } : trip));
    } catch (err) {
      alert('Failed to approve trip');
    }
  };

  const handleRejectTrip = async (tripId) => {
    try {
      await adminService.rejectTrip(tripId);
      setTrips(trips.map(trip => trip.id === tripId ? { ...trip, status: 'rejected' } : trip));
    } catch (err) {
      alert('Failed to reject trip');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Error: {error}
      </Typography>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', mt: 3 }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Trip Management
      </Typography>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Creator</TableCell>
              <TableCell>Date Range</TableCell>
              <TableCell>Destinations</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trips.map((trip) => (
              <TableRow key={trip.id} hover>
                <TableCell>{trip.title}</TableCell>
                <TableCell>
                  <Tooltip title={trip.creator.email}>
                    <span>{trip.creator.name}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {`${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`}
                </TableCell>
                <TableCell>
                  {trip.destinations.map((dest, index) => (
                    <Chip 
                      key={index}
                      label={dest}
                      size="small"
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={trip.status}
                    color={trip.status === 'upcoming' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Number of activities and collaborators">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {`${trip.activities} activities`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {`${trip.collaborators} collaborators`}
                      </Typography>
                    </Box>
                  </Tooltip>
                  {/* Approve/Reject buttons for pending trips */}
                  {trip.status === 'pending' && (
                    <Box sx={{ mt: 1 }}>
                      <button
                        onClick={() => handleApproveTrip(trip.id)}
                        style={{ color: 'green', marginRight: 8, cursor: 'pointer', border: 'none', background: 'none' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectTrip(trip.id)}
                        style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}
                      >
                        Reject
                      </button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TripsList; 