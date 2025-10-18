// src/api/toppings.js

import client from "./client"; // Import client đã cấu hình

// CREATE (POST)
export const createTopping = (formData) => {
  // Thêm headers vào đây để các component khác không cần làm lại
  return client.post("/toppings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// READ ALL (GET)
export const getAllToppings = (filters) => {
  return client.get("/toppings", { params: filters });
};

// READ ONE (GET)
export const getTopping = (id) => {
  return client.get(`/toppings/${id}`);
};

// UPDATE (PATCH)
export const updateTopping = (id, formData) => {
  return client.patch(`/toppings/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// DELETE
export const deleteTopping = (id) => {
  return client.delete(`/toppings/${id}`);
};
