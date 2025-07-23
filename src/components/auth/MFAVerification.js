import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from '@mui/material';
import { QrCode2, Sms, Security } from '@mui/icons-material';
import authService from '../../services/authService';

const MFAVerification = ({ tempToken, onVerificationSuccess, onCancel }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [mfaMethod, setMfaMethod] = useState('authenticator');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Please enter verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.verifyMFA(verificationCode, tempToken);
      onVerificationSuccess(response);
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupMFA = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authService.setupMFA();
      if (mfaMethod === 'authenticator') {
        setQrCodeUrl(response.qrCode);
      } else {
        // Handle SMS setup
        await authService.setupSMSMFA(response.phoneNumber);
      }
      setSetupDialogOpen(true);
    } catch (err) {
      setError(err.message || 'Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = (event) => {
    setMfaMethod(event.target.value);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Stack spacing={3} alignItems="center">
            <Security sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h5" align="center">
              Two-Factor Authentication
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            )}

            <Typography color="textSecondary" align="center">
              Enter the verification code from your authenticator app or SMS
            </Typography>

            <TextField
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              inputProps={{ maxLength: 6 }}
            />

            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleVerify}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify'}
              </Button>
            </Stack>

            <Divider sx={{ width: '100%' }}>
              <Typography variant="body2" color="textSecondary">
                or
              </Typography>
            </Divider>

            <Button
              variant="text"
              onClick={handleSetupMFA}
              startIcon={<Security />}
              disabled={loading}
            >
              Setup Two-Factor Authentication
            </Button>
          </Stack>
        </Paper>
      </Box>

      {/* MFA Setup Dialog */}
      <Dialog open={setupDialogOpen} onClose={() => setSetupDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <RadioGroup value={mfaMethod} onChange={handleMethodChange}>
              <FormControlLabel
                value="authenticator"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QrCode2 />
                    <Typography>Authenticator App</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="sms"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Sms />
                    <Typography>SMS Verification</Typography>
                  </Box>
                }
              />
            </RadioGroup>

            {mfaMethod === 'authenticator' && qrCodeUrl && (
              <Box sx={{ textAlign: 'center' }}>
                <img src={qrCodeUrl} alt="QR Code" style={{ maxWidth: 200 }} />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Scan this QR code with your authenticator app
                </Typography>
              </Box>
            )}

            {mfaMethod === 'sms' && (
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="Enter your phone number"
              />
            )}

            <TextField
              fullWidth
              label="Verification Code"
              placeholder="Enter the code to verify setup"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSetupDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              // TODO: Implement verification of setup
              setSetupDialogOpen(false);
            }}
          >
            Verify Setup
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MFAVerification; 