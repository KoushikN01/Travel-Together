import React, { useContext, useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  Button,
  Grid,
  TextField,
  Divider,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, Star as StarIcon, Warning as WarningIcon, CheckCircle, Check } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    emergencyPhone: '',
    preferredLanguage: '',
    travelPreferences: '',
    dietaryRestrictions: '',
    passportNumber: '',
    passportExpiry: '',
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [cancelDialog, setCancelDialog] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = authService.getToken();
        if (!token) {
          throw new Error('No authentication token found');
        }
        const userData = await authService.getProfile();
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          country: userData.country || '',
          pincode: userData.pincode || '',
          dateOfBirth: userData.dateOfBirth || '',
          gender: userData.gender || '',
          emergencyContact: userData.emergencyContact || '',
          emergencyPhone: userData.emergencyPhone || '',
          preferredLanguage: userData.preferredLanguage || '',
          travelPreferences: userData.travelPreferences || '',
          dietaryRestrictions: userData.dietaryRestrictions || '',
          passportNumber: userData.passportNumber || '',
          passportExpiry: userData.passportExpiry || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to load profile data',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        const details = await authService.getSubscriptionDetails();
        if (details) {
          setSubscriptionDetails(details);
          // Update user context with subscription details
          if (user) {
            updateUser({
              ...user,
              subscription: {
                ...details,
                startDate: new Date(details.startDate),
                expiryDate: new Date(details.expiryDate)
              }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching subscription details:', error);
      }
    };

    if (user) {
      fetchSubscriptionDetails();
    }
  }, [user, updateUser]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Invalid phone number format (e.g. +1 234 567 8900)';
    }
    if (formData.passportExpiry && new Date(formData.passportExpiry) < new Date()) {
      newErrors.passportExpiry = 'Passport has expired';
    }
    if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
      newErrors.dateOfBirth = 'Invalid date of birth';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setErrors({});
    // Reset form data to current user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        pincode: user.pincode || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        emergencyContact: user.emergencyContact || '',
        emergencyPhone: user.emergencyPhone || '',
        preferredLanguage: user.preferredLanguage || '',
        travelPreferences: user.travelPreferences || '',
        dietaryRestrictions: user.dietaryRestrictions || '',
        passportNumber: user.passportNumber || '',
        passportExpiry: user.passportExpiry || '',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const updatedUserData = await authService.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        pincode: formData.pincode.trim(),
        dateOfBirth: formData.dateOfBirth.trim(),
        gender: formData.gender.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        emergencyPhone: formData.emergencyPhone.trim(),
        preferredLanguage: formData.preferredLanguage.trim(),
        travelPreferences: formData.travelPreferences.trim(),
        dietaryRestrictions: formData.dietaryRestrictions.trim(),
        passportNumber: formData.passportNumber.trim(),
        passportExpiry: formData.passportExpiry.trim(),
      });

      updateUser(updatedUserData);
      setEditing(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update profile',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      
      // Calculate days used and refund amount
      const startDate = new Date(subscriptionDetails.startDate);
      const endDate = new Date(subscriptionDetails.expiryDate);
      const today = new Date();
      
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const daysUsed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, totalDays - daysUsed);
      
      // Calculate refund amount (assuming monthly subscription)
      const dailyRate = parseFloat(subscriptionDetails.price) / 30;
      const usageCharge = dailyRate * daysUsed;
      const cancellationFee = parseFloat(subscriptionDetails.price) * 0.1; // 10% cancellation fee
      const refundAmount = Math.max(0, parseFloat(subscriptionDetails.price) - usageCharge - cancellationFee);

      await authService.updateSubscription('cancel');
      
      // Update local subscription state
      setSubscriptionDetails(null);
      
      // Update user context
      if (user) {
        updateUser({ ...user, subscription: null });
      }
      
      setSnackbar({
        open: true,
        message: `Subscription cancelled successfully. A refund of ₹${refundAmount.toFixed(2)} will be credited to your account within 5-7 business days. (Usage charges: ₹${usageCharge.toFixed(2)}, Cancellation fee: ₹${cancellationFee.toFixed(2)})`,
        severity: 'success'
      });
      
      setCancelDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to cancel subscription',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    navigate('/subscription');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderSubscriptionStatus = () => {
    // First check local subscription state, then fall back to user subscription
    const currentSubscription = subscriptionDetails || (user?.subscription ? {
      ...user.subscription,
      startDate: new Date(user.subscription.startDate),
      expiryDate: new Date(user.subscription.expiryDate)
    } : null);

    console.log('Current subscription data:', currentSubscription);
    console.log('Subscription features:', currentSubscription?.features);

    if (currentSubscription) {
      return (
        <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'success.light' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <StarIcon sx={{ color: 'white' }} fontSize="large" />
              <Box>
                <Typography variant="h6" color="white">
                  You are a {currentSubscription.planName} User
                </Typography>
                <Typography variant="body2" color="white">
                  Expires on {formatDate(currentSubscription.expiryDate)}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="error"
              onClick={() => setCancelDialog(true)}
              sx={{ bgcolor: 'white', color: 'error.main', '&:hover': { bgcolor: 'grey.100' } }}
            >
              Cancel Subscription
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="white" gutterBottom>
              Your Plan Features:
            </Typography>
            <Grid container spacing={1}>
              {currentSubscription.features && currentSubscription.features.length > 0 ? (
                currentSubscription.features.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Check sx={{ color: 'white', fontSize: '0.8rem' }} />
                      <Typography variant="body2" color="white">
                        {feature}
                      </Typography>
                    </Box>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body2" color="white">
                    Premium features activated
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Paper>
      );
    }

    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'grey.100' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StarIcon color="action" fontSize="large" />
            <Box>
              <Typography variant="h6" color="text.primary">
                Upgrade to Pro
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get access to premium features and exclusive benefits
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={handleSubscribe}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
            }}
          >
            Subscribe for Pro Features
          </Button>
        </Box>
      </Paper>
    );
  };

  const renderCancelDialog = () => (
    <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
      <DialogTitle>Cancel Subscription</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WarningIcon color="warning" fontSize="large" />
            <Typography>
              Are you sure you want to cancel your subscription? You'll lose access to all Pro features at the end of your billing period.
            </Typography>
          </Box>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Cancellation Terms:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Refund will be processed within 5-7 business days
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Usage charges will be deducted based on days used
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • A 10% cancellation fee applies
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCancelDialog(false)}>
          Keep Subscription
        </Button>
        <Button
          onClick={handleCancelSubscription}
          color="error"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Confirm Cancellation'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" align="center">
            Please sign in to view your profile
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Add this before the Avatar rendering
  console.log('Profile avatar (raw):', user?.avatar);
  console.log('Profile avatar (getAvatarUrl):', authService.getAvatarUrl(user?.avatar));

  return (
    <Container maxWidth="md" sx={{ py: 6, minHeight: '100vh', background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)', borderRadius: 6, boxShadow: 3, px: { xs: 1, sm: 4 }, mt: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: 1.5,
            mb: 2
          }}
        >
          My Profile
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}>
          Manage your personal information, preferences, and subscription details
        </Typography>
      </Box>
      {/* Subscription Status Section */}
      <Box sx={{ mb: 4 }}>
        {renderSubscriptionStatus()}
      </Box>

      {/* Profile Content */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            {/* Profile Image and Basic Info */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={authService.getAvatarUrl(user?.avatar)}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            {/* Rest of the profile content */}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {/* Profile Settings Form */}
            <Typography variant="h6" gutterBottom>
              Profile Settings
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              {!editing ? (
                <Button
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  variant="outlined"
                >
                  Edit Profile
                </Button>
              ) : (
                <Box>
                  <Button
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{ mr: 1 }}
                    disabled={loading}
                  >
                    Save
                  </Button>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    variant="outlined"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  fullWidth
                  disabled
                  type="email"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Gender"
                  name="gender"
                  select
                  value={formData.gender}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Address Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Emergency Contact
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Emergency Contact Name"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Emergency Contact Phone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Travel Preferences
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Preferred Language"
                  name="preferredLanguage"
                  select
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                >
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="hindi">Hindi</MenuItem>
                  <MenuItem value="spanish">Spanish</MenuItem>
                  <MenuItem value="french">French</MenuItem>
                  <MenuItem value="german">German</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Travel Preferences"
                  name="travelPreferences"
                  select
                  value={formData.travelPreferences}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                >
                  <MenuItem value="luxury">Luxury</MenuItem>
                  <MenuItem value="budget">Budget</MenuItem>
                  <MenuItem value="adventure">Adventure</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                  <MenuItem value="family">Family</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Dietary Restrictions"
                  name="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                  multiline
                  rows={2}
                  helperText="List any dietary restrictions or preferences"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Travel Documents
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Passport Number"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Passport Expiry Date"
                  name="passportExpiry"
                  type="date"
                  value={formData.passportExpiry}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editing}
                  error={!!errors.passportExpiry}
                  helperText={errors.passportExpiry}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
        {renderCancelDialog()}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 