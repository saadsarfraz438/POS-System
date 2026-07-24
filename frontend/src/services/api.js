import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5298/api',
  headers: { 'Content-Type': 'application/json' },
});

export const getProducts = () => api.get('/products');
export const createProduct = (payload) => api.post('/products', payload);
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getSalespersons = () => api.get('/salespersons');
export const createSalesperson = (payload) => api.post('/salespersons', payload);
export const updateSalesperson = (id, payload) => api.put(`/salespersons/${id}`, payload);
export const deleteSalesperson = (id) => api.delete(`/salespersons/${id}`);

export const getSales = () => api.get('/sales');
export const createSale = (payload) => api.post('/sales', payload);
export const deleteSale = (id) => api.delete(`/sales/${id}`);

export default api;
