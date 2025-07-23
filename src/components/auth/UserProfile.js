import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Chip,
  IconButton,
  Divider,
  Stack,
  Alert,
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  LocationOn,
  Language,
  Interests,
  Save,
  Cancel,
} from '@mui/icons-material';
import authService from '../../services/authService';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1 234 567 8900',
    location: 'New York, USA',
    bio: 'Passionate traveler exploring the world one destination at a time.',
    interests: ['Adventure', 'Culture', 'Photography', 'Food'],
    preferredDestinations: ['Europe', 'Asia', 'South America'],
    languages: ['English', 'Spanish'],
    avatar: 'https://source.unsplash.com/100x100/?portrait',
  });

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      // TODO: Implement actual profile update logic
      console.log('Saving profile:', profile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // TODO: Reset form to original values
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // TODO: Implement actual image upload logic
      console.log('Uploading image:', file);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h4">Profile</Typography>
            {!isEditing ? (
              <Button
                startIcon={<Edit />}
                variant="contained"
                onClick={() => setIsEditing(true)}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
                  }
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <Stack direction="row" spacing={2}>
                <Button
                  startIcon={<Cancel />}
                  variant="outlined"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  startIcon={<Save />}
                  variant="contained"
                  onClick={handleSave}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
                    }
                  }}
                >
                  Save Changes
                </Button>
              </Stack>
            )}
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={authService.getAvatarUrl(profile.avatar)}
                    sx={{ width: 150, height: 150, mb: 2 }}
                  />
                  {isEditing && (
                    <IconButton
                      color="primary"
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 20,
                        right: 0,
                        bgcolor: 'white',
                        '&:hover': { bgcolor: 'grey.100' },
                      }}
                    >
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={handleImageUpload}
                      />
                      <PhotoCamera />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="h6">
                  {profile.firstName} {profile.lastName}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {profile.email}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                />

                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <LocationOn color="action" sx={{ mr: 1 }} />,
                  }}
                />

                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  multiline
                  rows={3}
                />

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Interests sx={{ mr: 1 }} /> Travel Interests
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile.interests.map((interest) => (
                      <Chip
                        key={interest}
                        label={interest}
                        onDelete={isEditing ? () => {} : undefined}
                      />
                    ))}
                    {isEditing && (
                      <Chip
                        label="+ Add Interest"
                        onClick={() => {}}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Language sx={{ mr: 1 }} /> Languages
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile.languages.map((language) => (
                      <Chip
                        key={language}
                        label={language}
                        onDelete={isEditing ? () => {} : undefined}
                      />
                    ))}
                    {isEditing && (
                      <Chip
                        label="+ Add Language"
                        onClick={() => {}}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserProfile; 