import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5004';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
      
      this.socket.on('connect', () => {
        console.log('Connected to Negotiation WebSocket');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from Negotiation WebSocket');
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinNegotiation(negotiationId) {
    if (this.socket) {
      this.socket.emit('joinNegotiation', negotiationId);
    }
  }

  onProposalCreated(callback) {
    if (this.socket) {
      this.socket.on('proposalCreated', callback);
    }
  }

  onNegotiationAccepted(callback) {
    if (this.socket) {
      this.socket.on('negotiationAccepted', callback);
    }
  }

  removeListeners() {
    if (this.socket) {
      this.socket.off('proposalCreated');
      this.socket.off('negotiationAccepted');
    }
  }
}

const socketService = new SocketService();
export default socketService;
