import apiClient from './client';

export const getAddresses = async (params = {}) => {
  return apiClient.get('/addresses', { params });
};

export const getAddressById = async (id) => {
  return apiClient.get(`/addresses/${id}`);
};

export const createAddress = async (data) => {
  return apiClient.post('/addresses', data);
};

export const updateAddress = async (id, data) => {
  return apiClient.patch(`/addresses/${id}`, data);
};

export const deleteAddress = async (id) => {
  return apiClient.delete(`/addresses/${id}`);
};

export default {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};
