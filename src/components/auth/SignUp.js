import React, { useState, useContext } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Stack,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Twitter,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import authService from '../../services/authService';

const steps = ['Account Details', 'Personal Information', 'Verification'];

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    interests: '',
    preferredDestinations: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateStep = () => {
    setError('');

    switch (activeStep) {
      case 0: // Account Details
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setError('Please fill in all fields');
          return false;
        }
        if (!validateEmail(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!validatePassword(formData.password)) {
          setError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;

      case 1: // Personal Information
        if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
          setError('Please fill in all fields');
          return false;
        }
        if (formData.firstName.trim().length < 2) {
          setError('First name must be at least 2 characters long');
          return false;
        }
        if (formData.lastName.trim().length < 2) {
          setError('Last name must be at least 2 characters long');
          return false;
        }
        if (!validatePhoneNumber(formData.phoneNumber)) {
          setError('Please enter a valid phone number');
          return false;
        }
        return true;

      case 2:
        return true;

      default:
        return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    if (error) setError('');
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (activeStep === steps.length - 1) {
      await handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Register user
      const response = await authService.register(formData);
      
      setSnackbar({
        open: true,
        message: 'Registration successful! Please check your email for verification.',
        severity: 'success'
      });

      // If email verification is not required, log in the user automatically
      if (!response.requiresVerification) {
        await login({
          email: formData.email,
          password: formData.password
        });
        navigate('/');
      } else {
        // Redirect to login page after a delay
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      }
    } catch (err) {
      const errorMessage = err.message === 'Failed to fetch'
        ? 'Unable to connect to server. Please try again later.'
        : err.message || 'Registration failed. Please try again.';
      
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = (provider) => {
    // TODO: Implement social media registration
    console.log(`Sign up with ${provider}`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={!!error && error.includes('email')}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              error={!!error && error.includes('password')}
              disabled={loading}
              helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              error={!!error && error.includes('match')}
              disabled={loading}
            />
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              error={!!error && error.includes('first name')}
              disabled={loading}
              helperText="Must be at least 2 characters long"
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              error={!!error && error.includes('last name')}
              disabled={loading}
              helperText="Must be at least 2 characters long"
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              error={!!error && error.includes('phone')}
              disabled={loading}
              helperText="Include country code (e.g., +1 for US)"
            />
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3} alignItems="center">
            <Typography variant="body1" align="center">
              Please review your information before submitting:
            </Typography>
            <Box sx={{ width: '100%', my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Email: {formData.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Name: {formData.firstName} {formData.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phone: {formData.phoneNumber}
              </Typography>
            </Box>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : activeStep === steps.length - 1 ? (
                'Create Account'
              ) : (
                'Next'
              )}
            </Button>
          </Box>

          {activeStep === 0 && (
            <>
              <Box sx={{ my: 3 }}>
                <Divider>
                  <Typography color="textSecondary" variant="body2">
                    OR
                  </Typography>
                </Divider>
              </Box>

              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google />}
                  onClick={() => handleSocialSignUp('Google')}
                >
                  Sign up with Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Facebook />}
                  onClick={() => handleSocialSignUp('Facebook')}
                >
                  Sign up with Facebook
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Twitter />}
                  onClick={() => handleSocialSignUp('Twitter')}
                >
                  Sign up with Twitter
                </Button>
              </Stack>
            </>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Button
                color="primary"
                onClick={() => navigate('/signin')}
                disabled={loading}
                sx={{ textTransform: 'none' }}
              >
                Sign In
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SignUp; 