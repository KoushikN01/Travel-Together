import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Fab,
  Drawer,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close,
  Send,
  SupportAgent,
  Chat as ChatIcon,
  Delete,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ChatSupport = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const [options, setOptions] = useState([
    { id: 1, text: "Money related problems", response: "For money related issues, please contact our finance department at finance@example.com." },
    { id: 2, text: "How to book travel", response: "To book travel, visit our homepage and click on 'Book Now'. Follow the prompts to complete your booking." },
    { id: 3, text: "Customer help", response: "For general customer support, please call our helpline at 1-800-123-4567." },
    { id: 4, text: "Advanced booking options", response: "Advanced booking options include group bookings, custom itineraries, and premium services. Please contact our sales team at sales@example.com." },
    { id: 5, text: "Contact Customer Care", response: "Our customer care team is available 24/7. You can reach us at:\n📞 Phone: 1-800-HELP-NOW\n📧 Email: care@travelapp.com\n💬 Live Chat: Available on our website\n⏰ Hours: 24/7" }
  ]);

  const clearChat = () => {
    setMessages([]);
    setMessage('');
    setError('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOptionClick = (option) => {
    const userMessage = {
      id: Date.now(),
      text: option.text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    const supportMessage = {
      id: Date.now() + 1,
      text: option.response,
      sender: 'support',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, supportMessage]);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      const userMessage = {
        id: Date.now(),
        text: message,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setMessage('');

      const supportMessage = {
        id: Date.now() + 1,
        text: "Please select one of the options below for assistance.",
        sender: 'support',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, supportMessage]);
      setLoading(false);
    } catch (err) {
      setError('Failed to send message');
      setLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="chat support"
        sx={{ position: 'fixed', bottom: 20, right: 20 }}
        onClick={toggleChat}
      >
        <ChatIcon />
      </Fab>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <Box sx={{ width: 320, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
            <SupportAgent sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Chat Support</Typography>
            <IconButton color="inherit" onClick={clearChat} sx={{ mr: 1 }}>
              <Delete />
            </IconButton>
            <IconButton color="inherit" onClick={() => setIsOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            {messages.map((msg) => (
              <ListItem
                key={msg.id}
                sx={{
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '80%',
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.100',
                    color: msg.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    p: 1,
                  }}
                >
                  <Typography variant="body1">{msg.text}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Typography>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>

          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {options.map((option) => (
                <Button
                  key={option.id}
                  variant="outlined"
                  size="small"
                  onClick={() => handleOptionClick(option)}
                  sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '120px' }}
                >
                  {option.text}
                </Button>
              ))}
            </Box>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              InputProps={{
                endAdornment: (
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!message.trim() || loading}
                    sx={{ ml: 1 }}
                  >
                    {loading ? <CircularProgress size={24} /> : <Send />}
                  </Button>
                ),
              }}
            />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default ChatSupport; 