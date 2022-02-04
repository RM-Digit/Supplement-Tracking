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

export const http = {
  getCustomers,
  updateCustomers,
  getProducts,
  saveProducts,
};
