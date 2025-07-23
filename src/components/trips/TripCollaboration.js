import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { tripService } from '../../services/tripService';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import { FaPaperPlane, FaUserPlus, FaVoteYea, FaCheck, FaTimes } from 'react-icons/fa';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TripCollaboration = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [trip, setTrip] = useState(null);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  console.log('Current authenticated user (from useAuth):', user);

  useEffect(() => {
    if (!tripId) {
      setError('Trip ID is missing');
      toast.error('Invalid trip ID');
      navigate('/trips');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      toast.error('Please log in to access collaboration features');
      navigate('/login');
      return;
    }

    loadTripData();
    
    // Initialize WebSocket connection
    const initializeWebSocket = () => {
      try {
        // Use correct WebSocket URL and include userId as query param
        const wsUrl = process.env.NODE_ENV === 'production'
          ? `wss://${window.location.host}?userId=${user._id}`
          : `ws://localhost:5001?userId=${user._id}`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('WebSocket connected');
          setWsConnected(true);
          
          // Send subscription message when connection is OPEN
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const joinMessage = {
              type: 'join_trip',
              tripId: tripId,
              userId: user._id
            };
            wsRef.current.send(JSON.stringify(joinMessage));
            toast.success('Connected to chat server');
          }
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket message:', data);
            
            if (data.type === 'message') {
              setMessages(prevMessages => {
                // Prevent duplicates by checking timestamp and content
                const exists = prevMessages.some(
                  msg =>
                    msg.userId === data.userId &&
                    msg.content === data.content &&
                    msg.timestamp === data.timestamp
                );
                if (exists) return prevMessages;
                return [
                  ...prevMessages,
                  {
                    userId: data.userId,
                    username: data.username,
                    content: data.content,
                    timestamp: data.timestamp
                  }
                ];
              });
              // Scroll to bottom when new message arrives
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            } else if (data.type === 'activity') {
              // Only add activity if it's not from the current user (to avoid duplicates)
              if (data.userId !== user._id) {
                setActivities(prevActivities => {
                  const newActivities = [...prevActivities, {
                    userId: data.userId,
                    username: data.username,
                    content: data.content,
                    votes: data.votes || [],
                    timestamp: data.timestamp
                  }];
                  console.log('Updated activities:', newActivities);
                  return newActivities;
                });
              }
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setWsConnected(false);
          toast.error('Chat connection error. Some features may be limited.');
        };

        wsRef.current.onclose = () => {
          console.log('WebSocket disconnected');
          setWsConnected(false);
          toast.warning('Chat disconnected. Attempting to reconnect...');
          // Attempt to reconnect after 5 seconds
          setTimeout(initializeWebSocket, 5000);
        };
      } catch (err) {
        console.error('Error initializing WebSocket:', err);
        setWsConnected(false);
        toast.error('Failed to connect to chat server');
      }
    };

    initializeWebSocket();

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const leaveMessage = {
          type: 'leave_trip',
          tripId: tripId,
          userId: user._id
        };
        wsRef.current.send(JSON.stringify(leaveMessage));
        wsRef.current.close();
      }
    };
  }, [tripId, navigate, user]);

  const loadTripData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== LOADING TRIP DATA ===');
      console.log('Trip ID:', tripId);
      console.log('User:', user);
      console.log('User ID:', user?._id);
      console.log('User email:', user?.email);
      
      const tripData = await tripService.getTripById(tripId);
      
      console.log('Trip data loaded in TripCollaboration:', tripData);

      if (!tripData) {
        throw new Error('Trip not found');
      }

      console.log('Trip creator:', tripData.creator);
      console.log('Trip collaborators:', tripData.collaborators);
      console.log('Is user creator?', tripData.creator?._id === user?._id);
      console.log('Is user collaborator?', tripData.collaborators?.some(c => c.user._id === user?._id));
      
      // Load existing messages
      if (tripData.messages && Array.isArray(tripData.messages)) {
        console.log('=== LOADING MESSAGES DEBUG ===');
        console.log('Number of messages loaded:', tripData.messages.length);
        console.log('Messages from backend:', tripData.messages);
        setMessages(tripData.messages.map(msg => ({
          userId: msg.sender?._id || msg.sender,
          username: msg.senderName || msg.sender?.firstName || 'Unknown User',
          content: msg.content,
          timestamp: msg.timestamp
        })));
        console.log('Processed messages for UI:', tripData.messages.map(msg => ({
          userId: msg.sender?._id || msg.sender,
          username: msg.senderName || msg.sender?.firstName || 'Unknown User',
          content: msg.content,
          timestamp: msg.timestamp
        })));
      } else {
        console.log('No messages found in trip data or messages is not an array');
      }
      
      // Correctly extract activities from the itinerary array
      const allActivities = tripData.itinerary ? 
        tripData.itinerary.reduce((acc, day) => acc.concat(day.activities || []), []) : [];

      setActivities(allActivities.map(activity => ({
        ...activity,
        votes: activity.votes ? activity.votes.filter(vote => vote && vote.user) : []
      })) || []);
      
      const loadedCollaborators = tripData.collaborators || [];
      console.log('Collaborators loaded:', loadedCollaborators);
      setCollaborators(loadedCollaborators);
      setTrip(tripData);
      
      // Scroll to bottom of messages
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Error loading trip data in TripCollaboration:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        user: user,
        tripId: tripId
      });
      
      let errorMessage = 'Failed to load trip data';
      if (err.response?.status === 403) {
        errorMessage = 'Unauthorized access: You do not have permission to view this trip';
      } else if (err.response?.status === 404) {
        errorMessage = 'Trip not found';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (err.message === 'Trip not found' || err.response?.status === 404) {
        navigate('/trips');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    console.log('=== SENDING MESSAGE DEBUG ===');
    console.log('User ID:', user._id);
    console.log('User Email:', user.email);
    console.log('User Name:', user.firstName, user.lastName);
    console.log('Trip ID:', tripId);
    console.log('Message content:', newMessage.trim());
    console.log('Is user trip creator?', trip?.creator?._id === user._id);
    console.log('Is user collaborator?', trip?.collaborators?.some(c => c.user._id === user._id));

    const message = {
      type: 'message',
      tripId,
      userId: user._id,
      username: user.username,
      content: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Add message to local state immediately
    setMessages(prevMessages => [...prevMessages, message]);

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        console.log('Sending message via WebSocket:', message);
        wsRef.current.send(JSON.stringify(message));
        console.log('✅ Message sent via WebSocket successfully');
      } catch (error) {
        console.error('❌ Failed to send message via WebSocket:', error);
        toast.error('Failed to send message. Please try again.');
      }
    } else {
      console.error('❌ WebSocket not connected. Ready state:', wsRef.current?.readyState);
    }

    // Save to backend for persistence
    try {
      console.log('Saving message to backend...');
      const savedMessage = await tripService.saveChatMessage(tripId, newMessage.trim());
      console.log('✅ Message saved to backend successfully:', savedMessage);
    } catch (error) {
      console.error('❌ Failed to save message to backend:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Message sent but not saved. Please try again.');
    }

    setNewMessage('');
  };

  const proposeActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.trim()) return;

    console.log('=== PROPOSING ACTIVITY DEBUG ===');
    console.log('User ID:', user._id);
    console.log('Trip ID:', tripId);
    console.log('Activity content:', newActivity.trim());

    const activity = {
      type: 'activity',
      tripId,
      userId: user._id,
      username: user.username,
      content: newActivity.trim(),
      votes: [],
      timestamp: new Date().toISOString()
    };

    // Add activity to local state immediately
    setActivities(prevActivities => [...prevActivities, activity]);

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        console.log('Sending activity via WebSocket:', activity);
        wsRef.current.send(JSON.stringify(activity));
      } catch (error) {
        console.error('WebSocket send error for activity:', error);
        toast.error('Failed to propose activity. Please try again.');
      }
    } else {
      console.error('WebSocket not connected for activity. Ready state:', wsRef.current?.readyState);
    }

    // TODO: Add backend saving for activities (similar to chat messages)
    // For now, activities are only real-time, not persisted
    console.log('Activity sent via WebSocket only (not saved to backend yet)');

    setNewActivity('');
  };

  const voteOnActivity = async (activityId, vote) => {
    try {
      const response = await tripService.voteOnActivity(tripId, activityId, vote);
      // Update state with the updated activity received from the server
      const updatedActivities = activities.map(activity => {
        if (activity._id === activityId) {
          return {
            ...activity,
            // Ensure votes array is immutable and properly updated
            votes: activity.votes.filter(v => v.user && v.user.toString() !== user._id).concat({ user: user._id, vote })
          };
        }
        return activity;
      });
      setActivities(updatedActivities);
      toast.success('Vote cast successfully!');
    } catch (err) {
      console.error('Error voting on activity:', err);
      toast.error(err.message || 'Failed to vote on activity');
    }
  };

  const inviteCollaborator = async (e) => {
    e.preventDefault();
    if (!newCollaborator.trim()) return;

    try {
      const response = await tripService.inviteCollaborator(tripId, newCollaborator);
      // Update state with the newly added collaborator from the server response
      setCollaborators(prev => [...prev, response]);
      setNewCollaborator('');
      toast.success('Invitation sent successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to send invitation');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, py: 4, position: 'relative', minHeight: '100vh' }}>
      {/* Background image and gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(30,30,60,0.55),rgba(30,30,60,0.55)), url(/images1recomendtions/collo2.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 1
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Debug Info */}
        <Alert severity="info" sx={{ mb: 2 }}>
          Component State: Loading={loading} | Error={error ? 'Yes' : 'No'} | User={user?.email} | Trip={tripId} | Messages={messages.length} | Activities={activities.length}
        </Alert>
        
        {/* Header Section */}
        <Paper elevation={6} sx={{ mb: 4, p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <EmojiPeopleIcon color="primary" sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              Collaboration Room
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {trip?.title ? `Trip: ${trip.title}` : 'Collaborate, chat, and plan your adventure!'}
            </Typography>
          </Box>
        </Paper>
        {/* Back Button below header */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/trips')}
            sx={{ borderRadius: 2, fontWeight: 600, background: '#1976d2', color: '#fff', '&:hover': { background: '#115293' } }}
          >
            Back to My Trips
          </Button>
        </Box>

        {/* Collaborators Avatars Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, overflowX: 'auto', pb: 1 }}>
          {collaborators.map((collaborator) => (
            <Tooltip key={collaborator._id} title={`${collaborator.user?.firstName || ''} ${collaborator.user?.lastName || ''} (${collaborator.role})`}>
              <Avatar
                sx={{ width: 56, height: 56, border: collaborator.role === 'admin' ? '2px solid #1976d2' : '2px solid #aaa', boxShadow: 2 }}
                src={authService.getAvatarUrl(collaborator.user?.avatar)}
              >
                {collaborator.user?.firstName?.[0] || 'U'}
              </Avatar>
            </Tooltip>
          ))}
        </Box>

        {/* Alerts */}
        {!wsConnected && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Disconnected from chat server. Some features may be limited. Attempting to reconnect...
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Debug Info */}
        <Alert severity="info" sx={{ mb: 2 }}>
          WebSocket Status: {wsConnected ? 'Connected' : 'Disconnected'} | 
          User: {user?.email} | 
          Trip: {tripId} | 
          Messages: {messages.length} | 
          Activities: {activities.length}
        </Alert>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
            <CircularProgress />
          </Box>
        ) : null}

        {/* Main Collaboration Interface - Always Visible */}
        <Alert severity="success" sx={{ mb: 2 }}>
          MAIN COLLABORATION INTERFACE SHOULD BE VISIBLE BELOW
        </Alert>
        
        <Grid container spacing={3}>
          {/* Collaborators Section */}
          <Grid item xs={12} md={4}>
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.92)', height: '100%', display: 'flex', flexDirection: 'column', gap: 2, border: '2px solid red' }}>
              <Typography variant="h6" gutterBottom fontWeight={600} color="red">
                COLLABORATORS SECTION
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Loading: {loading ? 'Yes' : 'No'} | Collaborators: {collaborators.length} | User: {user?.email}
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <List sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                    {collaborators.map((collaborator) => (
                      <ListItem key={collaborator._id} sx={{ borderRadius: 2, mb: 1, background: 'rgba(240,240,255,0.7)' }}>
                        <ListItemAvatar>
                          <Avatar src={authService.getAvatarUrl(collaborator.user?.avatar)}>
                            {collaborator.user?.firstName?.[0] || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography fontWeight={600}>{`${collaborator.user?.firstName || ''} ${collaborator.user?.lastName || ''}`}</Typography>}
                          secondary={
                            <Box>
                              <Chip
                                size="small"
                                label={collaborator.role}
                                color={collaborator.role === 'admin' ? 'primary' : 'default'}
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                size="small"
                                label={collaborator.status}
                                color={collaborator.status === 'active' ? 'success' : 'warning'}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Invite Input Section - User: {user?._id} | Trip Creator: {trip?.creator?._id} | Is Creator: {user && trip?.creator?._id?.toString() === user._id ? 'Yes' : 'No'}
                  </Alert>
                  {user && trip?.creator?._id?.toString() === user._id ? (
                    <Box component="form" onSubmit={inviteCollaborator} sx={{ mt: 2, background: 'rgba(245,245,255,0.7)', p: 2, borderRadius: 2, border: '2px solid green' }}>
                      <Typography variant="subtitle2" color="green" gutterBottom>
                        INVITE COLLABORATOR INPUT (Should be visible for trip creator)
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        label="Invite by email"
                        value={newCollaborator}
                        onChange={(e) => setNewCollaborator(e.target.value)}
                        sx={{ mb: 1 }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<FaUserPlus />}
                        fullWidth
                      >
                        Invite
                      </Button>
                    </Box>
                  ) : (
                    <Alert severity="warning">
                      You are not the trip creator, so you cannot invite collaborators
                    </Alert>
                  )}
                </>
              )}
            </Paper>
          </Grid>

          {/* Activities Section as Timeline */}
          <Grid item xs={12} md={4}>
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.92)', height: '100%', display: 'flex', flexDirection: 'column', gap: 2, border: '2px solid blue' }}>
              <Typography variant="h6" gutterBottom fontWeight={600} color="blue">
                ACTIVITIES SECTION
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Loading: {loading ? 'Yes' : 'No'} | Activities: {activities.length}
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2, maxHeight: '350px' }}>
                    <Stepper orientation="vertical" activeStep={-1} nonLinear>
                      {activities.map((activity, index) => (
                        <Step key={index} completed={false}>
                          <StepLabel icon={<FaVoteYea color="#1976d2" />}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography fontWeight={600}>{activity.username || 'Unknown User'}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(activity.timestamp).toLocaleString()}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {activity.content}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                              <Chip
                                icon={<FaCheck />}
                                label={`${activity.votes.filter(v => v && v.vote).length} Yes`}
                                onClick={() => voteOnActivity(activity._id, true)}
                                color="success"
                                variant="outlined"
                                sx={{ cursor: 'pointer' }}
                              />
                              <Chip
                                icon={<FaTimes />}
                                label={`${activity.votes.filter(v => v && !v.vote).length} No`}
                                onClick={() => voteOnActivity(activity._id, false)}
                                color="error"
                                variant="outlined"
                                sx={{ cursor: 'pointer' }}
                              />
                            </Box>
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    ACTIVITY PROPOSAL INPUT (Should be visible for all collaborators)
                  </Alert>
                  <Box component="form" onSubmit={proposeActivity} sx={{ display: 'flex', gap: 1, background: 'rgba(245,245,255,0.7)', p: 1.5, borderRadius: 2, border: '2px solid green' }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      placeholder="Propose an activity..."
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={!newActivity.trim()}
                      startIcon={<FaVoteYea />}
                    >
                      Propose
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          {/* Chat Section with Bubbles */}
          <Grid item xs={12} md={4}>
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.92)', height: '100%', display: 'flex', flexDirection: 'column', gap: 2, border: '2px solid purple' }}>
              <Typography variant="h6" gutterBottom fontWeight={600} color="purple">
                CHAT SECTION
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Loading: {loading ? 'Yes' : 'No'} | Messages: {messages.length} | WS: {wsConnected ? 'Connected' : 'Disconnected'}
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2, maxHeight: '350px', pr: 1 }}>
                    {messages.map((message, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          flexDirection: message.userId === user?._id ? 'row-reverse' : 'row',
                          alignItems: 'flex-end',
                          mb: 1
                        }}
                      >
                        <Tooltip title={message.username} placement={message.userId === user?._id ? 'left' : 'right'}>
                          <Avatar sx={{ width: 32, height: 32, ml: message.userId === user?._id ? 1 : 0, mr: message.userId === user?._id ? 0 : 1 }}>
                            {message.username?.[0] || 'U'}
                          </Avatar>
                        </Tooltip>
                        <Paper
                          elevation={2}
                          sx={{
                            p: 1.2,
                            maxWidth: '70%',
                            backgroundColor: message.userId === user?._id ? 'primary.light' : 'grey.100',
                            color: message.userId === user?._id ? 'white' : 'black',
                            borderRadius: message.userId === user?._id ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            ml: message.userId === user?._id ? 0 : 1,
                            mr: message.userId === user?._id ? 1 : 0,
                            boxShadow: 1
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {message.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: message.userId === user?._id ? 'right' : 'left' }}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}
                    <div ref={messagesEndRef} />
                  </Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    CHAT MESSAGE INPUT (Should be visible for all collaborators)
                  </Alert>
                  <Box component="form" onSubmit={sendMessage} sx={{ display: 'flex', gap: 1, background: 'rgba(245,245,255,0.7)', p: 1.5, borderRadius: 2, border: '2px solid green' }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={!newMessage.trim()}
                      startIcon={<FaPaperPlane />}
                    >
                      Send
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default TripCollaboration; 