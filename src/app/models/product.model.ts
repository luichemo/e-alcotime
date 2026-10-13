export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'wine' | 'beer' | 'spirits' | 'champagne' | 'whiskey' | 'cognac' | 'sparkling_wine' | 'tequila' | 'rum' | 'gin' | 'gift' | 'vape' | 'other';
  price: number;
  discountPrice: number;
  alcoholContent: number;
  volume: number;
  imageUrl: string;
  stock: number;
  brand: string;
  country: string;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Sale window for discountPrice, 'YYYY-MM-DD' (inclusive). Empty = no limit on that side.
  saleStartDate?: string;
  saleEndDate?: string;

  // Localized fields for bilingual support
  nameKa?: string;
  nameEn?: string;
  descriptionKa?: string;
  descriptionEn?: string;
  brandKa?: string;
  brandEn?: string;
  countryKa?: string;
  countryEn?: string;

  // New optional fields
  technology?: string;
  flavor?: string;
  taste?: string;
  technologyKa?: string;
  technologyEn?: string;
  flavorKa?: string;
  flavorEn?: string;
  tasteKa?: string;
  tasteEn?: string;
}

export type SaleStatus = 'none' | 'scheduled' | 'active' | 'expired';

/** Today's date as 'YYYY-MM-DD' in the browser's local timezone. */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getSaleStatus(
  product: Pick<Product, 'price' | 'discountPrice' | 'saleStartDate' | 'saleEndDate'>,
  today: string = todayISO()
): SaleStatus {
  if (!product.discountPrice || product.discountPrice <= 0 || product.discountPrice >= product.price) {
    return 'none';
  }
  if (product.saleStartDate && today < product.saleStartDate) return 'scheduled';
  if (product.saleEndDate && today > product.saleEndDate) return 'expired';
  return 'active';
}

/** discountPrice if the sale is running today, otherwise 0. */
export function getActiveDiscountPrice(
  product: Pick<Product, 'price' | 'discountPrice' | 'saleStartDate' | 'saleEndDate'>,
  today: string = todayISO()
): number {
  return getSaleStatus(product, today) === 'active' ? product.discountPrice : 0;
}
