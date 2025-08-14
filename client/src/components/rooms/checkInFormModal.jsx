'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const initialFamilyState = {
  head: { name: '', aadhar: '', mobile: '' },
  members: [],
  checkInDate: new Date().toISOString().split('T')[0], // Defaults to today
  advancePaid: 0,
  notes: '',
};

export default function CheckInFormModal({ open, onClose, onSave }) {
  const [family, setFamily] = useState(initialFamilyState);

  const handleHeadChange = (e) => {
    const { name, value } = e.target;
    setFamily((prev) => ({
      ...prev,
      head: { ...prev.head, [name]: value },
    }));
  };

  const handleMemberChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMembers = [...family.members];
    updatedMembers[index] = { ...updatedMembers[index], [name]: value };
    setFamily((prev) => ({ ...prev, members: updatedMembers }));
  };

  const addMember = () => {
    setFamily((prev) => ({
      ...prev,
      members: [...prev.members, { name: '', aadhar: '', mobile: '' }],
    }));
  };

  const removeMember = (index) => {
    const updatedMembers = family.members.filter((_, i) => i !== index);
    setFamily((prev) => ({ ...prev, members: updatedMembers }));
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setFamily((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(family);
    handleClose();
  };

  const handleClose = () => {
    setFamily(initialFamilyState); // Reset state on close
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Check-in New Resident</DialogTitle>
      <DialogContent>
        {/* Head of Family Section */}
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Head of Family
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              required
              label="Full Name"
              name="name"
              value={family.head.name}
              onChange={handleHeadChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              required
              label="Aadhar Number"
              name="aadhar"
              value={family.head.aadhar}
              onChange={handleHeadChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobile"
              value={family.head.mobile}
              onChange={handleHeadChange}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Other Members Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Other Family Members</Typography>
          <Button startIcon={<AddCircleOutlineIcon />} onClick={addMember}>
            Add Member
          </Button>
        </Box>
        {family.members.map((member, index) => (
          <Grid container spacing={2} key={index} sx={{ mt: 1, alignItems: 'center' }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={member.name}
                onChange={(e) => handleMemberChange(index, e)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Aadhar Number"
                name="aadhar"
                value={member.aadhar}
                onChange={(e) => handleMemberChange(index, e)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobile"
                value={member.mobile}
                onChange={(e) => handleMemberChange(index, e)}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <IconButton onClick={() => removeMember(index)} color="error">
                <RemoveCircleOutlineIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Divider sx={{ my: 3 }} />

        {/* Check-in Details Section */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Check-in Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Check-in Date"
              name="checkInDate"
              type="date"
              value={family.checkInDate}
              onChange={handleGeneralChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Advance Paid (₹)"
              name="advancePaid"
              type="number"
              value={family.advancePaid}
              onChange={handleGeneralChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notes"
              name="notes"
              value={family.notes}
              onChange={handleGeneralChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant='outlined' color='error'>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save and Check-in
        </Button>
      </DialogActions>
    </Dialog>
  );
}
