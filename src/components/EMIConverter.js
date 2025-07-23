import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, MenuItem, Typography, Box, Grid, InputAdornment } from '@mui/material';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import { useTheme } from '@mui/material/styles';
import jsPDF from 'jspdf';

// Placeholder partner data
const partners = [
  { name: 'Bajaj', logo: process.env.PUBLIC_URL + '/images1recomendtions/bajaj.png' },
  { name: 'TVS', logo: process.env.PUBLIC_URL + '/images1recomendtions/tvs.png' },
  // Add more partners as needed
];

const MIN_AMOUNT = 5000;
const EMI_MONTHS = [3, 6, 9, 12];

// Define interest rates for each tenure (can be partner-specific in future)
const EMI_OPTIONS = [
  { months: 3, interestRate: 0.08 },   // 8% per annum
  { months: 6, interestRate: 0.10 },   // 10% per annum
  { months: 8, interestRate: 0.11 },   // 11% per annum
  { months: 12, interestRate: 0.12 },  // 12% per annum
];

// Partner-specific EMI options
const PARTNER_EMI_OPTIONS = {
  Bajaj: [
    { months: 3, interestRate: 0.08 },
    { months: 6, interestRate: 0.10 },
    { months: 8, interestRate: 0.11 },
    { months: 12, interestRate: 0.12 },
  ],
  TVS: [
    { months: 3, interestRate: 0.075 },
    { months: 6, interestRate: 0.095 },
    { months: 8, interestRate: 0.105 },
    { months: 12, interestRate: 0.115 },
  ],
};

// Utility to calculate EMI, total interest, and total payable
function calculateEMI(principal, months, annualRate) {
  const monthlyRate = annualRate / 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayable = emi * months;
  const totalInterest = totalPayable - principal;
  return {
    emi: emi || 0,
    totalPayable: totalPayable || 0,
    totalInterest: totalInterest || 0,
  };
}

