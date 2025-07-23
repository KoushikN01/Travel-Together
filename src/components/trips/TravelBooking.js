import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  LocalAtm as LocalAtmIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  processCardPayment,
  processUPIPayment,
  processBankPayment,
  processEMIPayment
} from '../../services/mockPaymentGateway';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const BookingHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)',
  color: 'white',
  borderRadius: '16px 16px 0 0',
}));

const PaymentMethodCard = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  cursor: 'pointer',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(0,0,0,0.12)',
  borderRadius: 12,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
  },
}));

const TravelBooking = ({ onBookingComplete, prefillData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [bookingDetails, setBookingDetails] = useState({
    from: prefillData?.from || '',
    to: prefillData?.to || '',
    departureDate: prefillData?.startDate ? new Date(prefillData.startDate) : null,
    returnDate: prefillData?.endDate ? new Date(prefillData.endDate) : null,
    travelers: prefillData?.travelers || 1,
    transportMode: prefillData?.transportMode || 'flight',
    accommodation: prefillData?.accommodation || 'hotel',
    duration: 0,
    costEstimate: 0,
    paymentMethod: 'card'
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [emiOption, setEmiOption] = useState('full');
  const [emiMonths, setEmiMonths] = useState(3);
  const emiPlans = [3, 6, 9, 12];

  const steps = ['Trip Details', 'Payment', 'Confirmation'];

  const validateStep = (step) => {
    if (step === 0) {
      const hasRequiredFields = 
        bookingDetails.from && 
        bookingDetails.to && 
        bookingDetails.departureDate && 
        bookingDetails.returnDate && 
        bookingDetails.travelers >= 1;

      console.log('Step 0 validation:', {
        hasRequiredFields,
        from: bookingDetails.from,
        to: bookingDetails.to,
        departureDate: bookingDetails.departureDate,
        returnDate: bookingDetails.returnDate,
        travelers: bookingDetails.travelers
      });

      return { hasRequiredFields };
    }
    
    if (step === 1) {
      if (bookingDetails.paymentMethod === 'card') {
        const hasCardDetails = 
          paymentDetails.cardNumber && 
          paymentDetails.expiryDate && 
          paymentDetails.cvv && 
          paymentDetails.name;

        return { hasRequiredFields: hasCardDetails };
      }
      return { hasRequiredFields: true };
    }
    
    return { hasRequiredFields: true };
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderTripDetails();
      case 1:
        return renderPayment();
      case 2:
        return bookingSuccess ? renderConfirmation() : (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            Please confirm your booking.
          </Typography>
        );
      default:
        return 'Unknown step';
    }
  };

  const handleNext = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const validation = validateStep(activeStep);
    if (!validation.hasRequiredFields) {
      return;
    }

    if (activeStep === 1) { // Payment step
      setIsProcessing(true);
      try {
        await handlePayment();
        // handlePayment will set bookingSuccess and step if successful
        // Only advance if payment is successful
        // (setActiveStep(2) is already called in handlePayment on success)
      } catch (err) {
        // Error is already handled in handlePayment
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (activeStep === steps.length - 1) {
      onBookingComplete({
        ...bookingDetails,
        emiOption: emiOption === 'emi' ? { emi: true, months: emiMonths, monthly: calculateEMIMonthly(calculateTotal(), emiMonths) } : { emi: false }
      });
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setBookingDetails({
      from: '',
      to: '',
      departureDate: null,
      returnDate: null,
      travelers: 1,
      accommodation: '',
      activities: [],
      transportation: '',
      budget: '',
      preferences: []
    });
  };

  const isNextDisabled = () => {
    const validation = validateStep(activeStep);
    console.log('Button disabled check:', {
      activeStep,
      validation,
      bookingDetails,
      isDisabled: !validation.hasRequiredFields
    });
    return !validation.hasRequiredFields;
  };

  const calculateTotal = () => {
    const baseCost = 5000; // Base cost in ₹ (reduced from 50000)
    const days = bookingDetails.returnDate && bookingDetails.departureDate
      ? Math.ceil((bookingDetails.returnDate - bookingDetails.departureDate) / (1000 * 60 * 60 * 24))
      : 0;
    
    let total = baseCost * days * bookingDetails.travelers;
    
    // Add accommodation costs (reduced prices)
    if (bookingDetails.accommodation === 'luxury') {
      total += 3000 * days * bookingDetails.travelers; // Reduced from 15000
    } else if (bookingDetails.accommodation === 'standard') {
      total += 1500 * days * bookingDetails.travelers; // Reduced from 8000
    }
    
    // Add transport costs (reduced prices)
    if (bookingDetails.transportMode === 'luxury') {
      total += 2000 * bookingDetails.travelers; // Reduced from 10000
    } else if (bookingDetails.transportMode === 'standard') {
      total += 1000 * bookingDetails.travelers; // Reduced from 5000
    }
    
    return total;
  };

  const calculateEMIMonthly = (total, months) => {
    // Simple EMI calculation, no interest for demo
    return Math.ceil(total / months);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      let result;
      const amount = calculateTotal();
      if (bookingDetails.paymentMethod === 'card') {
        result = await processCardPayment({
          amount,
          cardNumber: paymentDetails.cardNumber,
          expiryDate: paymentDetails.expiryDate,
          cvv: paymentDetails.cvv,
          name: paymentDetails.name
        });
      } else if (bookingDetails.paymentMethod === 'upi') {
        result = await processUPIPayment({
          amount,
          upiId: paymentDetails.upiId || 'travelapp@upi'
        });
      } else if (bookingDetails.paymentMethod === 'bank') {
        result = await processBankPayment({
          amount,
          bankAccount: paymentDetails.bankAccount || '1234567890',
          ifscCode: paymentDetails.ifscCode || 'EXMP0001234'
        });
      } else if (emiOption === 'emi') {
        result = await processEMIPayment({
          amount,
          bankAccount: paymentDetails.bankAccount || '1234567890',
          ifscCode: paymentDetails.ifscCode || 'EXMP0001234',
          months: emiMonths
        });
      }
      setSnackbar({
        open: true,
        message: result.message + (result.transactionId ? ` (Txn: ${result.transactionId})` : ''),
        severity: 'success'
      });
      setBookingSuccess(true);
      setActiveStep(2);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Payment failed',
        severity: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTripDetails = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="From"
            value={bookingDetails.from}
            onChange={(e) => setBookingDetails({ ...bookingDetails, from: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="To"
            value={bookingDetails.to}
            onChange={(e) => setBookingDetails({ ...bookingDetails, to: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Departure Date"
              value={bookingDetails.departureDate}
              onChange={(newValue) =>
                setBookingDetails({ ...bookingDetails, departureDate: newValue })
              }
              format="yyyy-MM-dd"
              slots={{ textField: TextField }}
              slotProps={{
                textField: { fullWidth: true, margin: 'normal', required: true }
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Return Date"
              value={bookingDetails.returnDate}
              onChange={(newValue) =>
                setBookingDetails({ ...bookingDetails, returnDate: newValue })
              }
              format="yyyy-MM-dd"
              slots={{ textField: TextField }}
              slotProps={{
                textField: { fullWidth: true, margin: 'normal', required: true }
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Number of Travelers"
            value={bookingDetails.travelers}
            onChange={(e) => setBookingDetails({ ...bookingDetails, travelers: parseInt(e.target.value) })}
            InputProps={{
              inputProps: { min: 1, max: 10 }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Transport Mode</InputLabel>
            <Select
              value={bookingDetails.transportMode}
              onChange={(e) => setBookingDetails({ ...bookingDetails, transportMode: e.target.value })}
              label="Transport Mode"
            >
              <MenuItem value="flight">Flight</MenuItem>
              <MenuItem value="train">Train</MenuItem>
              <MenuItem value="bus">Bus</MenuItem>
              <MenuItem value="car">Car</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Accommodation Type</InputLabel>
            <Select
              value={bookingDetails.accommodation}
              onChange={(e) => setBookingDetails({ ...bookingDetails, accommodation: e.target.value })}
              label="Accommodation Type"
            >
              <MenuItem value="hotel">Hotel</MenuItem>
              <MenuItem value="resort">Resort</MenuItem>
              <MenuItem value="hostel">Hostel</MenuItem>
              <MenuItem value="apartment">Apartment</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Cost Summary
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary">Base Cost</Typography>
            <Typography>₹{5000 * bookingDetails.travelers}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary">Accommodation</Typography>
            <Typography>
              ₹{bookingDetails.accommodation === 'luxury' ? 3000 : 1500} per person per day
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary">Transport</Typography>
            <Typography>
              ₹{bookingDetails.transportMode === 'luxury' ? 2000 : 1000} per person
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6" color="primary">
              ₹{calculateTotal().toLocaleString()}
            </Typography>
          </Box>
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>Choose Payment Option</Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant={emiOption === 'full' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setEmiOption('full')}
              >
                Pay Full Amount
              </Button>
              <Button
                variant={emiOption === 'emi' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setEmiOption('emi')}
              >
                Pay with EMI
              </Button>
            </Box>
            {emiOption === 'emi' && (
              <Box mt={2}>
                <Typography>Select EMI Plan:</Typography>
                <Select
                  value={emiMonths}
                  onChange={e => setEmiMonths(Number(e.target.value))}
                  sx={{ ml: 2, minWidth: 80 }}
                >
                  {emiPlans.map(months => (
                    <MenuItem key={months} value={months}>{months} months</MenuItem>
                  ))}
                </Select>
                <Typography mt={1}>
                  Monthly EMI: <b>₹{calculateEMIMonthly(calculateTotal(), emiMonths).toLocaleString()}</b>
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );

  const renderPayment = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Payment Method
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <PaymentMethodCard
            selected={bookingDetails.paymentMethod === 'card'}
            onClick={() => setBookingDetails({ ...bookingDetails, paymentMethod: 'card' })}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <CreditCardIcon color="primary" />
              <Typography>Credit Card</Typography>
            </Box>
          </PaymentMethodCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <PaymentMethodCard
            selected={bookingDetails.paymentMethod === 'bank'}
            onClick={() => setBookingDetails({ ...bookingDetails, paymentMethod: 'bank' })}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <AccountBalanceIcon color="primary" />
              <Typography>Bank Transfer</Typography>
            </Box>
          </PaymentMethodCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <PaymentMethodCard
            selected={bookingDetails.paymentMethod === 'upi'}
            onClick={() => setBookingDetails({ ...bookingDetails, paymentMethod: 'upi' })}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <LocalAtmIcon color="primary" />
              <Typography>UPI</Typography>
            </Box>
          </PaymentMethodCard>
        </Grid>
      </Grid>

      {bookingDetails.paymentMethod === 'card' && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Card Number"
              value={paymentDetails.cardNumber}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Expiry Date"
              value={paymentDetails.expiryDate}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
              placeholder="MM/YY"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="CVV"
              value={paymentDetails.cvv}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
              type="password"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name on Card"
              value={paymentDetails.name}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, name: e.target.value })}
            />
          </Grid>
        </Grid>
      )}

      {bookingDetails.paymentMethod === 'bank' && (
        <Box>
          <Typography variant="body1" gutterBottom>
            Please use the following bank details for the transfer:
          </Typography>
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography><strong>Bank:</strong> Example Bank</Typography>
            <Typography><strong>Account Number:</strong> 1234567890</Typography>
            <Typography><strong>IFSC Code:</strong> EXMP0001234</Typography>
            <Typography><strong>Account Name:</strong> Travel App</Typography>
          </Paper>
        </Box>
      )}

      {bookingDetails.paymentMethod === 'upi' && (
        <Box>
          <Typography variant="body1" gutterBottom>
            Scan the QR code or use the UPI ID below:
          </Typography>
          <Paper sx={{ p: 2, mt: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">travelapp@upi</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              (QR code placeholder)
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );

  const renderConfirmation = () => (
    <Box textAlign="center">
      <Box sx={{ color: 'success.main', mb: 2 }}>
        <PaymentIcon sx={{ fontSize: 60 }} />
      </Box>
      <Typography variant="h5" gutterBottom>
        Booking Confirmed!
      </Typography>
      <Typography color="text.secondary" paragraph>
        Thank you for booking with us. Your trip details have been sent to your email.
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Booking Summary
        </Typography>
        <Box sx={{ textAlign: 'left' }}>
          <Typography><strong>From:</strong> {bookingDetails.from}</Typography>
          <Typography><strong>To:</strong> {bookingDetails.to}</Typography>
          <Typography><strong>Dates:</strong> {bookingDetails.departureDate?.toLocaleDateString()} - {bookingDetails.returnDate?.toLocaleDateString()}</Typography>
          <Typography><strong>Travelers:</strong> {bookingDetails.travelers}</Typography>
          <Typography><strong>Transport:</strong> {bookingDetails.transportMode}</Typography>
          <Typography><strong>Accommodation:</strong> {bookingDetails.accommodation}</Typography>
          <Typography><strong>Total Amount:</strong> ₹{calculateTotal().toLocaleString()}</Typography>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mt: 4, mb: 2 }}>
        {activeStep === steps.length ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              All steps completed
            </Typography>
            <Button onClick={handleReset} variant="contained" color="primary">
              Start New Booking
            </Button>
          </Box>
        ) : (
          <Box>
            {getStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => {
                  console.log('Button clicked directly');
                  handleNext(e);
                }}
                disabled={isNextDisabled()}
                sx={{
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                    color: 'rgba(0, 0, 0, 0.26)'
                  },
                  '&:not(.Mui-disabled)': {
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0'
                    }
                  },
                  cursor: 'pointer',
                  pointerEvents: 'auto'
                }}
              >
                {activeStep === steps.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TravelBooking; 