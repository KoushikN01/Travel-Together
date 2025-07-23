import React, { useState, useContext, useEffect } from 'react';
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
  CircularProgress,
  Snackbar,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Twitter,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../../services/authService';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Check if user is already logged in
  useEffect(() => {
    const isAuth = authService.isAuthenticated();
    if (isAuth) {
      const user = authService.getUser();
      if (user && !location.state?.from) {
        navigate('/');
      }
    }
  }, [navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      
      if (response && response.user) {
        await login(response);
        
        const redirectPath = localStorage.getItem('redirectAfterSignIn');
        
        if (redirectPath) {
          localStorage.removeItem('redirectAfterSignIn');
          navigate(redirectPath);
        } else {
          navigate('/');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in');
      setSnackbar({
        open: true,
        message: err.message || 'Failed to sign in',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('Google login response:', credentialResponse);
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }
      
      // Add a small delay to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await authService.handleGoogleLogin(credentialResponse);
      console.log('Server response:', response);
      
      if (!response || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      await login(response);
      
      const redirectPath = localStorage.getItem('redirectAfterSignIn');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterSignIn');
        navigate(redirectPath);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Google login error:', err);
      let errorMessage = 'Failed to sign in with Google';
      
      if (err.message.includes('popup_closed_by_user')) {
        errorMessage = 'Sign-in was cancelled';
      } else if (err.message.includes('access_denied')) {
        errorMessage = 'Access was denied';
      } else if (err.message.includes('immediate_failed')) {
        errorMessage = 'Sign-in failed. Please try again';
      }
      
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
    let errorMessage = 'Failed to sign in with Google';
    
    if (error.error === 'popup_closed_by_user') {
      errorMessage = 'Sign-in was cancelled';
    } else if (error.error === 'access_denied') {
      errorMessage = 'Access was denied';
    } else if (error.error === 'immediate_failed') {
      errorMessage = 'Sign-in failed. Please try again';
    }
    
    setError(errorMessage);
    setSnackbar({
      open: true,
      message: errorMessage,
      severity: 'error'
    });
  };

  const handleSocialSignIn = async (provider) => {
    try {
      const response = await authService.socialSignIn(provider);
      await login(response.data);
      navigate('/');
    } catch (err) {
      setError(`Failed to sign in with ${provider}`);
      setSnackbar({
        open: true,
        message: err.message || `Failed to sign in with ${provider}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <video
        autoPlay
        muted
        loop
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
        }}
      >
        <source src="/videos/travel-background.mp4" type="video/mp4" />
      </video>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          zIndex: 0,
        }}
      />
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ mt: 8, mb: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(3px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="h4" align="center" gutterBottom>
              Sign In
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={!!error && error.includes('email')}
                  autoComplete="email"
                  inputProps={{
                    'data-testid': 'email-input'
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={!!error && error.includes('password')}
                  autoComplete="current-password"
                  inputProps={{
                    'data-testid': 'password-input'
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>

                <Box sx={{ mt: 2, mb: 2, textAlign: 'right' }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    color="primary"
                  >
                    Forgot password?
                  </Link>
                </Box>
              </Stack>
            </form>

            <Box sx={{ my: 3 }}>
              <Divider>
                <Typography color="textSecondary" variant="body2">
                  OR
                </Typography>
              </Divider>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                shape="pill"
                size="large"
                text="continue_with"
                width="300px"
                flow="implicit"
                popupType="popup"
                context="signin"
                prompt_parent_id="google-signin-button"
                ux_mode="popup"
                auto_select={false}
                cancel_on_tap_outside={true}
              />
            </Box>

            <Stack spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Facebook />}
                onClick={() => handleSocialSignIn('Facebook')}
                disabled={loading}
              >
                Continue with Facebook
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Twitter />}
                onClick={() => handleSocialSignIn('Twitter')}
                disabled={loading}
              >
                Continue with Twitter
              </Button>
            </Stack>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Don't have an account?{' '}
                <Button
                  color="primary"
                  onClick={() => navigate('/signup')}
                  disabled={loading}
                  sx={{ textTransform: 'none' }}
                >
                  Sign Up
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
    </Box>
  );
};

export default SignIn; 