import {
  CatalogProduct,
  CatalogCategory,
  CatalogBrand,
  HomeCatalogData,
  CatalogDeliveryOption,
  CatalogFilterParams,
} from '../core/types/catalog';

const API_BASE = '/api';

export const catalogApi = {
  async getHome(): Promise<HomeCatalogData> {
    const res = await fetch(`${API_BASE}/catalog/home`);
    if (!res.ok) throw new Error('Ошибка загрузки данных главной страницы');
    return res.json();
  },

  async getProducts(params: CatalogFilterParams = {}): Promise<{
    products: CatalogProduct[];
    items: CatalogProduct[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const qs = new URLSearchParams();
    if (params.categoryId) qs.set('categoryId', String(params.categoryId));
    if (params.categorySlug && params.categorySlug !== 'all') qs.set('categorySlug', params.categorySlug);
    if (params.brand) qs.set('brand', params.brand);
    if (params.minPrice) qs.set('minPrice', String(params.minPrice));
    if (params.maxPrice) qs.set('maxPrice', String(params.maxPrice));
    if (params.inStock || params.inStockOnly) qs.set('inStock', 'true');
    if (params.discount) qs.set('discount', 'true');
    const query = params.q || params.search;
    if (query) qs.set('q', query);
    if (params.isHit) qs.set('hit', 'true');
    if (params.sort) qs.set('sort', params.sort);
    const p = params.page || 1;
    const size = params.pageSize || params.limit || 24;
    qs.set('page', String(p));
    qs.set('pageSize', String(size));

    const res = await fetch(`${API_BASE}/catalog/products?${qs.toString()}`);
    if (!res.ok) throw new Error('Ошибка загрузки каталога товаров');
    const data = await res.json();
    const list = data.products || data.items || [];
    return {
      products: list,
      items: list,
      total: data.total ?? list.length,
      page: data.page ?? p,
      pageSize: data.pageSize ?? size,
    };
  },

  async getProductBySlug(slug: string): Promise<{
    product: CatalogProduct;
    related: CatalogProduct[];
  }> {
    const res = await fetch(`${API_BASE}/catalog/products/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Товар не найден');
    return res.json();
  },

  async getCategories(): Promise<CatalogCategory[]> {
    const res = await fetch(`${API_BASE}/catalog/categories`);
    if (!res.ok) throw new Error('Ошибка загрузки категорий');
    const data = await res.json();
    return data.categories || [];
  },

  async getBrands(): Promise<CatalogBrand[]> {
    const res = await fetch(`${API_BASE}/catalog/brands`);
    if (!res.ok) throw new Error('Ошибка загрузки брендов');
    const data = await res.json();
    return data.brands || [];
  },

  async getDeliveryOptions(): Promise<CatalogDeliveryOption[]> {
    const res = await fetch(`${API_BASE}/catalog/delivery`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.deliveries || [];
  },

  // Admin Catalog API
  async adminSync(token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/catalog/sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка синхронизации');
    }
    return data.result;
  },

  async adminGetStatus(token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/catalog/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Ошибка получения статуса каталога');
    return res.json();
  },

  async adminGetProducts(token: string, q = '', page = 1, pageSize = 50): Promise<{
    products: CatalogProduct[];
    total: number;
  }> {
    const qs = new URLSearchParams({ q, page: String(page), pageSize: String(pageSize) });
    const res = await fetch(`${API_BASE}/admin/catalog/products?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Ошибка загрузки товаров админки');
    return res.json();
  },

  async adminUpdateOverrides(
    id: number,
    overrides: {
      isHit?: boolean;
      isHidden?: boolean;
      brandOverride?: string;
      excerptOverride?: string;
    },
    token: string
  ): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/catalog/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(overrides),
    });
    if (!res.ok) throw new Error('Ошибка обновления параметров');
  },
};
