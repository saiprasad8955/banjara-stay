'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Icon,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CountUp from 'react-countup';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Icons
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HouseSidingIcon from '@mui/icons-material/HouseSiding';

// NEW: Import axios and endpoints
import axiosInstance, { endpoints } from 'src/utils/axios';

// --- Reusable Components ---

// Animated Statistic Card
function StatCard({ title, value, icon, color, prefix = '', suffix = '' }) {
  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
        bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
        color: (theme) => theme.palette[color].darker,
      }}
    >
      <Box>
        <Typography variant="h6" component="h3">
          {title}
        </Typography>
        <Typography variant="h3" component="p" sx={{ fontWeight: 'bold' }}>
          <CountUp start={0} end={value} duration={2.5} separator="," prefix={prefix} suffix={suffix} decimals={value % 1 !== 0 ? 1 : 0} />
        </Typography>
      </Box>
      <Box
        sx={{
          fontSize: 80,
          opacity: 0.1,
          position: 'absolute',
          right: -20,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        {icon}
      </Box>
    </Paper>
  );
}

// NEW: Helper function to format date strings into "time ago"
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} years ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} months ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} days ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hours ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
    return `${Math.floor(seconds)} seconds ago`;
}


// --- Main Dashboard View ---
export default function DashboardView() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topRooms, setTopRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data points in parallel for better performance
        const [statsRes, revenueRes, activityRes, topRoomsRes] = await Promise.all([
          axiosInstance.get(endpoints.dashboard.stats),
          axiosInstance.get(endpoints.dashboard.revenueChart),
          axiosInstance.get(endpoints.dashboard.recentActivity),
          axiosInstance.get(endpoints.dashboard.topRooms),
        ]);

        setStats(statsRes.data.data);
        setRevenueData(revenueRes.data.data);
        setRecentActivity(activityRes.data.data);
        setTopRooms(topRoomsRes.data.data);

      } catch (err) {
        setError(err.message || 'An error occurred while loading dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Welcome Back, Admin! 👋
      </Typography>

      <Grid container spacing={3}>
        {/* Stat Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Rooms" value={stats?.totalRooms || 0} icon={<MeetingRoomIcon />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Families" value={stats?.totalFamilies || 0} icon={<PeopleAltIcon />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Occupancy Rate" value={stats?.occupancyRate || 0} icon={<HouseSidingIcon />} color="warning" suffix="%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="This Month's Revenue" value={stats?.monthlyRevenue || 0} icon={<AttachMoneyIcon />} color="error" prefix="₹" />
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Monthly Revenue Overview
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#8884d8" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity & Top Rooms */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Recent Activity */}
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Activity
              </Typography>
              <List disablePadding>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id} disableGutters>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: activity.type === 'check-in' ? 'info.light' : 'success.light' }}>
                        <Icon>{activity.type === 'check-in' ? 'C' : 'P'}</Icon>
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.action}
                      secondary={`${activity.name} • ${formatTimeAgo(activity.time)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Top Performing Rooms */}
             <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top Rooms by Revenue
              </Typography>
              <List disablePadding>
                {topRooms.map((room) => (
                  <ListItem key={room.id} disableGutters>
                     <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark', fontWeight: 'bold' }}>
                        {room.number[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`Room ${room.number}`}
                      secondary={room.type}
                    />
                    <Chip label={`₹${room.revenue.toLocaleString()}`} color="success" size="small" variant="outlined" />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}