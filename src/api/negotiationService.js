import { negotiationApi } from './api';

export const negotiationService = {
  // Create a new negotiation
  createNegotiation: async (offerId) => {
    try {
      const response = await negotiationApi.post('/negotiation', { offerId });
      return response.data;
    } catch (error) {
       console.error("Error creating negotiation:", error);
       throw error;
    }
  },

  // Create a negotiation proposal
  createProposal: async (negotiationId, proposedQuantity, proposedPrice, senderRole) => {
    try {
      const response = await negotiationApi.post('/negotiation/proposal', {
         negotiationId, 
         proposedQuantity: Number(proposedQuantity), 
         proposedPrice: Number(proposedPrice), 
         senderRole
      });
      return response.data;
    } catch (error) {
       console.error("Error creating negotiation proposal:", error);
       throw error;
    }
  },

  // Get all negotiations (with optional filtering)
  getNegotiations: async (params = {}) => {
    try {
      const response = await negotiationApi.get('/negotiation', { params });
      return response.data;
    } catch (error) {
       console.error("Error fetching negotiations:", error);
       throw error;
    }
  },

  // Get a specific negotiation by ID
  getNegotiationById: async (id) => {
    try {
      const response = await negotiationApi.get(`/negotiation/${id}`);
      return response.data;
    } catch (error) {
       console.error(`Error fetching negotiation details for id ${id}:`, error);
       throw error;
    }
  },

  // Get proposals for a specific negotiation
  getProposals: async (negotiationId, params = {}) => {
    try {
      const response = await negotiationApi.get(`/negotiation/proposal/${negotiationId}`, { params });
      return response.data;
    } catch (error) {
       console.error(`Error fetching proposals for negotiation id ${negotiationId}:`, error);
       throw error;
    }
  },

  // Accept a negotiation
  acceptNegotiation: async (id) => {
    try {
      const response = await negotiationApi.patch(`/negotiation/${id}/accept`);
      return response.data;
    } catch (error) {
       console.error(`Error accepting negotiation id ${id}:`, error);
       throw error;
    }
  },

  // Reject a negotiation
  rejectNegotiation: async (id) => {
    try {
      const response = await negotiationApi.patch(`/negotiation/${id}/reject`);
      return response.data;
    } catch (error) {
       console.error(`Error rejecting negotiation id ${id}:`, error);
       throw error;
    }
  },

  // Counter a negotiation
  counterNegotiation: async (id) => {
    try {
      const response = await negotiationApi.patch(`/negotiation/${id}/counter`);
      return response.data;
    } catch (error) {
       console.error(`Error countering negotiation id ${id}:`, error);
       throw error;
    }
  }
};