const EMIConverter = ({ open, onClose }) => {
  const [amount, setAmount] = useState('');
  const [partner, setPartner] = useState(partners[0].name);
  const [error, setError] = useState('');
  const [customTenure, setCustomTenure] = useState('');
  const [selectedTenure, setSelectedTenure] = useState(null);
  const theme = useTheme();

  // PDF download handler
  const handleDownloadPDF = () => {
    if (!amount || Number(amount) < MIN_AMOUNT) return;
    const principal = Number(amount);
    let baseOptions = PARTNER_EMI_OPTIONS[partner] || EMI_OPTIONS;
    let allOptions = [...baseOptions];
    const customMonths = Number(customTenure);
    if (
      customTenure &&
      !isNaN(customMonths) &&
      customMonths >= 3 &&
      customMonths <= 24 &&
      !baseOptions.some(opt => opt.months === customMonths)
    ) {
      allOptions = [...allOptions, { months: customMonths, interestRate: 0.12 }];
      allOptions = allOptions.sort((a, b) => a.months - b.months);
    }
    
    const doc = new jsPDF();
    
    // Header with gradient-like effect
    doc.setFillColor(37, 99, 235); // Blue background
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('EMI Calculator', 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Travel Finance Solutions', 105, 28, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Basic info section
    doc.setFillColor(248, 250, 252); // Light gray background
    doc.rect(10, 35, 190, 25, 'F');
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Loan Details', 15, 45);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Principal Amount: ₹${principal.toLocaleString()}`, 15, 55);
    doc.text(`Finance Partner: ${partner}`, 120, 55);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 65);
    
    // EMI Comparison Table
    let y = 75;
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('EMI Comparison Table', 15, y);
    y += 8;
    
    // Table header with background
    doc.setFillColor(37, 99, 235);
    doc.rect(10, y, 190, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Tenure', 15, y + 8);
    doc.text('Interest Rate', 45, y + 8);
    doc.text('EMI/Month', 75, y + 8);
    doc.text('Total Interest', 115, y + 8);
    doc.text('Total Payable', 155, y + 8);
    
    // Table rows
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    y += 15;
    
    allOptions.forEach((opt, index) => {
      const { emi, totalPayable, totalInterest } = calculateEMI(principal, opt.months, opt.interestRate);
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(10, y - 3, 190, 12, 'F');
      }
      
      doc.setFontSize(10);
      doc.text(`${opt.months} months`, 15, y + 5);
      doc.text(`${(opt.interestRate * 100).toFixed(1)}%`, 45, y + 5);
      doc.text(`₹${emi.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 75, y + 5);
      doc.text(`₹${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 115, y + 5);
      doc.text(`₹${totalPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 155, y + 5);
      
      y += 12;
    });
    
    // Selected Plan Details (if any)
    if (selectedTenure) {
      y += 10;
      doc.setFillColor(224, 231, 255); // Light blue background
      doc.rect(10, y, 190, 35, 'F');
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Selected Plan Details', 15, y + 8);
      
      const opt = allOptions.find(o => o.months === selectedTenure);
      const { emi, totalPayable, totalInterest } = calculateEMI(principal, opt.months, opt.interestRate);
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`Tenure: ${opt.months} months`, 15, y + 18);
      doc.text(`Interest Rate: ${(opt.interestRate * 100).toFixed(1)}%`, 100, y + 18);
      doc.text(`Monthly EMI: ₹${emi.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 15, y + 28);
      doc.text(`Total Interest: ₹${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 100, y + 28);
      doc.text(`Total Payable: ₹${totalPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 15, y + 38);
      
      y += 45;
    }
    
    // Prepayment Info
    y += 5;
    doc.setFillColor(255, 251, 230); // Light yellow background
    doc.rect(10, y, 190, 20, 'F');
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(245, 158, 11); // Orange text
    doc.text('Prepayment/Foreclosure Information', 15, y + 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    const prepaymentText = partner === 'Bajaj' 
      ? 'No charges for Bajaj Finance.'
      : partner === 'TVS' 
      ? 'TVS Finance charges 2% of outstanding principal.'
      : 'Please check with your finance partner for prepayment charges.';
    doc.text(prepaymentText, 15, y + 18);
    
    // Footer
    y += 30;
    doc.setDrawColor(200, 200, 200);
    doc.line(10, y, 200, y);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer-generated document. Please verify all details with your finance partner.', 105, y + 8, { align: 'center' });
    doc.text('Generated by Travel App EMI Calculator', 105, y + 15, { align: 'center' });
    
    doc.save('emi_comparison.pdf');
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value.replace(/[^0-9]/g, ''));
    setError('');
  };

  const handlePartnerChange = (e) => {
    setPartner(e.target.value);
  };

  const isValid = () => {
    if (!amount || Number(amount) < MIN_AMOUNT) {
      setError(`Minimum amount is ₹${MIN_AMOUNT}`);
      return false;
    }
    setError('');
    return true;
  };

  // Enhanced renderEMIOptions with custom tenure and styles
  const renderEMIOptions = () => {
    if (!amount || Number(amount) < MIN_AMOUNT) return null;
    const principal = Number(amount);
    // Use partner-specific options
    let baseOptions = PARTNER_EMI_OPTIONS[partner] || EMI_OPTIONS;
    let allOptions = [...baseOptions];
    const customMonths = Number(customTenure);
    if (
      customTenure &&
      !isNaN(customMonths) &&
      customMonths >= 3 &&
      customMonths <= 24 &&
      !baseOptions.some(opt => opt.months === customMonths)
    ) {
      // Use 12% as default for custom, or you can make this dynamic per partner
      allOptions = [...allOptions, { months: customMonths, interestRate: 0.12 }];
      allOptions = allOptions.sort((a, b) => a.months - b.months);
    }
    return (
      <Box mt={3}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          EMI Comparison Table
        </Typography>
        <Box mb={2}>
          <TextField
            label="Custom Tenure (months)"
            type="number"
            size="small"
            value={customTenure}
            onChange={e => setCustomTenure(e.target.value.replace(/[^0-9]/g, ''))}
            inputProps={{ min: 3, max: 24 }}
            sx={{ width: 220, background: '#f3f6fa', borderRadius: 2 }}
            helperText="Enter 3–24 months"
          />
        </Box>
        <Box sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: 3,
          background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)',
        }}>
          <Grid container spacing={0} sx={{ fontWeight: 700, bgcolor: 'primary.light', color: 'primary.contrastText', py: 1 }}>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>Tenure</Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>Interest Rate</Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>EMI/Month</Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>Total Interest</Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>Total Payable</Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>Select</Grid>
          </Grid>
          {allOptions.map(opt => {
            const { emi, totalPayable, totalInterest } = calculateEMI(principal, opt.months, opt.interestRate);
            const isSelected = selectedTenure === opt.months;
            return (
              <Grid
                container
                spacing={0}
                key={opt.months}
                alignItems="center"
                sx={{
                  bgcolor: isSelected ? 'secondary.light' : 'transparent',
                  color: isSelected ? 'secondary.contrastText' : 'inherit',
                  transition: 'background 0.2s',
                  borderBottom: '1px solid #e0e7ef',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'secondary.lighter' },
                  py: 1.2,
                }}
                onClick={() => setSelectedTenure(opt.months)}
              >
                <Grid item xs={2} sx={{ textAlign: 'center' }}><Typography>{opt.months} mo</Typography></Grid>
                <Grid item xs={2} sx={{ textAlign: 'center' }}><Typography>{(opt.interestRate * 100).toFixed(1)}%</Typography></Grid>
                <Grid item xs={2} sx={{ textAlign: 'center' }}><Typography>₹{emi.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography></Grid>
                <Grid item xs={2} sx={{ textAlign: 'center' }}><Typography>₹{totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography></Grid>
                <Grid item xs={2} sx={{ textAlign: 'center' }}><Typography>₹{totalPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography></Grid>
                <Grid item xs={2} sx={{ textAlign: 'center' }}>
                  <Button
                    variant={isSelected ? 'contained' : 'outlined'}
                    color={isSelected ? 'secondary' : 'primary'}
                    size="small"
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                    onClick={e => { e.stopPropagation(); setSelectedTenure(opt.months); }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </Grid>
              </Grid>
            );
          })}
        </Box>
        {selectedTenure && (
          <Box mt={3} p={2} sx={{ borderRadius: 2, background: 'linear-gradient(90deg, #e0e7ff 60%, #f8fafc 100%)', boxShadow: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} color="secondary.main" gutterBottom>
              Selected Plan Details
            </Typography>
            {(() => {
              const opt = allOptions.find(o => o.months === selectedTenure);
              const { emi, totalPayable, totalInterest } = calculateEMI(principal, opt.months, opt.interestRate);
              return (
                <Grid container spacing={2}>
                  <Grid item xs={4}><Typography>Tenure: <b>{opt.months} months</b></Typography></Grid>
                  <Grid item xs={4}><Typography>Interest Rate: <b>{(opt.interestRate * 100).toFixed(1)}%</b></Typography></Grid>
                  <Grid item xs={4}><Typography>EMI: <b>₹{emi.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></Typography></Grid>
                  <Grid item xs={6}><Typography>Total Interest: <b>₹{totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></Typography></Grid>
                  <Grid item xs={6}><Typography>Total Payable: <b>₹{totalPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></Typography></Grid>
                </Grid>
              );
            })()}
          </Box>
        )}
        {/* Prepayment/Foreclosure Info */}
        <Box mt={3} p={2} sx={{ borderRadius: 2, background: '#fffbe6', boxShadow: 1, border: '1px solid #ffe082' }}>
          <Typography variant="body2" color="warning.main" fontWeight={600}>
            Prepayment/Foreclosure: {partner === 'Bajaj' ? 'No charges for Bajaj.' : partner === 'TVS' ? 'TVS charges 2% of outstanding principal.' : 'Please check with your finance partner for charges.'}
          </Typography>
        </Box>
        {/* Download PDF Button */}
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadPDF}
            disabled={!amount || Number(amount) < MIN_AMOUNT}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Download PDF
          </Button>
        </Box>
      </Box>
    );
  };

  const selectedPartner = partners.find(p => p.name === partner);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{
        background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)',
        borderRadius: 3,
        boxShadow: 4,
        p: 0,
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 5,
          py: 3,
          background: 'linear-gradient(90deg, #2563eb 30%, #7c3aed 90%)',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}>
          <CreditScoreIcon sx={{ color: 'white', fontSize: 44 }} />
          <Typography variant="h4" fontWeight={700} color="white">EMI Calculator</Typography>
        </Box>
        <DialogContent sx={{ p: 5, minWidth: 500, maxWidth: 800, mx: 'auto' }}>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Enter Amount"
              value={amount}
              onChange={handleAmountChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { inputMode: 'numeric', pattern: '[0-9]*' },
              }}
              error={!!error}
              helperText={error || `Minimum amount: ₹${MIN_AMOUNT}`}
              fullWidth
            />
            <TextField
              select
              label="Select EMI Partner"
              value={partner}
              onChange={handlePartnerChange}
              fullWidth
            >
              {partners.map((p) => (
                <MenuItem key={p.name} value={p.name}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <img src={p.logo} alt={p.name} width={32} height={32} style={{ borderRadius: 4 }} />
                    {p.name}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Typography variant="body2">Finance Partner:</Typography>
              <img src={selectedPartner.logo} alt={selectedPartner.name} width={48} height={48} style={{ borderRadius: 6 }} />
              <Typography variant="subtitle2">{selectedPartner.name}</Typography>
            </Box>
            {renderEMIOptions()}
            <Button onClick={onClose} variant="outlined" color="primary" sx={{ mt: 2, fontWeight: 600, borderRadius: 2 }}>Close</Button>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default EMIConverter; 