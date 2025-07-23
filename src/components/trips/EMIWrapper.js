import React, { useState } from 'react';
import TravelBooking from './TravelBooking';
import { Box, Button, Typography, Paper, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Select, MenuItem } from '@mui/material';

const EMIWrapper = ({ onBookingComplete, prefillData, onClose }) => {
  const [emiSelected, setEmiSelected] = useState(null);
  const [emiMonths, setEmiMonths] = useState(3);

  // Example EMI plans
  const emiPlans = [3, 6, 9, 12];

  if (emiSelected === null) {
    return (
      <Box sx={{ p: 4, maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Choose Payment Option</Typography>
        <Paper sx={{ p: 2, mb: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">How would you like to pay?</FormLabel>
            <RadioGroup
              aria-label="emi"
              name="emi"
              value={emiSelected === null ? '' : emiSelected ? 'emi' : 'full'}
              onChange={e => setEmiSelected(e.target.value === 'emi')}
            >
              <FormControlLabel value="full" control={<Radio />} label="Pay Full Amount" />
              <FormControlLabel value="emi" control={<Radio />} label="Pay with EMI" />
            </RadioGroup>
          </FormControl>
        </Paper>
        <Button variant="contained" color="primary" disabled={emiSelected === null} onClick={() => {}}>
          Continue
        </Button>
      </Box>
    );
  }

  // If EMI selected, show EMI plan selection
  if (emiSelected) {
    return (
      <Box sx={{ p: 4, maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Select EMI Plan</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select
            value={emiMonths}
            onChange={e => setEmiMonths(Number(e.target.value))}
          >
            {emiPlans.map(months => (
              <MenuItem key={months} value={months}>{months} months</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={() => setEmiSelected('final')}>Proceed</Button>
      </Box>
    );
  }

  // Pass EMI info to TravelBooking
  return (
    <TravelBooking
      onBookingComplete={onBookingComplete}
      prefillData={prefillData}
      emiOption={emiSelected === 'final' ? { emi: true, months: emiMonths } : { emi: false }}
      onClose={onClose}
    />
  );
};

export default EMIWrapper; 