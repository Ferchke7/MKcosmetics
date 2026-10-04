import {
  CatalogProduct,
  CatalogCategory,
  CatalogBrand,
  HomeCatalogData,
  CatalogDeliveryOption,
  CatalogFilterParams,
} from '../core/types/catalog';

const API_BASE = '/api';

export function normalizeProduct(p: any): CatalogProduct {
  if (!p) return p;
  const title = p.title || p.name || 'Товар';
  const categoryTitle = p.categoryTitle || p.categoryName || '';
  const photos = Array.isArray(p.photos) ? p.photos : [];
  let images = Array.isArray(p.images) ? p.images : [];
  if (images.length === 0 && photos.length > 0) {
    images = photos.map((ph: any) => ph.full || ph.w600 || ph.w300 || '').filter(Boolean);
  }

  return {
    ...p,
    title,
    name: title,
    categoryTitle,
    categoryName: categoryTitle,
    photos,
    images,
    priceKrw: p.priceKrw ?? p.priceKRW ?? p.price ?? 0,
    oldPriceKrw: p.oldPriceKrw ?? p.oldPriceKRW ?? p.oldPrice ?? 0,
  };
}

async function parseResponse<T = any>(res: Response, defaultError: string): Promise<T> {
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw new Error(`Сервер вернул статус HTTP ${res.status}: ${res.statusText || defaultError}`);
    }
    throw new Error('Некорректный формат ответа сервера');
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || defaultError);
  }
  return data;
}

export const catalogApi = {
  async getHome(): Promise<HomeCatalogData> {
    const res = await fetch(`${API_BASE}/catalog/home`, {
      headers: { Accept: 'application/json' },
    });
    const data = await parseResponse<any>(res, 'Ошибка загрузки данных витрины');

    return {
      hits: (data.hits || []).map(normalizeProduct),
      sets: (data.sets || []).map(normalizeProduct),
      newArrivals: (data.newArrivals || []).map(normalizeProduct),
      categories: data.categories || [],
      brandSpotlights: (data.brandSpotlights || []).map((b: any) => ({
        ...b,
        products: (b.products || []).map(normalizeProduct),
      })),
    };
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

    const res = await fetch(`${API_BASE}/catalog/products?${qs.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await parseResponse<any>(res, 'Ошибка загрузки каталога товаров');
    const rawList = data.products || data.items || [];
    const list = rawList.map(normalizeProduct);

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
    const res = await fetch(`${API_BASE}/catalog/products/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await parseResponse<any>(res, 'Товар не найден');
    return {
      product: normalizeProduct(data.product),
      related: (data.related || []).map(normalizeProduct),
    };
  },

  async getCategories(): Promise<CatalogCategory[]> {
    const res = await fetch(`${API_BASE}/catalog/categories`, {
      headers: { Accept: 'application/json' },
    });
    const data = await parseResponse<any>(res, 'Ошибка загрузки категорий');
    return data.categories || [];
  },

  async getBrands(): Promise<CatalogBrand[]> {
    const res = await fetch(`${API_BASE}/catalog/brands`, {
      headers: { Accept: 'application/json' },
    });
    const data = await parseResponse<any>(res, 'Ошибка загрузки брендов');
    return data.brands || [];
  },

  async getDeliveryOptions(): Promise<CatalogDeliveryOption[]> {
    try {
      const res = await fetch(`${API_BASE}/catalog/delivery`, {
        headers: { Accept: 'application/json' },
      });
      const data = await parseResponse<any>(res, 'Ошибка доставки');
      return data.deliveries || [];
    } catch {
      return [];
    }
  },

  // Admin Catalog API
  async adminSync(token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/catalog/sync`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await parseResponse<any>(res, 'Ошибка синхронизации');
    return data.result || data;
  },

  async adminGetStatus(token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/catalog/status`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return parseResponse<any>(res, 'Ошибка получения статуса каталога');
  },

  async adminGetProducts(token: string, q = '', page = 1, pageSize = 50): Promise<{
    products: CatalogProduct[];
    total: number;
  }> {
    const qs = new URLSearchParams({ q, page: String(page), pageSize: String(pageSize) });
    const res = await fetch(`${API_BASE}/admin/catalog/products?${qs.toString()}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await parseResponse<any>(res, 'Ошибка загрузки товаров админки');
    return {
      products: (data.products || []).map(normalizeProduct),
      total: data.total ?? 0,
    };
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
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(overrides),
    });
    await parseResponse<any>(res, 'Ошибка обновления параметров');
  },

  async adminImportProducts(token: string, products: any[]): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/catalog/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ products }),
    });
    return parseResponse<any>(res, 'Ошибка сохранения каталога в базе');
  },

  async adminDirectSync(
    token: string,
    onProgress?: (msg: string) => void
  ): Promise<{ total: number; added: number; updated: number }> {
    onProgress?.('Подключение к b-catalog напрямую из браузера...');
    let allProducts: any[] = [];
    let page = 1;
    const pageSize = 100;

    while (true) {
      onProgress?.(`Загрузка страницы ${page} напрямую из b-catalog...`);
      const url = `https://roznmkkoreacosmetic.b-catalog.ru/api/api/v1/shop/products?shop_code=roznmkkoreacosmetic&page=${page}&page_size=${pageSize}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`b-catalog вернул статус ${res.status}`);
      }
      const json = await res.json();
      const results = json.results || [];
      allProducts = allProducts.concat(results);

      if (allProducts.length >= (json.total || 0) || results.length === 0) {
        break;
      }
      page++;
    }

    onProgress?.(`Сохранение ${allProducts.length} товаров в базу данных...`);
    const importRes = await catalogApi.adminImportProducts(token, allProducts);
    return importRes.result || importRes;
  },
};
