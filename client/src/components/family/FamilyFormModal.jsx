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
  Box,
  Typography,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import axiosInstance, { endpoints } from 'src/utils/axios';

const getInitialState = () => ({
  head: { name: '', aadhar: '', mobile: '' },
  members: [],
  checkInDate: new Date().toISOString().split('T')[0],
  notes: '',
  roomId: '',
});

export default function FamilyFormModal({ open, onClose, onSave, initialData }) {
  const [family, setFamily] = useState(getInitialState());
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const isEditing = !!initialData;

  useEffect(() => {
    const fetchRooms = async () => {
      if (open && !isEditing) {
        setLoadingRooms(true);
        try {
          const response = await axiosInstance.get(endpoints.room.list);
          const available = response.data.filter(
            (room) => room._id === initialData?.roomId?._id || room.status === 'Available'
          );
          setAvailableRooms(available);
        } catch (error) {
          console.error('Failed to fetch rooms:', error);
        } finally {
          setLoadingRooms(false);
        }
      }
    };

    fetchRooms();
  }, [open, isEditing]);

  useEffect(() => {
    if (isEditing && initialData) {
      setFamily({
        head: initialData.head || { name: '', aadhar: '', mobile: '' },
        members: initialData.members || [],
        checkInDate: initialData.checkInDate
          ? new Date(initialData.checkInDate).toISOString().split('T')[0]
          : '',
        notes: initialData.notes || '',
        roomId: initialData.roomId?._id || initialData.roomId || '',
      });

      if (initialData.roomId) {
        // Ensure the current room is in the list for display purposes when editing
        setAvailableRooms([initialData.roomId]);
      }
    }
  }, [initialData, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFamily((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeadChange = (e) => {
    const { name, value } = e.target;
    setFamily((prev) => ({ ...prev, head: { ...prev.head, [name]: value } }));
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

  const handleSave = () => {
    if (!family.head.name || !family.head.aadhar || !family.checkInDate || !family.roomId) {
      alert(
        'Please fill in all required fields: Head Name, Aadhar, Check-in Date, and select a Room.'
      );
      return;
    }
    onSave(family, isEditing ? initialData._id : null);
    onClose();
  };

  const handleClose = () => {
    setFamily(getInitialState());
    setAvailableRooms([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Family Details' : 'Add New Family'}</DialogTitle>
      <DialogContent>
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

        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Additional Details
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
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required disabled={isEditing}>
              <InputLabel id="room-select-label">Room</InputLabel>
              <Select
                labelId="room-select-label"
                name="roomId"
                value={family.roomId}
                label="Room"
                onChange={handleChange}
              >
                {loadingRooms ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                    <Typography sx={{ ml: 1 }}>Loading rooms...</Typography>
                  </MenuItem>
                ) : availableRooms.length === 0 && !isEditing ? (
                  <MenuItem disabled>No available rooms found.</MenuItem>
                ) : (
                  availableRooms.map((room) => (
                    <MenuItem key={room._id} value={room._id}>
                      {`${room.number} (${room.type}) - ₹${room.rent}`}
                    </MenuItem>
                  ))
                )}
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
              value={family.notes}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant='outlined' color='error'>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
