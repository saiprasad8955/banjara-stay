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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const defaultState = {
  number: '',
  floor: '',
  type: '',
  rent: '',
  status: 'Available',
  notes: '',
};

export default function RoomFormModal({ open, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState(defaultState);

  const isEditing = !!initialData;

  // UPDATED: Added 'open' to the dependency array
  useEffect(() => {
    if (isEditing) {
      setFormData({
        number: initialData.number || '',
        floor: initialData.floor || '',
        type: initialData.type || '',
        rent: initialData.rent || '',
        status: initialData.status || 'Available',
        notes: initialData.notes || '',
      });
    } else {
      // If opening for 'add', ensure form is reset
      setFormData(defaultState);
    }
  }, [initialData, isEditing, open]); // ✅ ADD 'open' HERE

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.number || !formData.floor || !formData.type || !formData.rent) {
      alert('Please fill out all required fields.');
      return;
    }
    onSave({ ...formData, rent: Number(formData.rent) });
    handleClose();
  };

  const handleClose = () => {
    onClose();
    // No need to reset state here anymore, as the useEffect handles it when 'open' changes.
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Room Details' : 'Add a New Room'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Room Number"
              name="number"
              value={formData.number}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Floor"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Room Type (e.g., 1BHK)"
              name="type"
              value={formData.type}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Monthly Rent"
              name="rent"
              type="number"
              value={formData.rent}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                id="status-select"
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleChange}
                disabled={!isEditing}
              >
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Occupied">Occupied</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={handleClose} variant='outlined' color='error'>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
