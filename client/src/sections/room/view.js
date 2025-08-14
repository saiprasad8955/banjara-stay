'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Box,
  Snackbar,
} from '@mui/material';
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';
import RoomFormModal from 'src/components/rooms/RoomFormModal';
import RoomCard from 'src/components/rooms/RoomCard';
import axiosInstance, { endpoints } from 'src/utils/axios';

export default function RoomsView() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // NEW: State to manage the snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // can be 'success', 'error', 'warning', 'info'
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(endpoints.room.list);
      setRooms(response.data);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to fetch rooms.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleAddRoom = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleSaveRoom = async (roomData) => {
    const isEditing = !!editingRoom;
    const url = isEditing ? endpoints.room.update(editingRoom._id) : endpoints.room.add;
    const method = isEditing ? 'put' : 'post';

    try {
      await axiosInstance[method](url, roomData);
      setSnackbar({
        open: true,
        message: `Room ${isEditing ? 'updated' : 'added'} successfully!`,
        severity: 'success',
      });
      fetchRooms(); // Refresh the list
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || `Failed to ${isEditing ? 'update' : 'add'} the room.`,
        severity: 'error',
      });
    }
  };

  // UPDATED: handleDeleteRoom now triggers a snackbar on success or error
  const handleDeleteRoom = async (roomId) => {
    try {
      await axiosInstance.delete(endpoints.room.delete(roomId));
      setSnackbar({ open: true, message: 'Room deleted successfully!', severity: 'success' });
      // Update state immediately for a responsive UI
      setRooms((prevRooms) => prevRooms.filter((room) => room._id !== roomId));
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete the room.',
        severity: 'error',
      });
    }
  };

  // NEW: Handler to close the snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            Rooms
          </Typography>
          <Button variant="contained" startIcon={<AddHomeWorkIcon />} onClick={handleAddRoom}>
            Add New Room
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && (
          <Grid container spacing={3}>
            {rooms.length > 0
              ? rooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    onEdit={handleEditRoom}
                    onDelete={handleDeleteRoom}
                  />
                ))
              : // Display this only if not loading and there are no rooms
                !loading && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 3 }}>
                      No rooms have been added yet. Please add one to get started.
                    </Alert>
                  </Grid>
                )}
          </Grid>
        )}
      </Container>

      <RoomFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRoom}
        initialData={editingRoom}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
