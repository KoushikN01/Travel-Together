import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Fade,
  Zoom,
  IconButton,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Star as StarIcon,
  LocalOffer as OfferIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  QrCode2 as QrCodeIcon,
  CalendarMonth as CalendarIcon,
  Send as SendIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StarBorder from '../components/effects/StarBorder';
import { processCardPayment, processUPIPayment } from '../services/mockPaymentGateway';
import authService from '../services/authService';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

const PlanHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)',
  color: 'white',
  borderRadius: '16px 16px 0 0',
}));

const FeatureList = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  '& > *': {
    marginBottom: theme.spacing(1),
  },
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const CustomPlanDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    padding: theme.spacing(2),
  },
}));

const Subscription = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openPayment, setOpenPayment] = useState(false);
  const [openCustomPlan, setOpenCustomPlan] = useState(false);
  const [customPlanDetails, setCustomPlanDetails] = useState({
    name: '',
    email: '',
    company: '',
    requirements: '',
    budget: '',
    timeline: ''
  });
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [customPlan, setCustomPlan] = useState({
    name: '',
    price: '',
    features: [''],
  });

  const plans = [
    {
      name: 'Basic',
      price: '₹15,000',
      period: 'month',
      features: [
        'Basic trip planning',
        'Up to 3 trips',
        'Standard support',
        'Basic itinerary templates',
        'Basic Travel Insurance',
        'Medical coverage up to ₹5L',
        'Trip cancellation coverage',
      ],
    },
    {
      name: 'Premium',
      price: '₹25,000',
      period: 'month',
      features: [
        'Advanced trip planning',
        'Unlimited trips',
        'Priority support',
        'Custom itinerary templates',
        'Travel recommendations',
        'Offline access',
        'Comprehensive Travel Insurance',
        'Medical coverage up to ₹15L',
        'Trip cancellation & interruption',
        'Baggage & personal effects coverage',
        'Emergency evacuation coverage',
        '24/7 travel assistance',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '₹45,000',
      period: 'month',
      features: [
        'All Premium features',
        'Team collaboration',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'Advanced analytics',
        'Premium Travel Insurance',
        'Medical coverage up to ₹50L',
        'Full trip protection',
        'Business equipment coverage',
        'Global emergency assistance',
        'Priority claim processing',
        'Custom insurance solutions',
      ],
    },
  ];

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setOpenPayment(true);
  };

  const handlePaymentClose = () => {
    setOpenPayment(false);
    setSelectedPlan(null);
    setPaymentDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      let result;
      if (paymentMethod === 'card') {
        result = await processCardPayment({
          amount: selectedPlan?.price || '0',
          cardNumber: paymentDetails.cardNumber,
          expiryDate: paymentDetails.expiryDate,
          cvv: paymentDetails.cvv,
          name: user?.name || 'User'
        });
      } else if (paymentMethod === 'upi') {
        result = await processUPIPayment({
          amount: selectedPlan?.price || '0',
          upiId: paymentDetails.upiId || 'user@upi'
        });
      }
      // Update user subscription in backend
      const subscriptionData = {
        planName: selectedPlan.name,
        price: selectedPlan.price,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        features: selectedPlan.features,
      };
      
      // Save subscription to backend
      const savedSubscription = await authService.updateSubscription('upgrade', subscriptionData);
      
      // Update user context with the saved subscription
      updateUser({
        ...user,
        subscription: savedSubscription,
      });
      setSnackbar({
        open: true,
        message: (result?.message || 'Payment successful!') + (result?.transactionId ? ` (Txn: ${result.transactionId})` : ''),
        severity: 'success'
      });
      handlePaymentClose();
      setTimeout(() => navigate('/profile'), 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Payment failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCustomPlanSubmit = async () => {
    try {
      setLoading(true);
      // Here you would typically send the custom plan request to your backend
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      setSnackbar({
        open: true,
        message: 'Your custom plan request has been submitted. Our sales team will contact you shortly.',
        severity: 'success'
      });
      setOpenCustomPlan(false);
      setCustomPlanDetails({
        name: '',
        email: '',
        company: '',
        requirements: '',
        budget: '',
        timeline: ''
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to submit custom plan request. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    setCustomPlan({
      ...customPlan,
      features: [...customPlan.features, ''],
    });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...customPlan.features];
    newFeatures[index] = value;
    setCustomPlan({
      ...customPlan,
      features: newFeatures,
    });
  };

  const handleRemoveFeature = (index) => {
    const newFeatures = customPlan.features.filter((_, i) => i !== index);
    setCustomPlan({
      ...customPlan,
      features: newFeatures,
    });
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Card Number"
                fullWidth
                value={paymentDetails.cardNumber}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                placeholder="1234 5678 9012 3456"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Expiry Date"
                fullWidth
                value={paymentDetails.expiryDate}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                placeholder="MM/YY"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="CVV"
                fullWidth
                value={paymentDetails.cvv}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                placeholder="123"
                type="password"
              />
            </Grid>
          </Grid>
        );

      case 'upi':
        return (
          <Box>
            <TextField
              label="UPI ID"
              fullWidth
              placeholder="username@upi"
              helperText="Enter your UPI ID (e.g., username@upi)"
            />
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
              <QrCodeIcon sx={{ fontSize: 100, color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Scan QR code with any UPI app
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const InsuranceBenefits = () => (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
        Travel Insurance Benefits
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Medical Coverage
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Emergency medical expenses" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Hospitalization coverage" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Medical evacuation" />
              </ListItem>
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Trip Protection
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Trip cancellation coverage" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Trip interruption benefits" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Travel delay coverage" />
              </ListItem>
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Additional Benefits
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Baggage protection" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="24/7 travel assistance" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Emergency cash advance" />
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderPlanCard = (plan) => (
    <StyledCard>
      <PlanHeader>
        <Typography variant="h4" component="h2" gutterBottom>
          {plan.name}
        </Typography>
        <Typography variant="h3" component="div" gutterBottom>
          {plan.price}
          <Typography variant="subtitle1" component="span">
            /{plan.period}
          </Typography>
        </Typography>
        {plan.popular && (
          <Chip
            icon={<StarIcon />}
            label="Most Popular"
            color="secondary"
            sx={{ mt: 1 }}
          />
        )}
      </PlanHeader>
      <CardContent sx={{ flexGrow: 1 }}>
        <FeatureList>
          {plan.features.map((feature, index) => (
            <FeatureItem key={index}>
              <CheckIcon color="primary" />
              <Typography>{feature}</Typography>
            </FeatureItem>
          ))}
        </FeatureList>
      </CardContent>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <StarBorder
          as="button"
          color={plan.popular ? "#7c3aed" : "#2563eb"}
          speed="5s"
          onClick={() => handleSubscribe(plan)}
          style={{ width: '100%' }}
        >
          Subscribe Now
        </StarBorder>
      </Box>
    </StyledCard>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 8, minHeight: '100vh', background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)', borderRadius: 6, boxShadow: 3, px: { xs: 1, sm: 4 }, mt: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: 1.5,
            mb: 2
          }}
        >
          Choose Your Plan
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}>
          Select the perfect plan for your travel needs or create a custom plan tailored to your requirements
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.name}>
            {renderPlanCard(plan)}
          </Grid>
        ))}

        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <PlanHeader>
              <Typography variant="h4" component="h2" gutterBottom>
                Custom Plan
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.8 }}>
                Tailored to your needs
              </Typography>
            </PlanHeader>
            <CardContent sx={{ flexGrow: 1 }}>
              <FeatureList>
                <FeatureItem>
                  <OfferIcon color="primary" />
                  <Typography>Custom pricing</Typography>
                </FeatureItem>
                <FeatureItem>
                  <CheckIcon color="primary" />
                  <Typography>Personalized features</Typography>
                </FeatureItem>
                <FeatureItem>
                  <CheckIcon color="primary" />
                  <Typography>Flexible terms</Typography>
                </FeatureItem>
              </FeatureList>
            </CardContent>
            <Box p={2}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{ fontWeight: 600, borderRadius: 2, borderWidth: 2 }}
              >
                Create Custom Plan
              </Button>
            </Box>
          </StyledCard>
        </Grid>
      </Grid>

      <InsuranceBenefits />

      <CustomPlanDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">Create Custom Plan</Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Plan Name"
              value={customPlan.name}
              onChange={(e) => setCustomPlan({ ...customPlan, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Price (₹)"
              type="number"
              value={customPlan.price}
              onChange={(e) => setCustomPlan({ ...customPlan, price: e.target.value })}
              margin="normal"
            />
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
              Features
            </Typography>
            {customPlan.features.map((feature, index) => (
              <Box key={index} display="flex" gap={1} mb={2}>
                <TextField
                  fullWidth
                  label={`Feature ${index + 1}`}
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveFeature(index)}
                  disabled={customPlan.features.length === 1}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddFeature}
              sx={{ mt: 1 }}
            >
              Add Feature
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Create Plan
          </Button>
        </DialogActions>
      </CustomPlanDialog>

      {/* Payment Dialog */}
      <Dialog 
        open={openPayment} 
        onClose={handlePaymentClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Subscribe to {selectedPlan?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Payment Details
            </Typography>
            <Tabs
              value={paymentMethod}
              onChange={(e, newValue) => setPaymentMethod(newValue)}
              sx={{ mb: 3 }}
              variant="fullWidth"
            >
              <Tab 
                value="card" 
                label="Card" 
                icon={<CreditCardIcon />} 
                iconPosition="start"
              />
              <Tab 
                value="upi" 
                label="UPI" 
                icon={<QrCodeIcon />} 
                iconPosition="start"
              />
            </Tabs>
            {renderPaymentForm()}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Plan</Typography>
                <Typography>{selectedPlan?.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Billing Period</Typography>
                <Typography>Monthly</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">Total</Typography>
                <Typography variant="subtitle1" color="primary.main">
                  ₹{selectedPlan?.price}/month
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handlePaymentClose}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            disabled={loading || (paymentMethod === 'card' && (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv))}
            startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              }
            }}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </Button>
        </DialogActions>
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

export default Subscription; 