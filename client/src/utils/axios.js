import axios from 'axios';

import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/api/v1/auth/me',
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
  },
  room: {
    list: '/api/v1/room/list',
    add: '/api/v1/room/create',
    update: (id) => `/api/v1/room/update/${id}`,
    delete: (id) => `/api/v1/room/delete/${id}`,
    get: (id) => `/api/v1/room/${id}`,
  },
  family: {
    checkIn: '/api/v1/family/check-in',
    checkOut: (familyId) => `/api/v1/family/check-out/${familyId}`,
    addMember: (familyId) => `/api/v1/family/${familyId}/members`,
    updateMember: (familyId, memberId) => `/api/v1/family/${familyId}/members/${memberId}`,
    deleteMember: (familyId, memberId) => `/api/v1/family/${familyId}/members/${memberId}`,
    getPayments: (familyId) => `/api/v1/family/${familyId}/payments`,
    list: '/api/v1/family/list',
    create: '/api/v1/family/create',
    update: (id) => `/api/v1/family/update/${id}`,
    get: (id) => `/api/v1/family/${id}`,
    delete: (id) => `/api/v1/family/delete/${id}`,
  },
  payment: {
    create: '/api/v1/family/payment/create',
  },
  dashboard: {
    stats: '/api/v1/dashboard/stats',
    revenueChart: '/api/v1/dashboard/revenue-chart',
    recentActivity: '/api/v1/dashboard/recent-activity',
    topRooms: '/api/v1/dashboard/top-rooms',
  },
};
