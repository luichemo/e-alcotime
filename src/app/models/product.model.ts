export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'wine' | 'beer' | 'spirits' | 'champagne' | 'whiskey' | 'cognac' | 'sparkling_wine' | 'tequila' | 'rum' | 'gin' | 'other';
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