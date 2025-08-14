'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  Snackbar,
  CardContent,
  Card,
  Collapse,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { useRouter } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@emotion/react';
import * as XLSX from 'xlsx';
import LayersIcon from '@mui/icons-material/Layers'; // For Floor
import BedIcon from '@mui/icons-material/Bed'; // For Type
import LocalAtmIcon from '@mui/icons-material/LocalAtm'; // For Rent
import EventIcon from '@mui/icons-material/Event'; // For the calendar icon

// Import your axios instance, endpoints, and components
import axiosInstance, { endpoints } from 'src/utils/axios';
import MemberFormModal from 'src/components/rooms/MemberFormModal';
import CheckInFormModal from 'src/components/rooms/CheckInFormModal';
import PaymentFormModal from 'src/components/rooms/PaymentFormModal';
import { alpha, styled } from '@mui/material/styles'; // NEW: For styling the expand icon
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Helper function to format the month string 'YYYY-MM' to 'Month YYYY'
const formatMonth = (monthStr) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

// Helper to get chip color based on status
const getStatusChipColor = (status) => {
  switch (status) {
    case 'Paid':
      return 'success';
    case 'Partially Paid':
      return 'warning';
    case 'Overdue':
      return 'error';
    default:
      return 'default';
  }
};

function exportFamilyToExcel(family, roomNumber) {
  const familyData = [
    {
      Role: 'Head',
      Name: family.head.name,
      Aadhar: family.head.aadhar,
      Mobile: family.head.mobile,
    },
    ...(family.members || []).map((member) => ({
      Role: 'Member',
      Name: member.name,
      Aadhar: member.aadhar,
      Mobile: member.mobile || 'N/A',
    })),
  ];
  const worksheet = XLSX.utils.json_to_sheet(familyData);
  const summary = [
    ['Room Number:', roomNumber],
    ['Head of Family:', family.head.name],
    ['Check-in Date:', new Date(family.checkInDate).toLocaleDateString()],
    [
      'Check-out Date:',
      family.checkOutDate
        ? new Date(family.checkOutDate).toLocaleDateString()
        : 'Currently Residing',
    ],
  ];
  XLSX.utils.sheet_add_aoa(worksheet, summary, { origin: 'A7' });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Family Details');
  XLSX.writeFile(workbook, `Room-${roomNumber}_Family-${family.head.name}.xlsx`);
}

// NEW: Create a styled IconButton for the expand animation
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

