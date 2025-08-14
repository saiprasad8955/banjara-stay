'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Grid,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LayersIcon from '@mui/icons-material/Layers';
import BedIcon from '@mui/icons-material/Bed';

export default function RoomCard({ room, onEdit, onDelete }) {
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(room);
    handleMenuClose();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete Room ${room.number}? This action cannot be undone.`
      )
    ) {
      onDelete(room._id);
    }
    handleMenuClose();
  };

  const getStatusChipColor = (status) => {
    if (status === 'Occupied') return 'error';
    if (status === 'Maintenance') return 'warning';
    return 'success';
  };

  return (
    // The parent Grid item defines the animation keyframes
    <Grid
      item
      xs={12}
      sm={6}
      md={4}
      sx={{
        // NEW: Define the animation keyframes for the gradient
        '@keyframes gradientAnimation': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      <Box
        onClick={() => router.push(`/room/${room._id}`)}
        sx={{
          position: 'relative',
          p: 2.5,
          borderRadius: 2.5,
          cursor: 'pointer',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: (theme) => theme.shadows[8],
          },
          // Animated gradient border setup
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            p: '5px',
            // UPDATED: Gradient now includes a third color to make the loop seamless
            background: (theme) =>
              `linear-gradient(115deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light}, ${theme.palette.primary.light})`,
            // NEW: Make the background gradient much larger than the element
            backgroundSize: '400% 400%',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out',
          },
          // NEW: Apply the animation on hover
          '&:hover::before': {
            opacity: 1,
            animation: 'gradientAnimation 4s ease infinite',
          },
        }}
      >
        {/* Card Header: Title and Menu */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {room.number}
          </Typography>
          <IconButton
            aria-label="settings"
            onClick={handleMenuClick}
            size="small"
            sx={{ mt: -0.5, mr: -0.5 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Card Body: Details */}
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              ₹{room.rent.toLocaleString('en-IN')}
              <Typography variant="caption" color="text.secondary" component="span">
                {' '}
                / month
              </Typography>
            </Typography>

            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1.5,
                fontSize: '0.75rem',
                fontWeight: 'bold',
                bgcolor: (theme) => theme.palette[getStatusChipColor(room.status)].main,
                color: (theme) => theme.palette[getStatusChipColor(room.status)].contrastText,
                textTransform: 'capitalize',
              }}
            >
              {room.status}
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            color="text.secondary"
            sx={{
              pt: 1,
              borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <LayersIcon sx={{ fontSize: '1rem' }} />
              <Typography variant="body2">{room.floor} Floor</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <BedIcon sx={{ fontSize: '1rem' }} />
              <Typography variant="body2">{room.type}</Typography>
            </Stack>
          </Stack>
        </Stack>

        {/* Menu Dropdown */}
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
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
      </Box>
    </Grid>
  );
}
