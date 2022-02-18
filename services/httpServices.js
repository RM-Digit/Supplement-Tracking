import axios from "axios";

const getCustomers = () => {
  return axios.post("/api/customers/get", { data: 1 });
};

const updateCustomers = () => {
  return axios.post("/api/customers/update", { data: 1 });
};

const saveProducts = (prodcuts) => {
  return axios.post("/api/products/save", { data: prodcuts });
};

const getProducts = () => {
  return axios.post("/api/products/get", { data: 1 });
};

const resetAll = () => {
  return axios.post("/api/customers/resetAll", { data: 1 });
};

const resetById = (id) => {
  return axios.post("/api/resetById", { id: id });
};

const updateById = (id, value) => {
  return axios.post("/api/updateById", { id: id, value: value });
};

export const http = {
  getCustomers,
  updateCustomers,
  getProducts,
  saveProducts,
  resetAll,
  resetById,
  updateById,
};
