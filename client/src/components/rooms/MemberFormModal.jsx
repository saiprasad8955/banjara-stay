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
} from '@mui/material';

export default function MemberFormModal({ open, onClose, onSave, member }) {
  const [formData, setFormData] = useState({
    name: '',
    aadhar: '',
    mobile: '',
  });

  const isEditing = !!member;

  useEffect(() => {
    // When the modal opens for editing, populate the form with the member's data.
    // Otherwise, reset the form for a new entry.
    if (isEditing) {
      setFormData({
        name: member.name || '',
        aadhar: member.aadhar || '',
        mobile: member.mobile || '',
      });
    } else {
      setFormData({ name: '', aadhar: '', mobile: '' });
    }
  }, [member, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Pass the form data up to the parent component to handle the state update.
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Family Member' : 'Add New Family Member'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Aadhar Number"
              name="aadhar"
              value={formData.aadhar}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}