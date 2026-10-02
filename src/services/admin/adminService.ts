export interface AdminUser {
  id: number;
  username: string;
  role: string;
  lastLogin?: string;
}

export interface AdminStats {
  totalProducts: number;
  totalVisits: number;
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

  async getDashboardStats(token: string): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Ошибка загрузки аналитики CRM');
    }
    return res.json();
  },

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
};
