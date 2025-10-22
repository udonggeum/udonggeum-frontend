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

  // Reset database
  reset() {
    localStorage.removeItem(DB_KEY);
    this.db = loadDB();
  }
}

export const mockDB = new MockDatabase();
