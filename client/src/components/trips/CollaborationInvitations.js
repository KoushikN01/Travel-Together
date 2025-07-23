import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { tripService } from '../../services/tripService';
import { toast } from 'react-toastify';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const CollaborationInvitations = () => {
  console.log('CollaborationInvitations component rendering...');
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('CollaborationInvitations mounted');
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      console.log('Loading invitations...');
      const pendingInvitations = await tripService.getPendingInvitations();
      console.log('Received invitations:', pendingInvitations);
      setInvitations(pendingInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (tripId, collaboratorId) => {
    try {
      console.log('Accepting invitation:', { tripId, collaboratorId });
      await tripService.acceptInvitation(tripId, collaboratorId);
      toast.success('Invitation accepted');
      loadInvitations();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    }
  };

  const handleReject = async (tripId, collaboratorId) => {
    try {
      console.log('Rejecting invitation:', { tripId, collaboratorId });
      await tripService.rejectInvitation(tripId, collaboratorId);
      toast.success('Invitation rejected');
      loadInvitations();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error('Failed to reject invitation');
    }
  };

  console.log('Current invitations state:', invitations);

  // Always render the component, showing loading, no invitations, or the list
  return (
    <Paper sx={{ p: 2, mb: 4, border: invitations.length === 0 ? '2px dashed grey' : 'none' }}>
      <Typography variant="h6" gutterBottom>
        Collaboration Invitations
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      ) : invitations.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No pending invitations
        </Typography>
      ) : (
        <List>
          {invitations.map((invitation) => (
            <React.Fragment key={invitation.tripId}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    {invitation.creator?.firstName?.[0] || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`Invitation to collaborate on "${invitation.tripTitle}"`}
                  secondary={`From: ${invitation.creator?.firstName} ${invitation.creator?.lastName}`}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => handleAccept(invitation.tripId, invitation.collaboratorId)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => handleReject(invitation.tripId, invitation.collaboratorId)}
                  >
                    Reject
                  </Button>
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default CollaborationInvitations; 