/**
 * Mock Database Utility
 * Simple in-memory database for MSW handlers
 * Uses localStorage for persistence across page reloads
 */

const DB_KEY = 'msw_mock_db';

interface MockDB {
  users: Array<{
    id: number;
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'user' | 'admin';
    created_at: string;
    updated_at: string;
  }>;
  carts: Array<{
    id: number;
    user_id: number;
    product_id: number;
    product_option_id: number;
    quantity: number;
    created_at: string;
  }>;
  orders: Array<{
    id: number;
    user_id: number;
    fulfillment_type: 'delivery' | 'pickup';
    shipping_address?: string;
    pickup_store_id?: number;
    status: string;
    total_amount: number;
    created_at: string;
  }>;
  addresses: Array<{
    id: number;
    user_id: number;
    name: string;
    recipient: string;
    phone: string;
    zip_code: string;
    address: string;
    detail_address: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
  }>;
}

/**
 * Load database from localStorage or initialize with defaults
 */
function loadDB(): MockDB {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as MockDB;
    } catch {
      // Invalid data, reset
    }
  }

  // Default seed data
  return {
    users: [
      {
        id: 1,
        email: 'user@example.com',
        password: 'password123',
        name: '테스트 사용자',
        phone: '010-1234-5678',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        email: 'admin@example.com',
        password: 'admin123',
        name: '관리자',
        phone: '010-9999-9999',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    carts: [],
    orders: [],
    addresses: [],
  };
}

/**
 * Save database to localStorage
 */
function saveDB(db: MockDB): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

/**
 * Mock database singleton
 */
class MockDatabase {
  private db: MockDB;

  constructor() {
    this.db = loadDB();
  }

  // Users
  getUsers() {
    return this.db.users;
  }

  getUserById(id: number) {
    return this.db.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string) {
    return this.db.users.find((u) => u.email === email.toLowerCase());
  }

  createUser(user: Omit<MockDB['users'][0], 'id' | 'created_at' | 'updated_at'>) {
    const newUser = {
      ...user,
      id: Math.max(0, ...this.db.users.map((u) => u.id)) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.db.users.push(newUser);
    saveDB(this.db);
    return newUser;
  }

  // Cart
  getCartByUserId(userId: number) {
    return this.db.carts.filter((c) => c.user_id === userId);
  }

  addToCart(item: Omit<MockDB['carts'][0], 'id' | 'created_at'>) {
    const newItem = {
      ...item,
      id: Math.max(0, ...this.db.carts.map((c) => c.id)) + 1,
      created_at: new Date().toISOString(),
    };
    this.db.carts.push(newItem);
    saveDB(this.db);
    return newItem;
  }

  updateCartItem(id: number, quantity: number) {
    const item = this.db.carts.find((c) => c.id === id);
    if (item) {
      item.quantity = quantity;
      saveDB(this.db);
    }
    return item;
  }

  deleteCartItem(id: number) {
    const index = this.db.carts.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.db.carts.splice(index, 1);
      saveDB(this.db);
      return true;
    }
    return false;
  }

  clearCart(userId: number) {
    this.db.carts = this.db.carts.filter((c) => c.user_id !== userId);
    saveDB(this.db);
  }

  // Orders
  getOrdersByUserId(userId: number) {
    return this.db.orders.filter((o) => o.user_id === userId);
  }

  getOrderById(id: number) {
    return this.db.orders.find((o) => o.id === id);
  }

  createOrder(order: Omit<MockDB['orders'][0], 'id' | 'created_at'>) {
    const newOrder = {
      ...order,
      id: Math.max(0, ...this.db.orders.map((o) => o.id)) + 1,
      created_at: new Date().toISOString(),
    };
    this.db.orders.push(newOrder);
    saveDB(this.db);
    return newOrder;
  }

  // Addresses
  getAddressesByUserId(userId: number) {
    return this.db.addresses.filter((a) => a.user_id === userId);
  }

  getAddressById(id: number) {
    return this.db.addresses.find((a) => a.id === id);
  }

  addAddress(address: Omit<MockDB['addresses'][0], 'id' | 'created_at' | 'updated_at'>) {
    // If is_default is true, set all other addresses for this user to false
    if (address.is_default) {
      this.db.addresses.forEach((a) => {
        if (a.user_id === address.user_id) {
          a.is_default = false;
        }
      });
    }

    const newAddress = {
      ...address,
      id: Math.max(0, ...this.db.addresses.map((a) => a.id)) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.db.addresses.push(newAddress);
    saveDB(this.db);
    return newAddress;
  }

  updateAddress(
    id: number,
    updates: Partial<Omit<MockDB['addresses'][0], 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) {
    const address = this.db.addresses.find((a) => a.id === id);
    if (address) {
      Object.assign(address, updates, { updated_at: new Date().toISOString() });
      saveDB(this.db);
    }
    return address;
  }

  deleteAddress(id: number) {
    const index = this.db.addresses.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.db.addresses.splice(index, 1);
      saveDB(this.db);
      return true;
    }
    return false;
  }

  setDefaultAddress(id: number, userId: number) {
    // Set all addresses for this user to non-default
    this.db.addresses.forEach((a) => {
      if (a.user_id === userId) {
        a.is_default = false;
      }
    });

    // Set the specified address as default
    const address = this.db.addresses.find((a) => a.id === id);
    if (address) {
      address.is_default = true;
      address.updated_at = new Date().toISOString();
      saveDB(this.db);
      return address;
    }
    return null;
  }

  // Reset database
  reset() {
    localStorage.removeItem(DB_KEY);
    this.db = loadDB();
  }
}

export const mockDB = new MockDatabase();