function FamilyInfoCard({
  family,
  isCurrent,
  roomNumber,
  onCheckOut,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onExport,
}) {
  const head = family.head;
  const theme = useTheme();

  // NEW: State to manage the collapse/expand behavior
  // Current residents are expanded by default, past residents are collapsed
  const [expanded, setExpanded] = useState(isCurrent);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': { transform: 'scale(1.02)', boxShadow: (theme) => theme.shadows[8] },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          bgcolor: (theme) => alpha(theme.palette.primary.light, 0.1),
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          {isCurrent ? 'Current Resident' : 'Past Resident'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* NEW: Expand button and other actions */}
          <IconButton onClick={() => onExport(family, roomNumber)} title="Export to Excel">
            <FileDownloadIcon />
          </IconButton>
          {isCurrent && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={() => onCheckOut(family._id)}
              sx={{ ml: 1 }}
            >
              Check-Out
            </Button>
          )}
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </Box>
      </Box>
      {/* NEW: The Collapse component wraps the detailed content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Head: {head.name}</strong>
              </Typography>
              <Stack spacing={1} mt={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PhoneIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {head.mobile}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <BadgeIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {head.aadhar}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1} mt={2.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <EventAvailableIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Check-in:</strong> {new Date(family.checkInDate).toLocaleDateString()}
                  </Typography>
                </Stack>
                {family.checkOutDate && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <EventBusyIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Check-out:</strong>{' '}
                      {new Date(family.checkOutDate).toLocaleDateString()}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontSize="1.1rem">
              Family Members
            </Typography>
            {isCurrent && (
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => onAddMember(family._id)}
              >
                Add Member
              </Button>
            )}
          </Box>
          <List dense>
            {family.members && family.members.length > 0 ? (
              family.members.map((member, index) => (
                <ListItem
                  key={member._id}
                  disableGutters
                  sx={{
                    bgcolor: index % 2 ? alpha(theme.palette.grey[500], 0.04) : 'transparent',
                    borderRadius: 1,
                    px: 1,
                  }}
                >
                  <ListItemText
                    primary={member.name}
                    secondary={`Aadhar: ${member.aadhar} | Mobile: ${member.mobile || 'N/A'}`}
                  />
                  {isCurrent && (
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => onEditMember(family._id, member)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton edge="end" onClick={() => onDeleteMember(family._id, member._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))
            ) : (
              <Alert severity="info" variant="outlined" sx={{ mt: 1, border: 'none' }}>
                No other members added.
              </Alert>
            )}
          </List>
        </Box>
      </Collapse>
    </Paper>
  );
}

// A small, reusable component for each stat item
function StatItem({ icon, label, value, valueColor = 'text.primary' }) {
  return (
    <Stack
      spacing={1}
      alignItems="center"
      justifyContent="center"
      sx={{ textAlign: 'center', height: '100%' }}
    >
      <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight="bold" color={valueColor}>
        {value}
      </Typography>
    </Stack>
  );
}

export default function RoomDetailPage({ params }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [currentFamilyId, setCurrentFamilyId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [payments, setPayments] = useState([]); // State for payment summaries
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const router = useRouter();

  const fetchPaymentHistory = async (familyId) => {
    if (!familyId) return;
    try {
      // Note: Ensure your endpoints object has a 'payments' method
      const response = await axiosInstance.get(endpoints.family.getPayments(familyId));
      setPayments(response.data.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Could not load payment history.', severity: 'error' });
    }
  };

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(endpoints.room.get(params.id));
      setDetails(response.data.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to fetch room details.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  // In a useEffect, call fetchPaymentHistory after details are loaded
  useEffect(() => {
    const currentResident = details?.families.find((f) => f.isActive);
    if (currentResident) {
      fetchPaymentHistory(currentResident._id);
    }
  }, [details]);

  const handleAddPaymentClick = (monthSummary) => {
    setSelectedMonth(monthSummary.month);
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (paymentData) => {
    const currentResident = details.families.find((f) => f.isActive);
    try {
      await axiosInstance.post(endpoints.payment.create, {
        ...paymentData,
        familyId: currentResident._id,
        roomId: room._id,
      });
      setSnackbar({ open: true, message: 'Payment recorded successfully!', severity: 'success' });
      fetchPaymentHistory(currentResident._id);
    } catch (error) {
      console.log('🚀 ~ handleSavePayment ~ error:', error);
      setSnackbar({ open: true, message: 'Failed to record payment.', severity: 'error' });
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchRoomDetails();
    }
  }, [params.id]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCheckOut = async (familyId) => {
    if (
      !confirm(
        'Are you sure you want to check out this family? This will mark the room as available.'
      )
    )
      return;
    try {
      await axiosInstance.put(endpoints.family.checkOut(familyId));
      setSnackbar({ open: true, message: 'Family checked out successfully.', severity: 'success' });
      fetchRoomDetails();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to check out.',
        severity: 'error',
      });
    }
  };

  const handleCheckIn = () => setIsCheckInModalOpen(true);

  const handleSaveCheckIn = async (newFamilyData) => {
    try {
      await axiosInstance.post(endpoints.family.checkIn, { ...newFamilyData, roomId: params.id });
      setSnackbar({
        open: true,
        message: 'New resident checked in successfully!',
        severity: 'success',
      });
      fetchRoomDetails();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to check in new resident.',
        severity: 'error',
      });
    }
  };

  const handleAddMember = (familyId) => {
    setCurrentFamilyId(familyId);
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleEditMember = (familyId, member) => {
    setCurrentFamilyId(familyId);
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleSaveMember = async (memberData) => {
    const isEditing = !!editingMember;
    const url = isEditing
      ? endpoints.family.updateMember(currentFamilyId, editingMember._id)
      : endpoints.family.addMember(currentFamilyId);
    const method = isEditing ? 'put' : 'post';
    try {
      await axiosInstance[method](url, memberData);
      setSnackbar({
        open: true,
        message: `Family member ${isEditing ? 'updated' : 'added'} successfully!`,
        severity: 'success',
      });
      fetchRoomDetails();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save member details.',
        severity: 'error',
      });
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleDeleteMember = async (familyId, memberId) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      await axiosInstance.delete(endpoints.family.deleteMember(familyId, memberId));
      setSnackbar({
        open: true,
        message: 'Family member deleted successfully.',
        severity: 'success',
      });
      fetchRoomDetails();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete member.',
        severity: 'error',
      });
    }
  };

  const filteredPastResidents =
    details?.families
      .filter((f) => !f.isActive)
      .filter((family) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const headMatch =
          family.head.name.toLowerCase().includes(query) ||
          family.head.aadhar.includes(searchQuery) ||
          (family.head.mobile && family.head.mobile.includes(searchQuery));
        if (headMatch) return true;
        if (family.members && family.members.length > 0) {
          return family.members.some(
            (member) =>
              member.name.toLowerCase().includes(query) ||
              member.aadhar.includes(searchQuery) ||
              (member.mobile && member.mobile.includes(searchQuery))
          );
        }
        return false;
      }) || [];

  if (loading)
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  if (!details)
    return (
      <Container>
        <Alert severity="warning">Could not load room details.</Alert>
      </Container>
    );

  const { room, families } = details;
  const currentResident = families.find((f) => f.isActive);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          onClick={() => router.push('/room')}
          startIcon={<ArrowBackIcon />}
        >
          Back to List
        </Button>
        <Typography variant="h4" sx={{ ml: 2, fontWeight: 'bold' }}>
          {room.number}
        </Typography>
      </Box>

      <Card elevation={4} sx={{ borderRadius: 3, bgcolor: 'background.paper', mb: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={{ xs: 2, md: 0 }}>
            {/* Floor */}
            <Grid
              item
              xs={6}
              sm={3}
              sx={{
                borderRight: { sm: '1px solid', md: '1px solid' },
                borderColor: { sm: 'divider' },
              }}
            >
              <StatItem icon={<LayersIcon />} label="Floor" value={room.floor} />
            </Grid>

            {/* Type */}
            <Grid
              item
              xs={6}
              sm={3}
              sx={{
                borderRight: { sm: '1px solid', md: '1px solid' },
                borderColor: { sm: 'divider' },
              }}
            >
              <StatItem icon={<BedIcon />} label="Type" value={room.type} />
            </Grid>

            {/* Monthly Rent */}
            <Grid
              item
              xs={6}
              sm={3}
              sx={{
                borderRight: { sm: '1px solid', md: '1px solid' },
                borderColor: { sm: 'divider' },
              }}
            >
              <StatItem
                icon={<LocalAtmIcon />}
                label="Monthly Rent"
                value={`₹${room.rent.toLocaleString('en-IN')}`}
                valueColor="primary.main"
              />
            </Grid>

            {/* Status */}
            <Grid item xs={6} sm={3}>
              <Stack
                spacing={1}
                alignItems="center"
                justifyContent="center"
                sx={{ height: '100%' }}
              >
                <Typography variant="overline" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={room.status}
                  color={
                    room.status === 'Available'
                      ? 'success'
                      : room.status === 'Occupied'
                        ? 'error'
                        : 'warning'
                  }
                  sx={{ fontWeight: 'bold' }}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>
        Resident History
      </Typography>
      {room.status === 'Available' && !currentResident && (
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<LoginIcon />}
          onClick={handleCheckIn}
          sx={{ mb: 3 }}
          color="primary"
        >
          Check-in New Resident
        </Button>
      )}
      {currentResident && (
        <FamilyInfoCard
          family={currentResident}
          isCurrent
          roomNumber={room.number}
          onCheckOut={handleCheckOut}
          onAddMember={handleAddMember}
          onEditMember={handleEditMember}
          onDeleteMember={handleDeleteMember}
          onExport={exportFamilyToExcel}
        />
      )}
      {families.filter((f) => !f.isActive).length > 0 && (
        <>
          <Divider sx={{ my: 4 }}>
            <Chip label="Past Residents" variant="outlined" color="primary" />
          </Divider>
          <TextField
            fullWidth
            label="Search by Name, Aadhar, or Mobile"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {filteredPastResidents.length > 0 ? (
            filteredPastResidents.map((family) => (
              <FamilyInfoCard
                key={family._id}
                family={family}
                isCurrent={false}
                roomNumber={room.number}
                onExport={exportFamilyToExcel}
                onAddMember={() => {}}
                onEditMember={() => {}}
                onDeleteMember={() => {}}
              />
            ))
          ) : (
            <Alert severity="info">No matching past residents found.</Alert>
          )}
        </>
      )}

      {/* RENT HISTORY SECTION (can be inside FamilyInfoCard or separate) */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mt: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Rent & Bill History
        </Typography>
        <List>
          {payments.map((summary, index) => (
            <Box key={summary.month}>
              <ListItem disablePadding sx={{ py: 2 }}>
                <Grid container alignItems="center" spacing={2}>
                  {/* Month & Year */}
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventIcon sx={{ color: 'text.secondary', mr: 1.5 }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formatMonth(summary.month)}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Financial Details */}
                  <Grid item xs={12} md={5}>
                    <Typography variant="body2" color="text.secondary">
                      Due: ₹{summary.totalDue.toLocaleString()} | Paid:{' '}
                      <Typography
                        component="span"
                        variant="body2"
                        fontWeight="bold"
                        color="success.main"
                      >
                        ₹{summary.totalPaid.toLocaleString()}
                      </Typography>{' '}
                      | Balance:{' '}
                      <Typography
                        component="span"
                        variant="body2"
                        fontWeight="bold"
                        color={summary.balance < 0 ? 'error.main' : 'text.primary'}
                      >
                        ₹{summary.balance.toLocaleString()}
                      </Typography>
                    </Typography>
                  </Grid>

                  {/* Status */}
                  <Grid item xs={6} md={2}>
                    <Chip
                      label={summary.status}
                      color={getStatusChipColor(summary.status)}
                      size="small"
                      sx={{ width: '100px' }}
                    />
                  </Grid>

                  {/* Action Button */}
                  <Grid item xs={6} md={2} sx={{ textAlign: 'right' }}>
                    {summary.status !== 'Paid' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleAddPaymentClick(summary)}
                      >
                        Add Payment
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </ListItem>
              {index < payments.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Paper>

      {/* Payment Modal */}
      <PaymentFormModal
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleSavePayment}
        rentAmount={room.rent}
        month={selectedMonth}
      />

      <CheckInFormModal
        open={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onSave={handleSaveCheckIn}
      />
      <MemberFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMember}
        member={editingMember}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
    </Container>
  );
}
