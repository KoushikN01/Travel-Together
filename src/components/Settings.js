import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  AccountCircle,
  Notifications,
  Security,
  Language,
  Payment,
  DeleteForever,
  Save,
  Edit,
  PhotoCamera,
  Person,
  VpnKey,
  CreditCard,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, updateUser, refreshUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  const [subscriptionDialog, setSubscriptionDialog] = useState(false);
  const navigate = useNavigate();

  // Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    avatar: '',
  });

  // Account Settings
  const [accountSettings, setAccountSettings] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    tripUpdates: true,
    priceAlerts: true,
    promotionalEmails: false,
    securityAlerts: true,
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowDataCollection: true,
    allowLocationTracking: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: 30,
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Subscription Details
  const [subscriptionDetails, setSubscriptionDetails] = useState({
    plan: 'free',
    status: 'active',
    nextBillingDate: '',
    autoRenew: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        console.log('Fetching settings...');
        const settings = await authService.getUserSettings();
        console.log('Received settings:', settings);
        
        // Also fetch user profile to get avatar
        const userProfile = await authService.getProfile();
        console.log('User profile:', userProfile);
        
        if (settings) {
          // Initialize settings with defaults if they don't exist
          setProfileSettings({
            firstName: userProfile?.firstName || '',
            lastName: userProfile?.lastName || '',
            email: userProfile?.email || '',
            phoneNumber: userProfile?.phoneNumber || '',
            bio: settings.profile?.bio || '',
            avatar: userProfile?.avatar || ''
          });
          
          setAccountSettings(settings.account || {
            language: 'en',
            timezone: 'UTC',
            dateFormat: 'MM/DD/YYYY'
          });
          
          setNotificationSettings(settings.notifications || {
            emailNotifications: true,
            pushNotifications: true,
            tripUpdates: true,
            priceAlerts: true,
            promotionalEmails: false,
            securityAlerts: true
          });
          
          setPrivacySettings(settings.privacy || {
            profileVisibility: 'public',
            showEmail: false,
            showPhone: false,
            allowDataCollection: true,
            allowLocationTracking: true
          });
          
          setSecuritySettings(settings.security || {
            twoFactorAuth: false,
            loginNotifications: true,
            sessionTimeout: 30
          });
          
          setSubscriptionDetails(settings.subscription || {
            plan: 'free',
            status: 'active',
            nextBillingDate: '',
            autoRenew: true
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to load settings. Please try again.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handlePrivacyChange = (e) => {
    const { name, value, checked } = e.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value,
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        console.log('Uploading file:', file.name, file.size, file.type);
        const response = await authService.uploadAvatar(file);
        console.log('Avatar upload response:', response);
        console.log('Response avatar field:', response.avatar);
        console.log('Response keys:', Object.keys(response));
        
        setProfileSettings(prev => {
          console.log('Previous profile settings:', prev);
          console.log('Setting avatar to:', response.avatar);
          const updated = { ...prev, avatar: response.avatar };
          console.log('Updated profile settings:', updated);
          return updated;
        });
        
        if (updateUser && user) {
          console.log('Updating user context with avatar:', response.avatar);
          updateUser({ ...user, avatar: response.avatar });
        }
        
        // Refresh user data from server to ensure we have the latest information
        try {
          await refreshUser();
        } catch (refreshError) {
          console.warn('Failed to refresh user data after avatar upload:', refreshError);
        }
        
        setSnackbar({
          open: true,
          message: 'Profile picture updated successfully',
          severity: 'success',
        });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        setSnackbar({
          open: true,
          message: 'Failed to update profile picture',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const settings = {
        profile: profileSettings,
        account: accountSettings,
        notifications: notificationSettings,
        privacy: privacySettings,
        security: securitySettings,
        subscription: subscriptionDetails,
      };

      // Validate required fields
      if (!settings.profile.firstName || !settings.profile.lastName) {
        throw new Error('First name and last name are required');
      }

      await authService.updateUserSettings(settings);
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save settings. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setSnackbar({
        open: true,
        message: 'Password changed successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to change password',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await authService.deleteAccount();
      // Handle successful account deletion (e.g., logout and redirect)
    } catch (error) {
      console.error('Error deleting account:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete account',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setDeleteDialog(false);
    }
  };

  const handleUpdateSubscription = async (action) => {
    try {
      setLoading(true);
      await authService.updateSubscription(action);
      setSubscriptionDialog(false);
      setSnackbar({
        open: true,
        message: `Subscription ${action} successfully`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${action} subscription`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderProfileSettings = () => (
    <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)', boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar src={authService.getAvatarUrl(profileSettings.avatar)} sx={{ width: 100, height: 100, mr: 2, boxShadow: 3 }} />
        <Box>
          <input accept="image/*" style={{ display: 'none' }} id="avatar-upload" type="file" onChange={handleAvatarUpload} />
          <label htmlFor="avatar-upload">
            <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>Change Photo</Button>
          </label>
        </Box>
      </Box>
      <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 700, mb: 2 }}>
        Profile Settings
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}><TextField fullWidth label="First Name" name="firstName" value={profileSettings.firstName} onChange={handleProfileChange} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Last Name" name="lastName" value={profileSettings.lastName} onChange={handleProfileChange} /></Grid>
        <Grid item xs={12}><TextField fullWidth label="Email" name="email" value={profileSettings.email} disabled /></Grid>
        <Grid item xs={12}><TextField fullWidth label="Phone Number" name="phoneNumber" value={profileSettings.phoneNumber} onChange={handleProfileChange} /></Grid>
        <Grid item xs={12}><TextField fullWidth label="Bio" name="bio" value={profileSettings.bio} onChange={handleProfileChange} multiline rows={4} /></Grid>
      </Grid>
    </Paper>
  );

  const renderSubscriptionSettings = () => (
    <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)', boxShadow: 2 }}>
      <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 700, mb: 2 }}>
        Subscription Details
      </Typography>
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom color="secondary" fontWeight={600}>
            {subscriptionDetails.plan === 'premium' ? 'Premium Plan' : 'Free Plan'}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            Status: {subscriptionDetails.status}
          </Typography>
          {subscriptionDetails.plan === 'premium' && (
            <>
              <Typography color="text.secondary" gutterBottom>
                Next Billing Date: {subscriptionDetails.nextBillingDate}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={subscriptionDetails.autoRenew}
                    onChange={(e) => setSubscriptionDetails(prev => ({
                      ...prev,
                      autoRenew: e.target.checked
                    }))}
                  />
                }
                label="Auto-renew subscription"
              />
            </>
          )}
        </CardContent>
        <CardActions>
          {subscriptionDetails.plan === 'premium' ? (
            <Button color="error" onClick={() => setSubscriptionDialog(true)}>
              Cancel Subscription
            </Button>
          ) : (
            <Button color="primary" onClick={() => navigate('/subscription')}>
              Upgrade to Premium
            </Button>
          )}
        </CardActions>
      </Card>
    </Paper>
  );

  const renderAccountSettings = () => (
    <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)', boxShadow: 2 }}>
      <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 700, mb: 2 }}>
        Account Settings
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select name="language" value={accountSettings.language} onChange={handleAccountChange} label="Language">
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="de">German</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Timezone</InputLabel>
            <Select name="timezone" value={accountSettings.timezone} onChange={handleAccountChange} label="Timezone">
              <MenuItem value="UTC">UTC</MenuItem>
              <MenuItem value="EST">EST</MenuItem>
              <MenuItem value="PST">PST</MenuItem>
              <MenuItem value="GMT">GMT</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Date Format</InputLabel>
            <Select name="dateFormat" value={accountSettings.dateFormat} onChange={handleAccountChange} label="Date Format">
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderNotificationSettings = () => (
    <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)', boxShadow: 2 }}>
      <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 700, mb: 2 }}>
        Notification Preferences
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}><FormControlLabel control={<Switch checked={notificationSettings.emailNotifications} onChange={handleNotificationChange} name="emailNotifications" />} label="Email Notifications" /></Grid>
        <Grid item xs={12}><FormControlLabel control={<Switch checked={notificationSettings.pushNotifications} onChange={handleNotificationChange} name="pushNotifications" />} label="Push Notifications" /></Grid>
        <Grid item xs={12}><FormControlLabel control={<Switch checked={notificationSettings.tripUpdates} onChange={handleNotificationChange} name="tripUpdates" />} label="Trip Updates" /></Grid>
        <Grid item xs={12}><FormControlLabel control={<Switch checked={notificationSettings.priceAlerts} onChange={handleNotificationChange} name="priceAlerts" />} label="Price Alerts" /></Grid>
        <Grid item xs={12}><FormControlLabel control={<Switch checked={notificationSettings.promotionalEmails} onChange={handleNotificationChange} name="promotionalEmails" />} label="Promotional Emails" /></Grid>
        <Grid item xs={12}><FormControlLabel control={<Switch checked={notificationSettings.securityAlerts} onChange={handleNotificationChange} name="securityAlerts" />} label="Security Alerts" /></Grid>
      </Grid>
    </Paper>
  );

  const renderPrivacySettings = () => (
    <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)', boxShadow: 2 }}>
      <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 700, mb: 2 }}>
        Privacy Settings
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Profile Visibility</InputLabel>
            <Select name="profileVisibility" value={privacySettings.profileVisibility} onChange={handlePrivacyChange} label="Profile Visibility">
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="friends">Friends Only</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}><FormControlLabel control={<Switch checked={privacySettings.showEmail} onChange={handlePrivacyChange} name="showEmail" />} label="Show Email Address" /></Grid>
        <Grid item xs={12}><FormControlLabel control={<Switch checked={privacySettings.showPhone} onChange={handlePrivacyChange} name="showPhone" />} label="Show Phone Number" /></Grid>
        <Grid item xs={12}><FormControlLabel control={<Switch checked={privacySettings.allowDataCollection} onChange={handlePrivacyChange} name="allowDataCollection" />} label="Allow Data Collection" /></Grid>
        <Grid item xs={12}><FormControlLabel control={<Switch checked={privacySettings.allowLocationTracking} onChange={handlePrivacyChange} name="allowLocationTracking" />} label="Allow Location Tracking" /></Grid>
      </Grid>
    </Paper>
  );

  const renderSecuritySettings = () => (
    <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'rgba(255,255,255,0.95)', boxShadow: 2 }}>
      <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 700, mb: 2 }}>
        Security Settings
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}><FormControlLabel control={<Switch checked={securitySettings.twoFactorAuth} onChange={handleSecurityChange} name="twoFactorAuth" />} label="Two-Factor Authentication" /></Grid>
        <Grid item xs={12}><FormControlLabel control={<Switch checked={securitySettings.loginNotifications} onChange={handleSecurityChange} name="loginNotifications" />} label="Login Notifications" /></Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Session Timeout (minutes)</InputLabel>
            <Select name="sessionTimeout" value={securitySettings.sessionTimeout} onChange={handleSecurityChange} label="Session Timeout (minutes)">
              <MenuItem value={15}>15 minutes</MenuItem>
              <MenuItem value={30}>30 minutes</MenuItem>
              <MenuItem value={60}>1 hour</MenuItem>
              <MenuItem value={120}>2 hours</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}><Button variant="outlined" color="primary" onClick={() => setPasswordDialog(true)} fullWidth startIcon={<VpnKey />}>Change Password</Button></Grid>
        <Grid item xs={12}><Button variant="outlined" color="error" onClick={() => setDeleteDialog(true)} fullWidth startIcon={<DeleteForever />}>Delete Account</Button></Grid>
      </Grid>
    </Paper>
  );

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
          Settings
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}>
          Manage your account, privacy, notifications, and more
        </Typography>
      </Box>
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Person />} label="Profile" />
            <Tab icon={<CreditCard />} label="Subscription" />
            <Tab icon={<AccountCircle />} label="Account" />
            <Tab icon={<Notifications />} label="Notifications" />
            <Tab icon={<Security />} label="Security" />
            <Tab icon={<Language />} label="Privacy" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {activeTab === 0 && renderProfileSettings()}
            {activeTab === 1 && renderSubscriptionSettings()}
            {activeTab === 2 && renderAccountSettings()}
            {activeTab === 3 && renderNotificationSettings()}
            {activeTab === 4 && renderSecuritySettings()}
            {activeTab === 5 && renderPrivacySettings()}

            <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveSettings}
                startIcon={<Save />}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            color="error"
            disabled={loading}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog open={subscriptionDialog} onClose={() => setSubscriptionDialog(false)}>
        <DialogTitle>
          {subscriptionDetails.plan === 'premium' ? 'Cancel Subscription' : 'Upgrade to Premium'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {subscriptionDetails.plan === 'premium'
              ? 'Are you sure you want to cancel your premium subscription?'
              : 'Would you like to upgrade to our premium plan?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubscriptionDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleUpdateSubscription(
              subscriptionDetails.plan === 'premium' ? 'cancel' : 'upgrade'
            )}
            variant="contained"
            color={subscriptionDetails.plan === 'premium' ? 'error' : 'primary'}
            disabled={loading}
          >
            {subscriptionDetails.plan === 'premium' ? 'Cancel Subscription' : 'Upgrade'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings; 