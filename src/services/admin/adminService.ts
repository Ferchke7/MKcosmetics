export interface AdminUser {
  id: number;
  username: string;
  displayName?: string;
  phone?: string;
  role: string;
  isActive?: boolean;
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
  costPrice?: number;
  currency: string;
  status: 'new' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentReceiptUrl?: string;
  paymentMethod?: string;
  trackingNumber?: string;
  shippingAddress?: string;
  city?: string;
  assignedTo?: string;
  cargoBatchId?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CargoBatch {
  id: number;
  batchCode: string;
  title: string;
  origin: string;
  destination: string;
  awbNumber: string;
  carrier: string;
  weightKg: number;
  ratePerKg: number;
  departureDate: string;
  arrivalDate: string;
  status: 'draft' | 'in_transit' | 'customs' | 'arrived' | 'completed';
  orderCount?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: number;
  productId: string;
  variantType: 'volume' | 'shade' | 'bundle';
  name: string;
  sku: string;
  costPrice: number;
  retailPrice: number;
  stockQuantity: number;
  stockStatus: 'in_stock' | 'pre_order' | 'out_of_stock';
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffMember {
  id: number;
  username: string;
  displayName: string;
  phone: string;
  role: 'admin' | 'manager' | 'logistics';
  isActive: boolean;
  ordersCount: number;
  paidCount: number;
}

export interface StaffPayrollOrder {
  id: number;
  orderNumber: string;
  date: string;
  customerName: string;
  city: string;
  totalAmount: number;
  totalKRW: number;
  totalUZS: number;
  costPriceKRW: number;
  marginKRW: number;
  marginUZS: number;
  status: string;
  paymentMethod: string;
}

export interface StaffPayrollSummary {
  username: string;
  displayName: string;
  phone: string;
  role: string;
  ordersCount: number;
  paidCount: number;
  totalRevenueKRW: number;
  totalRevenueUZS: number;
  totalMarginKRW: number;
  totalMarginUZS: number;
  baseSalaryUZS: number;
  commissionRatePct: number;
  commissionType: 'revenue' | 'margin';
  commissionEarnedUZS: number;
  commissionEarnedKRW: number;
  kpiBonusUZS: number;
  totalPayoutUZS: number;
  totalPayoutKRW: number;
  orders: StaffPayrollOrder[];
}

export interface PayrollReportResponse {
  month: string;
  commissionType: string;
  totalStaffCount: number;
  totalPaidOrders: number;
  totalRevenueUZS: number;
  totalMarginUZS: number;
  totalPayoutUZS: number;
  staffPayrolls: StaffPayrollSummary[];
}

export interface DeepAnalyticsData {
  periodDays: number;
  totalOrders: number;
  totalRevenueKRW: number;
  totalCostKRW: number;
  totalProfitKRW: number;
  averageOrderKRW: number;
  grossMarginPct: number;
  revenueTimeline: Array<{
    date: string;
    revenueKRW: number;
    costKRW: number;
    profitKRW: number;
    ordersCount: number;
  }>;
  geographyStats: Array<{
    city: string;
    ordersCount: number;
    revenueKRW: number;
    percentage: number;
  }>;
  topBrands: Array<{
    brand: string;
    unitsSold: number;
    revenueKRW: number;
    ordersCount: number;
  }>;
  categoryTree: Array<{
    category: string;
    unitsSold: number;
    revenueKRW: number;
  }>;
  heatmap24h7d: number[][];
  paymentMethods: Array<{
    method: string;
    ordersCount: number;
    revenueKRW: number;
    percentage: number;
  }>;
  funnelSteps: Array<{
    step: string;
    label: string;
    count: number;
    percentage: number;
  }>;
  sellersRadar: Array<{
    username: string;
    displayName: string;
    role: string;
    ordersCount: number;
    revenueKRW: number;
    paidCount: number;
    shippedCount: number;
    avgTicketKRW: number;
    conversionPercent: number;
    radarScores: number[];
  }>;
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
      throw new Error(data.error || 'Ошибка смены пароля');
    }
  },

  // Deep ECharts Analytics
  async getDeepAnalytics(days: number = 30, token: string): Promise<DeepAnalyticsData> {
    const res = await fetch(`${API_BASE}/admin/analytics/deep?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка загрузки расширенной аналитики');
    }
    return data.data;
  },

  // Dashboard Stats
  async getDashboardStats(token: string): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка загрузки статистики');
    }
    return data.data;
  },

  // File Upload (Payment Receipts / Product Images)
  async uploadFile(file: File, token: string): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка загрузки файла на сервер');
    }
    return { url: data.url, filename: data.filename };
  },

  // Orders Management
  async getAdminOrders(
    status: string = '',
    search: string = '',
    limit: number = 100,
    offset: number = 0,
    token: string
  ): Promise<{ orders: Order[]; total: number; statusCounts: Record<string, number> }> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const res = await fetch(`${API_BASE}/admin/orders?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error('Ошибка загрузки заказов');
    }
    return data;
  },

  async processOrder(orderId: number, orderData: Partial<Order>, token: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/process`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: orderId, ...orderData }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка обработки заказа');
    }
    return data.order;
  },

  async updateOrderStatus(orderId: number, status: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка обновления статуса');
    }
  },

  async updateOrderNotes(orderId: number, notes: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/notes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка сохранения заметки');
    }
  },

  async deleteOrder(orderId: number, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка удаления заказа');
    }
  },

  async exportOrdersCsv(status: string, search: string, token: string): Promise<Blob> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/admin/orders/export/csv?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Ошибка экспорта заказов');
    }
    return await res.blob();
  },

  // Cargo Flight Batches
  async getCargoBatches(token: string): Promise<CargoBatch[]> {
    const res = await fetch(`${API_BASE}/admin/cargo`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка загрузки карго-партий');
    }
    return data.batches || [];
  },

  async getCargoBatchById(id: number, token: string): Promise<{ batch: CargoBatch; orders: Order[] }> {
    const res = await fetch(`${API_BASE}/admin/cargo/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка загрузки партии');
    }
    return { batch: data.batch, orders: data.orders || [] };
  },

  async createCargoBatch(batchData: Partial<CargoBatch> & { orderIds?: number[] }, token: string): Promise<CargoBatch> {
    const res = await fetch(`${API_BASE}/admin/cargo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(batchData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка создания карго-партии');
    }
    return data.batch;
  },

  async updateCargoBatch(id: number, batchData: Partial<CargoBatch>, token: string): Promise<CargoBatch> {
    const res = await fetch(`${API_BASE}/admin/cargo/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(batchData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка обновления карго-партии');
    }
    return data.batch;
  },

  async deleteCargoBatch(id: number, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/cargo/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка удаления партии');
    }
  },

  // Product Variants
  async getProductVariants(productId?: string, token?: string): Promise<ProductVariant[]> {
    const url = productId ? `${API_BASE}/variants?productId=${productId}` : `${API_BASE}/variants`;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { headers });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return [];
    }
    return data.variants || [];
  },

  async createProductVariant(variant: Partial<ProductVariant>, token: string): Promise<ProductVariant> {
    const res = await fetch(`${API_BASE}/admin/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(variant),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка создания инварианта товара');
    }
    return data.variant;
  },

  async updateProductVariant(id: number, variant: Partial<ProductVariant>, token: string): Promise<ProductVariant> {
    const res = await fetch(`${API_BASE}/admin/variants/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(variant),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка обновления инварианта товара');
    }
    return data.variant;
  },

  async updateVariantStock(id: number, stockQuantity: number, stockStatus: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/variants/${id}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stockQuantity, stockStatus }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка обновления остатка');
    }
  },

  async deleteProductVariant(id: number, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/variants/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка удаления инварианта');
    }
  },

  // Staff & Seller Management
  async getStaff(token: string): Promise<StaffMember[]> {
    const res = await fetch(`${API_BASE}/admin/staff`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка загрузки сотрудников');
    }
    return data.staff || [];
  },

  async createStaff(staffData: {
    username: string;
    displayName: string;
    phone: string;
    password: string;
    role: string;
    isActive: boolean;
  }, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(staffData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка добавления сотрудника');
    }
  },

  async updateStaff(id: number, staffData: {
    displayName: string;
    phone: string;
    role: string;
    isActive: boolean;
    password?: string;
  }, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/staff/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(staffData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка обновления сотрудника');
    }
  },

  async deleteStaff(id: number, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/staff/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка удаления сотрудника');
    }
  },

  async getStaffPayroll(
    params: {
      month?: string;
      commissionType?: 'revenue' | 'margin';
      commissionRate?: number;
      baseSalary?: number;
      kpiBonus?: number;
    },
    token: string
  ): Promise<PayrollReportResponse> {
    const qs = new URLSearchParams();
    if (params.month) qs.set('month', params.month);
    if (params.commissionType) qs.set('commissionType', params.commissionType);
    if (params.commissionRate !== undefined) qs.set('commissionRate', String(params.commissionRate));
    if (params.baseSalary !== undefined) qs.set('baseSalary', String(params.baseSalary));
    if (params.kpiBonus !== undefined) qs.set('kpiBonus', String(params.kpiBonus));

    const res = await fetch(`${API_BASE}/admin/staff/payroll?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка загрузки ведомости зарплат');
    }
    return data.report;
  },

  async exportStaffPayrollCSV(
    params: {
      month?: string;
      commissionType?: 'revenue' | 'margin';
      commissionRate?: number;
      baseSalary?: number;
      kpiBonus?: number;
    },
    token: string
  ): Promise<Blob> {
    const qs = new URLSearchParams();
    if (params.month) qs.set('month', params.month);
    if (params.commissionType) qs.set('commissionType', params.commissionType);
    if (params.commissionRate !== undefined) qs.set('commissionRate', String(params.commissionRate));
    if (params.baseSalary !== undefined) qs.set('baseSalary', String(params.baseSalary));
    if (params.kpiBonus !== undefined) qs.set('kpiBonus', String(params.kpiBonus));

    const res = await fetch(`${API_BASE}/admin/staff/payroll/export-csv?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Ошибка выгрузки ведомости зарплат в Excel');
    }
    return res.blob();
  },

  // Products CRUD
  async createProduct(productData: any, token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка создания товара');
    }
    return data.product;
  },

  async updateProduct(id: string, productData: any, token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка обновления товара');
    }
    return data.product;
  },

  async deleteProduct(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка удаления товара');
    }
  },

  // Telegram Sync
  async triggerSync(deep: boolean = false, token: string): Promise<{ message: string; count?: number }> {
    const res = await fetch(`${API_BASE}/admin/sync?deep=${deep}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка синхронизации Telegram');
    }
    return data;
  },

  // Unit Economics & Sales Analysis
  async getUnitEconomics(days: number = 30, token: string): Promise<UnitEconomicsData> {
    const res = await fetch(`${API_BASE}/admin/sales/unit-economics?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Ошибка загрузки юнит-экономики');
    }
    return res.json();
  },

  async exportUnitSalesLedger(days: number = 30, token: string): Promise<Blob> {
    const res = await fetch(`${API_BASE}/admin/sales/export-ledger?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Ошибка выгрузки журнала продаж');
    }
    return res.blob();
  },
};

export interface ProductUnitStat {
  productId: string;
  productTitle: string;
  brand: string;
  photoUrl?: string;
  unitsSold: number;
  totalRevenueKRW: number;
  totalCostKRW: number;
  totalCargoCostKRW: number;
  avgSellingPriceKRW: number;
  avgCostPriceKRW: number;
  avgCargoPerUnitKRW: number;
  unitMarginKRW: number;
  totalMarginKRW: number;
  grossMarginPct: number;
  markupPct: number;
  marginClass: 'high' | 'standard' | 'low' | 'loss';
  breakEvenUnits: number;
  ordersCount: number;
}

export interface AbcXyzItem {
  productId: string;
  productTitle: string;
  brand: string;
  unitsSold: number;
  revenueKRW: number;
  marginKRW: number;
  revenueSharePct: number;
  cumulativeShare: number;
  abcGroup: 'A' | 'B' | 'C';
  variationCoeff: number;
  xyzGroup: 'X' | 'Y' | 'Z';
  matrixCode: string;
  recommendation: string;
}

export interface PnLPeriod {
  periodLabel: string;
  grossRevenueKRW: number;
  discountsKRW: number;
  netRevenueKRW: number;
  cogsKRW: number;
  logisticsKRW: number;
  commissionsKRW: number;
  grossProfitKRW: number;
  operatingProfit: number;
  grossMarginPct: number;
  netMarginPct: number;
  ordersCount: number;
  unitsCount: number;
}

export interface CohortData {
  cohortMonth: string;
  newCustomersCount: number;
  totalOrders: number;
  totalRevenueKRW: number;
  avgCustomerLtvKRW: number;
  retentionRates: number[];
}

export interface UnitSaleLedgerItem {
  id: number;
  orderId: number;
  orderNumber: string;
  date: string;
  customerName: string;
  phone: string;
  city: string;
  productId: string;
  productTitle: string;
  brand: string;
  quantity: number;
  unitPriceKRW: number;
  unitCostKRW: number;
  unitCargoKRW: number;
  unitMarginKRW: number;
  totalMarginKRW: number;
  marginPct: number;
  assignedTo: string;
  paymentMethod: string;
  channelSource: string;
}

export interface UnitEconomicsSummary {
  periodDays: number;
  totalUnitsSold: number;
  totalOrders: number;
  totalRevenueKRW: number;
  totalCostKRW: number;
  totalCargoCostKRW: number;
  totalGrossProfitKRW: number;
  avgSellingPriceKRW: number;
  avgCostPriceKRW: number;
  avgCargoCostPerUnitKRW: number;
  avgMarginPerUnitKRW: number;
  overallMarginPct: number;
  overallMarkupPct: number;
  topProfitableProduct: string;
  topVolumeProduct: string;
}

export interface UnitEconomicsData {
  summary: UnitEconomicsSummary;
  waterfallData: Array<{ name: string; value: number; type: string }>;
  productsEconomics: ProductUnitStat[];
  abcXyzMatrix: AbcXyzItem[];
  abcXyzCounts: Record<string, number>;
  pnlStatements: PnLPeriod[];
  cohorts: CohortData[];
  recentLedger: UnitSaleLedgerItem[];
}

