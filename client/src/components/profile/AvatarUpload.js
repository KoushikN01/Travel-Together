import React, { useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import authService from '../../services/authService';

const AvatarUpload = ({ currentAvatar, onAvatarUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size should be less than 5MB');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.uploadAvatar(file);
      if (onAvatarUpdate) {
        onAvatarUpdate(response.user.avatar);
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Avatar
        src={authService.getAvatarUrl(currentAvatar)}
        sx={{
          width: 120,
          height: 120,
          border: '2px solid #fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      />
      
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="avatar-upload"
        type="file"
        onChange={handleFileChange}
        disabled={loading}
      />
      
      <label htmlFor="avatar-upload">
        <IconButton
          component="span"
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <PhotoCamera />
          )}
        </IconButton>
      </label>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default AvatarUpload; 