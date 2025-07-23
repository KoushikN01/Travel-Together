import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Fade,
  Zoom,
  Tooltip,
  Divider,
  Button,
  Collapse,
  Badge,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as SmartToyIcon,
  HelpOutline as HelpOutlineIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import aiService from '../services/aiService';

const MessageBubble = styled(Paper)(({ theme, isUser }) => ({
  padding: theme.spacing(2),
  maxWidth: '80%',
  marginBottom: theme.spacing(1),
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.grey[100],
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderRadius: theme.spacing(2),
  marginLeft: isUser ? 'auto' : 0,
  marginRight: isUser ? 0 : 'auto',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const TravelAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = async () => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      text: input.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const data = await aiService.mockAskAI(input.trim(), messages);
      
      if (!data || !data.result) {
        throw new Error('Invalid response format from server');
      }

      const assistantMessage = {
        text: data.result,
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setRecentSearches(prev => {
        const newSearches = [input.trim(), ...prev.filter(s => s !== input.trim())].slice(0, 5);
        return newSearches;
      });
    } catch (error) {
      console.error('Error in handleSend:', error);
      const errorMessage = {
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const renderWelcomeScreen = () => (
    <Fade in={true} timeout={1000}>
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
        p: 2
      }}>
        <Zoom in={true} timeout={1000}>
          <SmartToyIcon sx={{ fontSize: 64, mb: 2, color: 'primary.main' }} />
        </Zoom>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to Travel Assistant!
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Your AI-powered travel companion. Ask me anything about your travel plans.
        </Typography>

        {recentSearches.length > 0 && (
          <Box sx={{ width: '100%', mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon fontSize="small" /> Recent Searches
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {recentSearches.map((search, index) => (
                <Chip
                  key={index}
                  label={search}
                  onClick={() => handleSuggestionClick(search)}
                  size="small"
                  sx={{
                    backgroundColor: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'white'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Fade>
  );

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          mb: 2, 
          p: 2, 
          overflow: 'auto',
          backgroundColor: '#f5f5f5',
          borderRadius: '12px',
          position: 'relative'
        }}
      >
        {messages.length === 0 ? renderWelcomeScreen() : (
          messages.map((message, index) => (
            <Zoom key={index} in={true} timeout={300}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: message.sender === 'user' ? 'primary.main' : 'white',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: '12px',
                    position: 'relative'
                  }}
                >
                  {message.sender === 'assistant' && (
                    <SmartToyIcon 
                      sx={{ 
                        position: 'absolute',
                        top: -20,
                        left: 0,
                        fontSize: 24,
                        color: 'primary.main',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '50%',
                        padding: '2px'
                      }} 
                    />
                  )}
                  <Typography variant="body1">{message.text}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            </Zoom>
          ))
        )}
        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, ml: 2 }}>
            <SmartToyIcon sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <CircularProgress size={12} />
              <CircularProgress size={12} sx={{ animationDelay: '0.2s' }} />
              <CircularProgress size={12} sx={{ animationDelay: '0.4s' }} />
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          variant="outlined"
          placeholder="Ask me anything about your trip..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'white',
              '&:hover': {
                '& > fieldset': { borderColor: 'primary.main' }
              }
            }
          }}
        />
        <Tooltip title="Send message">
          <span>
            <IconButton 
              color="primary" 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'grey.300',
                  color: 'grey.500'
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default TravelAssistant; 