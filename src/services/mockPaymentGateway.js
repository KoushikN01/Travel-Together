// Mock Payment Gateway Service
// Simulates card, UPI, bank, and EMI payments with random success/failure, delays, and transaction IDs

function randomDelay(min = 1000, max = 2500) {
  return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
}

function generateTransactionId() {
  return 'TXN' + Date.now() + Math.floor(Math.random() * 10000);
}

function randomSuccess(prob = 0.9) {
  return Math.random() < prob;
}

export async function processCardPayment({ amount, cardNumber, expiryDate, cvv, name }) {
  console.log('[MockGateway] processCardPayment called', { amount, cardNumber, expiryDate, cvv, name });
  await randomDelay();
  if (!cardNumber || !expiryDate || !cvv || !name) {
    throw new Error('Invalid card details');
  }
  if (randomSuccess()) {
    return {
      status: 'success',
      transactionId: generateTransactionId(),
      message: 'Payment successful via card.'
    };
  } else {
    throw new Error('Card payment failed. Please try again.');
  }
}

export async function processUPIPayment({ amount, upiId }) {
  console.log('[MockGateway] processUPIPayment called', { amount, upiId });
  await randomDelay();
  if (!upiId) {
    throw new Error('Invalid UPI ID');
  }
  if (randomSuccess()) {
    return {
      status: 'success',
      transactionId: generateTransactionId(),
      message: 'Payment successful via UPI.'
    };
  } else {
    throw new Error('UPI payment failed. Please try again.');
  }
}

export async function processBankPayment({ amount, bankAccount, ifscCode }) {
  console.log('[MockGateway] processBankPayment called', { amount, bankAccount, ifscCode });
  await randomDelay();
  if (!bankAccount || !ifscCode) {
    throw new Error('Invalid bank details');
  }
  if (randomSuccess()) {
    return {
      status: 'success',
      transactionId: generateTransactionId(),
      message: 'Payment successful via bank transfer.'
    };
  } else {
    throw new Error('Bank transfer failed. Please try again.');
  }
}

export async function processEMIPayment({ amount, bankAccount, ifscCode, months }) {
  console.log('[MockGateway] processEMIPayment called', { amount, bankAccount, ifscCode, months });
  await randomDelay(1500, 3000);
  if (!bankAccount || !ifscCode || !months) {
    throw new Error('Invalid EMI details');
  }
  // Simulate EMI approval (80% chance)
  if (randomSuccess(0.8)) {
    return {
      status: 'approved',
      transactionId: generateTransactionId(),
      message: `EMI approved for ${months} months.`
    };
  } else {
    throw new Error('EMI application rejected by bank.');
  }
} 