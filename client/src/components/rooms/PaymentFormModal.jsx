'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

// Initial state now uses strings for inputs to allow them to be empty
const getInitialState = () => ({
  paidAmount: '',
  paidOn: new Date().toISOString().split('T')[0],
  mode: 'Cash', // Default mode is now Cash
  notes: '',
  lightReading: { previous: '', current: '', ratePerUnit: '13' },
});

export default function PaymentFormModal({ open, onClose, onSave, rentAmount, month }) {
  const [formData, setFormData] = useState(getInitialState());
  const [lightBill, setLightBill] = useState(0);
  const [totalAmount, setTotalAmount] = useState(rentAmount);

  useEffect(() => {
    // Convert strings to numbers for calculation, with fallbacks
    const previous = Number(formData.lightReading.previous) || 0;
    const current = Number(formData.lightReading.current) || 0;
    const ratePerUnit = Number(formData.lightReading.ratePerUnit) || 0;

    const units = current - previous;
    const bill = units > 0 ? units * ratePerUnit : 0;
    setLightBill(bill);
    setTotalAmount(rentAmount + bill);
  }, [formData.lightReading, rentAmount]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleReadingChange = (e) => {
    const { name, value } = e.target;
    // Only allow numeric input
    if (value === '' || /^[0-9\b]+$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        lightReading: { ...prev.lightReading, [name]: value },
      }));
    }
  };

  const handleSave = () => {
    if (!formData.paidAmount || Number(formData.paidAmount) <= 0) {
      alert('Please enter a valid amount paid.');
      return;
    }
    if (!formData.paidOn) {
      alert('Please select a payment date.');
      return;
    }

    const finalPayload = {
      ...formData,
      month,
      rentAmount,
      lightBillAmount: lightBill,
      totalAmount,
      paidAmount: Number(formData.paidAmount),
      lightReading: {
        previous: Number(formData.lightReading.previous) || 0,
        current: Number(formData.lightReading.current) || 0,
        ratePerUnit: Number(formData.lightReading.ratePerUnit) || 0,
      },
    };
    onSave(finalPayload);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  // Reset state when the modal is closed/re-opened
  useEffect(() => {
    if (!open) {
      setFormData(getInitialState());
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Payment for {month}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Light Bill Calculation */}
          <Grid item xs={12}>
            <Typography variant="h6">Electricity Bill</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Previous Reading"
              name="previous"
              type="number"
              value={formData.lightReading.previous}
              onChange={handleReadingChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Current Reading"
              name="current"
              type="number"
              value={formData.lightReading.current}
              onChange={handleReadingChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Rate per Unit (₹)"
              name="ratePerUnit"
              type="number"
              value={formData.lightReading.ratePerUnit}
              onChange={handleReadingChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Payment Summary */}
          <Grid item xs={12}>
            <Typography>Rent Amount: ₹{rentAmount.toLocaleString()}</Typography>
            <Typography>Calculated Light Bill: ₹{lightBill.toLocaleString()}</Typography>
            <Typography variant="h6">Total Due: ₹{totalAmount.toLocaleString()}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Payment Details */}
          <Grid item xs={12}>
            <Typography variant="h6">Payment Details</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              required
              label="Amount Paid (₹)"
              name="paidAmount"
              type="number"
              value={formData.paidAmount}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              required
              label="Payment Date"
              name="paidOn"
              type="date"
              value={formData.paidOn}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="mode-select-label">Mode</InputLabel>
              <Select
                labelId="mode-select-label"
                id="mode-select"
                name="mode"
                value={formData.mode}
                label="Mode"
                onChange={handleChange}
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant='outlined' color='error'>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!formData.paidAmount || Number(formData.paidAmount) <= 0}
        >
          Save Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
}