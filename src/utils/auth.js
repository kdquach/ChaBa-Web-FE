// Quản lý authentication token và user data trong localStorage

const ACCESS_TOKEN_KEY = "bubble_tea_access_token";
const REFRESH_TOKEN_KEY = "bubble_tea_refresh_token";
const USER_KEY = "bubble_tea_user";

// Token management
export const getAccessToken = () => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

export const getRefreshToken = () => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
};

export const setTokens = (tokens) => {
  try {
    if (tokens.access?.token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access.token);
    }
    if (tokens.refresh?.token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh.token);
    }
  } catch (error) {
    console.error("Error setting tokens:", error);
  }
};

// User management
export const getUser = () => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

export const setUser = (user) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error setting user:", error);
  }
};

// Auth cleanup
export const clearAuth = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Error clearing auth:", error);
  }
};

// Permission management
export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission) || user.role === "admin";
};

// Available permissions in the system
export const PERMISSIONS = {
  MANAGE_PRODUCTS: "manage_products",
  MANAGE_ORDERS: "manage_orders",
  MANAGE_USERS: "manage_users",
  MANAGE_INGREDIENTS: "manage_ingredients",
  MANAGE_TOPPINGS: "manage_toppings",
  VIEW_REPORTS: "view_reports",
};
