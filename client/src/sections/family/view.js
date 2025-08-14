'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Pagination,
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { alpha } from '@mui/material/styles';

import axiosInstance, { endpoints } from 'src/utils/axios';
import FamilyFormModal from 'src/components/family/FamilyFormModal';

// Action Menu for each table row
function RowActions({ onEdit, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleEdit = () => {
    onEdit();
    handleCloseMenu();
  };

  const handleDelete = () => {
    onDelete();
    handleCloseMenu();
  };

  return (
    <>
      <IconButton onClick={handleOpenMenu}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

export default function FamiliesView() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);

  const fetchFamilies = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(endpoints.family.list, {
        params: { page, limit: 10 },
      });
      setFamilies(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch families.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  const handlePageChange = (event, value) => {
    fetchFamilies(value);
  };

  const handleOpenModal = (family = null) => {
    setEditingFamily(family);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingFamily(null);
    setIsModalOpen(false);
  };

  const handleSaveFamily = async (familyData, familyId) => {
    const isEditing = !!familyId;
    const url = isEditing ? endpoints.family.update(familyId) : endpoints.family.create;
    const method = isEditing ? 'put' : 'post';

    try {
      await axiosInstance[method](url, familyData);
      setSnackbar({
        open: true,
        message: `Family ${isEditing ? 'updated' : 'added'} successfully.`,
        severity: 'success',
      });
      fetchFamilies(pagination.page);
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to save family: ${error.message}`,
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this family record?')) return;
    try {
      await axiosInstance.delete(endpoints.family.delete(id));
      setSnackbar({ open: true, message: 'Family deleted successfully.', severity: 'success' });
      fetchFamilies(pagination.page);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete family.', severity: 'error' });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            Families
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
            Add New Family
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ borderRadius: 2, boxShadow: (theme) => theme.shadows[4] }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12) }}>
                  <TableRow>
                    <TableCell>Sr.No</TableCell>
                    <TableCell>Head Name</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Aadhar</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Check-in Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {families.map((family, i) => (
                    <TableRow
                      key={family._id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{family.head.name}</Typography>
                      </TableCell>
                      <TableCell>{family.roomId?.number || 'N/A'}</TableCell>
                      <TableCell>{family.head.aadhar}</TableCell>
                      <TableCell>{family.head.mobile}</TableCell>
                      <TableCell>{new Date(family.checkInDate).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <RowActions
                          onEdit={() => handleOpenModal(family)}
                          onDelete={() => handleDelete(family._id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <FamilyFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveFamily}
        initialData={editingFamily}
      />
    </>
  );
}
