export interface AdminUser {
  id: number;
  username: string;
  role: string;
  lastLogin?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  currency: string;
  quantity: number;
  photoUrl?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  channelSource: string;
  type: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: 'new' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalProducts: number;
  totalVisits: number;
  totalOrders: number;
  orderCounts: Record<string, number>;
  countries: Array<{
    code: string;
    nameRu: string;
    nameUz: string;
    flag: string;
    visits: number;
  }>;
  channelInfo?: {
    title: string;
    username: string;
    avatarUrl: string;
    subscribersCount: string;
    description: string;
    updatedAt: string;
  };
  recentLogs: Array<{
    id: number;
    ip: string;
    countryCode: string;
    visitedAt: string;
  }>;
}

const API_BASE = '/api';

export const adminService = {
  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка авторизации');
    }
    return { token: data.token, user: data.user };
  },

  async getMe(token: string): Promise<AdminUser> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error('Сессия истекла');
    }
    return data.user;
  },

  async changePassword(newPassword: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Не удалось изменить пароль');
    }
  },

  // Dashboard Stats
  async getDashboardStats(token: string): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Ошибка загрузки аналитики CRM');
    }
    return res.json();
  },

  // Products CRUD
  async createProduct(product: any, token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Не удалось создать товар');
    }
    return data.product;
  },

  async updateProduct(id: string, product: any, token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Не удалось обновить товар');
    }
    return data.product;
  },

  async deleteProduct(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Не удалось удалить товар');
    }
  },

  // Telegram Sync
  async triggerSync(deep: boolean, token: string): Promise<{ count: number; message: string }> {
    const res = await fetch(`${API_BASE}/admin/sync?deep=${deep}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка синхронизации');
    }
    return data;
  },

  // Orders & Leads Management (CRM)
  async createPublicOrder(orderData: {
    customerName: string;
    phone: string;
    channelSource?: string;
    type?: string;
    items: OrderItem[];
    totalAmount: number;
    currency?: string;
    notes?: string;
  }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Не удалось оформить заказ');
    }
    return data.order;
  },

  async trackOrder(orderNumber: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/track/${encodeURIComponent(orderNumber)}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Заказ не найден');
    }
    return data.order;
  },

  async getAdminOrders(
    status: string,
    search: string,
    limit: number,
    offset: number,
    token: string
  ): Promise<{ orders: Order[]; total: number; statusCounts: Record<string, number> }> {
    const query = new URLSearchParams({
      status: status || '',
      search: search || '',
      limit: String(limit || 50),
      offset: String(offset || 0),
    });

    const res = await fetch(`${API_BASE}/admin/orders?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Ошибка загрузки заказов CRM');
    }
    return res.json();
  },

  async updateOrderStatus(id: number, status: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Не удалось обновить статус заказа');
    }
  },

  async updateOrderNotes(id: number, notes: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/notes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Не удалось сохранить заметку');
    }
  },

  async deleteOrder(id: number, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Не удалось удалить заказ');
    }
  },
};
