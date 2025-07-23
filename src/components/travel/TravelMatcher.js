import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  Person,
  Favorite,
  Message,
  Close,
  Info,
  Notifications,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import travelMatcherService from '../../services/travelMatcherService';
import { useAuth } from '../../contexts/AuthContext';

const TravelMatcher = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [message, setMessage] = useState('');
  const [matchCriteria, setMatchCriteria] = useState({
    fromLocation: '',
    toLocation: '',
    travelDate: new Date(),
    preferences: {
      travelStyle: '',
      interests: [],
      budget: '',
      accommodation: '',
      languages: '',
      tripDuration: '',
      groupSize: '',
    },
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatMatch, setChatMatch] = useState(null);
  const wsRef = useRef(null);
  const chatEndRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMatchCriteria(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setMatchCriteria(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value
      }
    }));
  };

  const handleDateChange = (date) => {
    setMatchCriteria(prev => ({
      ...prev,
      travelDate: date
    }));
  };

  const handleFindMatches = async () => {
    setLoading(true);
    setError(null);
    setMessage('');
    setMatches([]);

    try {
      // Validate required fields
      if (!matchCriteria.fromLocation || !matchCriteria.toLocation || !matchCriteria.travelDate) {
        setError('Please fill in all required fields: From, To, and Travel Date');
        setLoading(false);
        return;
      }

      const response = await travelMatcherService.findMatches({
        userId: user._id,
        ...matchCriteria
      });

      setMatches(response.matches || []);
      setMessage(response.message || '');
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Failed to find travel matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
  };

  const handleCloseDialog = () => {
    setSelectedMatch(null);
  };

  const handleSendMessage = (userId) => {
    // Find the match for this userId and open chat
    const match = matches.find(m => m.participants[0].userId === userId);
    if (match) {
      handleOpenChat(match);
    } else {
      console.error('Match not found for userId:', userId);
    }
  };

  // Save filter set to localStorage
  const handleSaveFilterSet = () => {
    localStorage.setItem('travelMatcherFilterSet', JSON.stringify(matchCriteria));
    setMessage('Filter set saved!');
  };

  // Load filter set from localStorage
  const handleLoadFilterSet = () => {
    const saved = localStorage.getItem('travelMatcherFilterSet');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.travelDate) {
        parsed.travelDate = new Date(parsed.travelDate);
      }
      setMatchCriteria(parsed);
      setMessage('Filter set loaded!');
    } else {
      setMessage('No saved filter set found.');
    }
  };

  // Generate a unique chatId for two userIds
  const getChatId = (userId1, userId2) => {
    return [userId1, userId2].sort().join('_');
  };

  // Helper to check if a message already exists in an array
  const isDuplicateMessage = (arr, msg) => {
    return arr.some(
      m => m.userId === msg.userId && m.timestamp === msg.timestamp && m.content === msg.content
    );
  };

  // WebSocket connection and message handling for chat dialog
  useEffect(() => {
    if (!chatOpen || !chatMatch) return;
    const otherUserId = chatMatch.participants[0].userId;
    const chatId = getChatId(user._id, otherUserId);
    
    // Use existing WebSocket connection if available, otherwise create new one
    let ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      ws = new window.WebSocket(`ws://localhost:5001?userId=${user._id}`);
      wsRef.current = ws;
    }

    ws.onopen = () => {
      setWsConnected(true);
      ws.send(JSON.stringify({ type: 'join_direct_chat', chatId }));
      console.log('[Chat Dialog WS] Joined chat:', chatId);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('[Chat Dialog WS] Received:', data);
      if (data.type === 'direct_message' && data.chatId === chatId) {
        const newMsg = {
          userId: data.userId,
          username: data.username,
          content: data.content,
          timestamp: data.timestamp
        };
        setChatMessages((prev) => {
          if (isDuplicateMessage(prev, newMsg)) return prev;
          const newMessages = [...prev, newMsg];
          console.log('[Chat Dialog WS] Updated chatMessages. Previous count:', prev.length, 'New count:', newMessages.length);
          return newMessages;
        });
      }
    };
    
    ws.onclose = () => {
      setWsConnected(false);
      console.log('[Chat Dialog WS] Connection closed');
    };
    
    ws.onerror = (error) => {
      console.error('[Chat Dialog WS] WebSocket error:', error);
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'leave_direct_chat', chatId }));
        console.log('[Chat Dialog WS] Left chat:', chatId);
      }
    };
    // eslint-disable-next-line
  }, [chatOpen, chatMatch, user._id]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Send chat message
  const handleSendChat = () => {
    if (!chatInput.trim() || !wsRef.current || !chatMatch) return;
    
    const otherUserId = chatMatch.participants[0].userId;
    const chatId = getChatId(user._id, otherUserId);
    const message = {
      type: 'direct_message',
      chatId,
      userId: user._id,
      username: user.name,
      content: chatInput,
      timestamp: new Date().toISOString()
    };
    
    console.log('[Chat] Sending message:', message);
    
    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      setChatMessages((prev) => [...prev, {
        userId: user._id,
        username: user.name,
        content: chatInput,
        timestamp: message.timestamp
      }]);
      setChatInput('');
    } else {
      console.error('[Chat] WebSocket not connected. Ready state:', wsRef.current.readyState);
    }
  };

  // Global WebSocket for notifications and chat management
  useEffect(() => {
    if (!matches || matches.length === 0) return;
    
    const ws = new window.WebSocket(`ws://localhost:5001?userId=${user._id}`);
    
    ws.onopen = () => {
      setWsConnected(true);
      console.log('[Global WS] Connected');
      // Join all direct chats for current matches
      matches.forEach(m => {
        const chatId = getChatId(user._id, m.participants[0].userId);
        ws.send(JSON.stringify({ type: 'join_direct_chat', chatId }));
        console.log('[Global WS] Joined chat for notifications:', chatId);
      });
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('[Global WS] Received:', data);
      
      if (data.type === 'direct_message') {
        const chatId = data.chatId;
        const currentChatId = chatOpen && chatMatch ? getChatId(user._id, chatMatch.participants[0].userId) : null;
        const newMsg = {
          userId: data.userId,
          username: data.username,
          content: data.content,
          timestamp: data.timestamp
        };
        // If this is for the currently open chat, add to chat messages (and NOT to notifications)
        if (chatOpen && chatMatch && chatId === currentChatId) {
          setChatMessages((prev) => {
            if (isDuplicateMessage(prev, newMsg)) return prev;
            return [...prev, newMsg];
          });
        }
        // If not for current chat and not from current user, add to notifications (and NOT to chat)
        else if (data.userId !== user._id) {
          setNotifications((prev) => {
            // Deduplicate notifications
            if (prev.some(n => n.chatId === data.chatId && n.senderId === data.userId && n.timestamp === data.timestamp && n.message === data.content)) {
              return prev;
            }
            return [
              {
                chatId: data.chatId,
                senderId: data.userId,
                senderName: data.username,
                message: data.content,
                timestamp: data.timestamp
              },
              ...prev
            ];
          });
        }
      }
    };
    
    ws.onclose = () => {
      setWsConnected(false);
      console.log('[Global WS] Connection closed');
    };
    
    ws.onerror = (error) => {
      console.error('[Global WS] WebSocket error:', error);
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
    // eslint-disable-next-line
  }, [user._id, matches, chatOpen, chatMatch]);

  // Only clear notifications for the current chatId when opening chat
  useEffect(() => {
    if (chatOpen && chatMatch) {
      const chatId = getChatId(user._id, chatMatch.participants[0].userId);
      setNotifications((prev) => prev.filter(n => n.chatId !== chatId));
    }
    // eslint-disable-next-line
  }, [chatOpen, chatMatch, user._id]);

  // Refined handleOpenChat for match card click
  const handleOpenChat = (match) => {
    setChatMatch(match);
    const chatId = getChatId(user._id, match.participants[0].userId);
    // Merge all notifications for this chatId with existing chatMessages
    const chatNotifs = notifications.filter(n => n.chatId === chatId);
    const notifMessages = chatNotifs.map(n => ({
      userId: n.senderId,
      username: n.senderName,
      content: n.message,
      timestamp: n.timestamp
    }));
    setChatMessages(prev => {
      const all = [...prev, ...notifMessages];
      const unique = [];
      const seen = new Set();
      for (const msg of all) {
        const key = msg.userId + msg.timestamp + msg.content;
        if (!seen.has(key)) {
          unique.push(msg);
          seen.add(key);
        }
      }
      return unique.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
    setChatOpen(true);
    // Clear only notifications for this chatId
    setNotifications((prev) => prev.filter(n => n.chatId !== chatId));
  };

  // Notification bell handlers
  const handleNotifOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };
  
  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };
  
  // Refined notification click handler for clean real-time chat
  const handleNotifClick = (notif) => {
    // Find the match for this chatId
    const match = matches.find(m => getChatId(user._id, m.participants[0].userId) === notif.chatId);
    if (match) {
      // Merge all notifications for this chatId with existing chatMessages
      const chatId = notif.chatId;
      const chatNotifs = notifications.filter(n => n.chatId === chatId);
      const notifMessages = chatNotifs.map(n => ({
        userId: n.senderId,
        username: n.senderName,
        content: n.message,
        timestamp: n.timestamp
      }));
      
      setChatMessages(prev => {
        const all = [...prev, ...notifMessages];
        const unique = [];
        const seen = new Set();
        for (const msg of all) {
          const key = msg.userId + msg.timestamp + msg.content;
          if (!seen.has(key)) {
            unique.push(msg);
            seen.add(key);
          }
        }
        return unique.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
      
      setChatMatch(match);
      setChatOpen(true);
      // Clear only notifications for this chatId
      setNotifications((prev) => prev.filter(n => n.chatId !== chatId));
    }
    setNotifAnchorEl(null);
  };

  return (
    <Box sx={{ 
      height: '100%',
      overflow: 'auto',
      backgroundImage: 'url(/images1recomendtions/travel_matcher.jpeg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 0
      }
    }}>
      <Box sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ 
          color: '#1a237e', 
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          Find Your Travel Companion
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{
          color: '#303f9f',
          fontWeight: 'medium',
          mb: 4
        }}>
          Find travel companions with similar destinations and preferences
        </Typography>

        <Card sx={{ 
          mb: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 2
        }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="From"
                  name="fromLocation"
                  value={matchCriteria.fromLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., New York"
                  error={!matchCriteria.fromLocation && error}
                  helperText={!matchCriteria.fromLocation && error ? 'From location is required' : ''}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="To"
                  name="toLocation"
                  value={matchCriteria.toLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., London"
                  error={!matchCriteria.toLocation && error}
                  helperText={!matchCriteria.toLocation && error ? 'To location is required' : ''}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Travel Date"
                    value={matchCriteria.travelDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        error={!matchCriteria.travelDate && error}
                        helperText={!matchCriteria.travelDate && error ? 'Travel date is required' : ''}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 1)',
                            },
                          }
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Travel Style"
                  name="travelStyle"
                  value={matchCriteria.preferences.travelStyle}
                  onChange={handlePreferenceChange}
                  placeholder="e.g., Adventure, Relaxation"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleFindMatches}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  fullWidth
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  Find Travel Matches
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Languages Spoken"
                  name="languages"
                  value={matchCriteria.preferences.languages}
                  onChange={handlePreferenceChange}
                  placeholder="e.g., English, Spanish"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Trip Duration (days)"
                  name="tripDuration"
                  type="number"
                  value={matchCriteria.preferences.tripDuration}
                  onChange={handlePreferenceChange}
                  placeholder="e.g., 7"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Group Size"
                  name="groupSize"
                  type="number"
                  value={matchCriteria.preferences.groupSize}
                  onChange={handlePreferenceChange}
                  placeholder="e.g., 4"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" color="primary" onClick={handleSaveFilterSet} sx={{ mr: 2 }}>
                  Save Filter Set
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleLoadFilterSet}>
                  Load Filter Set
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            {error}
          </Alert>
        )}

        {message && !error && (
          <Alert severity={matches.length > 0 ? "success" : "info"} sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            {message}
          </Alert>
        )}

        {matches.length > 0 && (
          <Grid container spacing={3}>
            {matches.map((match, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => handleMatchClick(match)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={match.participants[0].avatar}
                        sx={{ width: 56, height: 56, mr: 2, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                          {match.participants[0].name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Compatibility Score: {match.compatibilityScore}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ mr: 1, color: '#303f9f' }} />
                      <Typography>
                        {match.tripDetails.route.from} → {match.tripDetails.route.to}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday sx={{ mr: 1, color: '#303f9f' }} />
                      <Typography>
                        {new Date(match.tripDetails.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                        Common Interests:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {match.participants[0].preferences.interests?.map((interest, i) => (
                          <Chip
                            key={i}
                            label={interest}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 1)',
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Tooltip title="Chat with this user">
                        <IconButton color="primary" onClick={(e) => { e.stopPropagation(); handleOpenChat(match); }}>
                          <Message />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Match Details Dialog */}
        <Dialog
          open={Boolean(selectedMatch)}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedMatch && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Match Details</Typography>
                  <IconButton onClick={handleCloseDialog}>
                    <Close />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        src={selectedMatch.participants[0].avatar}
                        sx={{ width: 80, height: 80, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h5">
                          {selectedMatch.participants[0].name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating
                            value={selectedMatch.compatibilityScore / 20}
                            readOnly
                            precision={0.5}
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {selectedMatch.compatibilityScore}% Match
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Trip Details
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography>
                          {selectedMatch.tripDetails.route.from} → {selectedMatch.tripDetails.route.to}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography>
                          {new Date(selectedMatch.tripDetails.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Compatibility Analysis
                    </Typography>
                    <Typography variant="body1">
                      {selectedMatch.analysis}
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  startIcon={<Message />}
                  onClick={() => handleSendMessage(selectedMatch.participants[0].userId)}
                >
                  Send Message
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Favorite />}
                  color="primary"
                >
                  Connect
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
        {/* Chat Dialog */}
        <Dialog open={chatOpen} onClose={() => setChatOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Chat with {chatMatch?.participants[0]?.name}
            <IconButton onClick={() => setChatOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ minHeight: 300, maxHeight: 400, overflowY: 'auto' }}>
            {chatMessages.map((msg, i) => (
              <Box key={i} sx={{ mb: 1, display: 'flex', flexDirection: msg.userId === user._id ? 'row-reverse' : 'row', alignItems: 'center' }}>
                <Avatar sx={{ ml: msg.userId === user._id ? 2 : 0, mr: msg.userId !== user._id ? 2 : 0 }}>
                  {msg.username?.[0]}
                </Avatar>
                <Box sx={{ bgcolor: msg.userId === user._id ? 'primary.main' : 'grey.200', color: msg.userId === user._id ? 'white' : 'black', borderRadius: 2, p: 1, minWidth: 60 }}>
                  <div>{msg.content}</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </Box>
              </Box>
            ))}
            <div ref={chatEndRef} />
          </DialogContent>
          <DialogActions>
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
            />
            <Button onClick={handleSendChat} variant="contained" color="primary" disabled={!chatInput.trim() || !wsConnected}>
              Send
            </Button>
            <Button 
              onClick={() => {
                setChatInput('Test message from ' + user.name + ' at ' + new Date().toLocaleTimeString());
              }} 
              variant="outlined" 
              size="small"
              disabled={!wsConnected}
            >
              Test
            </Button>
          </DialogActions>
        </Dialog>
        {/* Connection Status and Notification Bell */}
        <Box sx={{ position: 'absolute', top: 16, right: 24, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={`WebSocket: ${wsConnected ? 'Connected' : 'Disconnected'}`}
            color={wsConnected ? 'success' : 'error'}
            size="small"
            variant="outlined"
          />
          <IconButton color="primary" onClick={handleNotifOpen}>
            <Badge badgeContent={notifications.length} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleNotifClose}
          >
            {notifications.length === 0 && (
              <MenuItem disabled>No new messages</MenuItem>
            )}
            {notifications.map((notif, i) => (
              <MenuItem key={i} onClick={() => handleNotifClick(notif)}>
                <ListItemAvatar>
                  <Avatar>{notif.senderName?.[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notif.senderName}
                  secondary={notif.message.length > 30 ? notif.message.slice(0, 30) + '...' : notif.message}
                />
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default TravelMatcher; 