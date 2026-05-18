import { ordersApi } from './api';

export const orderService = {
  // Get all orders with optional filters (clientId, importatorId)
  getOrders: async (params = {}) => {
    return await ordersApi.get('/orders', { params });
  },

  // Get a single order by ID
  getOrder: async (id) => {
    return await ordersApi.get(`/orders/${id}`);
  },

  // Update order status (confirm, pay, ship, deliver, cancel)
  updateStatus: async (id, statusSuffix) => {
    // statusSuffix should be 'confirm', 'pay', 'ship', 'deliver', or 'cancel'
    return await ordersApi.patch(`/orders/${id}/${statusSuffix}`);
  },

  // Update order details (general update)
  updateOrder: async (id, data) => {
    return await ordersApi.patch(`/orders/${id}`, data);
  },

  // Create a regular order
  createOrder: async (data) => {
    return await ordersApi.post('/orders', data);
  },

  // Create a custom order
  createCustomOrder: async (data) => {
    return await ordersApi.post('/orders/custom', data);
  },

  // Get available custom orders
  getAvailableCustomOrders: async () => {
    return await ordersApi.get('/orders/custom/available');
  },

  // Upload shipment proof to order
  uploadShipmentProof: async (id, shippingProoveUrl) => {
    return await ordersApi.patch(`/orders/${id}/shipping`, { shippingProove: shippingProoveUrl });
  }
};
