import { useState, useEffect, useCallback } from 'react';

// WebSocket message types
export interface WebSocketMessage {
  type: 'invoice_created' | 'invoice_updated' | 'invoice_paid' | 'invoice_sent' | 'client_added' | 'client_updated';
  data: any;
  timestamp: string;
  userId?: string;
}

export interface ActivityItem {
  id: string;
  type: 'invoice_created' | 'invoice_updated' | 'invoice_paid' | 'invoice_sent' | 'client_added' | 'client_updated';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  data: any;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private activityFeed: ActivityItem[] = [];
  private maxActivityItems = 50;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // For development, we'll simulate WebSocket with a fallback
      // In production, this would be: ws://localhost:3001 or your WebSocket server
      if (typeof window !== 'undefined' && (window as any).__DEV__) {
        // Simulate WebSocket for development
        this.simulateWebSocket();
        return;
      }

      this.ws = new WebSocket('ws://localhost:3001');
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.simulateWebSocket();
    }
  }

  private simulateWebSocket() {
    // Simulate real-time updates for development
    console.log('Using simulated WebSocket for development');
    
    // Simulate some activity every 10-30 seconds
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of activity
        this.simulateActivity();
      }
    }, 15000);

    // Simulate initial connection
    setTimeout(() => {
      this.simulateActivity(); // Initial activity
    }, 2000);
  }

  private simulateActivity() {
    const activities = [
      {
        type: 'invoice_created' as const,
        title: 'New Invoice Created',
        description: 'Invoice INV-2024-001 has been created',
        data: {
          invoiceNumber: 'INV-2024-001',
          clientId: 'client-1',
          total: Math.floor(Math.random() * 5000) + 1000,
          status: 'draft'
        }
      },
      {
        type: 'invoice_paid' as const,
        title: 'Invoice Paid',
        description: 'Payment received for invoice INV-2024-002',
        data: {
          invoiceNumber: 'INV-2024-002',
          clientId: 'client-2',
          total: Math.floor(Math.random() * 3000) + 500,
          status: 'paid'
        }
      },
      {
        type: 'invoice_sent' as const,
        title: 'Invoice Sent',
        description: 'Invoice INV-2024-003 has been sent to client',
        data: {
          invoiceNumber: 'INV-2024-003',
          clientId: 'client-3',
          total: Math.floor(Math.random() * 4000) + 800,
          status: 'sent'
        }
      },
      {
        type: 'client_added' as const,
        title: 'New Client Added',
        description: 'New client has been added to the system',
        data: {
          clientName: `Client ${Math.floor(Math.random() * 100)}`,
          email: `client${Math.floor(Math.random() * 100)}@example.com`
        }
      }
    ];

    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    const message: WebSocketMessage = {
      ...randomActivity,
      timestamp: new Date().toISOString()
    };

    this.handleMessage(message);
  }

  private handleMessage(message: WebSocketMessage) {
    // Add to activity feed
    const activityItem: ActivityItem = {
      id: `${message.type}-${Date.now()}`,
      type: message.type,
      title: message.data.title || this.getDefaultTitle(message.type),
      description: message.data.description || this.getDefaultDescription(message.type, message.data),
      timestamp: new Date(message.timestamp),
      userId: message.userId,
      data: message.data
    };

    this.addToActivityFeed(activityItem);
    
    // Notify listeners
    const listeners = this.listeners.get(message.type) || [];
    listeners.forEach(listener => listener(message.data));

    // Also notify general message listeners
    const generalListeners = this.listeners.get('*') || [];
    generalListeners.forEach(listener => listener(message));
  }

  private addToActivityFeed(item: ActivityItem) {
    this.activityFeed.unshift(item);
    
    // Keep only the most recent items
    if (this.activityFeed.length > this.maxActivityItems) {
      this.activityFeed = this.activityFeed.slice(0, this.maxActivityItems);
    }

    // Notify activity feed listeners
    const listeners = this.listeners.get('activity_feed') || [];
    listeners.forEach(listener => listener(this.activityFeed));
  }

  private getDefaultTitle(type: string): string {
    const titles = {
      invoice_created: 'New Invoice Created',
      invoice_updated: 'Invoice Updated',
      invoice_paid: 'Invoice Paid',
      invoice_sent: 'Invoice Sent',
      client_added: 'New Client Added',
      client_updated: 'Client Updated'
    };
    return titles[type as keyof typeof titles] || 'System Activity';
  }

  private getDefaultDescription(type: string, data: any): string {
    switch (type) {
      case 'invoice_created':
        return `Invoice ${data.invoiceNumber} has been created for ${data.total}`;
      case 'invoice_paid':
        return `Payment received for invoice ${data.invoiceNumber}`;
      case 'invoice_sent':
        return `Invoice ${data.invoiceNumber} has been sent to client`;
      case 'client_added':
        return `New client ${data.clientName} has been added`;
      case 'client_updated':
        return `Client ${data.clientName} information has been updated`;
      default:
        return 'System activity occurred';
    }
  }

  private startHeartbeat() {
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      // Fall back to simulation
      this.simulateWebSocket();
    }
  }

  // Public API
  public subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  public getActivityFeed(): ActivityItem[] {
    return [...this.activityFeed];
  }

  public sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

// React hook for using WebSocket service
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Check connection status
    const checkConnection = () => {
      setIsConnected(websocketService.isConnected());
    };

    const interval = setInterval(checkConnection, 1000);

    // Subscribe to activity feed updates
    const unsubscribe = websocketService.subscribe('activity_feed', (feed: ActivityItem[]) => {
      setActivityFeed(feed);
    });

    // Initial connection check
    checkConnection();

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    return websocketService.subscribe(eventType, callback);
  }, []);

  const sendMessage = useCallback((message: any) => {
    websocketService.sendMessage(message);
  }, []);

  return {
    isConnected,
    activityFeed,
    subscribe,
    sendMessage,
    getActivityFeed: websocketService.getActivityFeed.bind(websocketService)
  };
};
