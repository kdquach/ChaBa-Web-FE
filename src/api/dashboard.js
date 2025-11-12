import apiClient from './client';

const cleanParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([_, v]) => v !== '' && v != null)
);

export const fetchDashboardOverview = async () => {
  const res = await apiClient.get('/dashboard/overview');
  // Shape: { data: { orders, revenue, users, products } }
  return res?.data || {};
};

export const fetchRevenueSeries = async (params) => {
  const res = await apiClient.get('/dashboard/revenue-series', { params: cleanParams(params) });
  return res?.data || {};
};

export const fetchTopProducts = async (params) => {
  const res = await apiClient.get('/dashboard/top-products', { params: cleanParams(params) });
  return res?.data || [];
};

export const fetchRecentOrders = async (params) => {
  const res = await apiClient.get('/dashboard/recent-orders', { params: cleanParams(params) });
  return res?.data || [];
};