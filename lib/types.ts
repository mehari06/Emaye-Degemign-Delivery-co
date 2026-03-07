export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
};

export type MenuItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  tags?: string[];
  isAvailable?: boolean;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

export type AddressInput = {
  address: string;
  latitude: number;
  longitude: number;
};

export type OrderItemInput = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "CONFIRMED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type OrderSummary = {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItemInput[];
};
