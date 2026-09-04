import { createSlice } from "@reduxjs/toolkit";

const CART_STORAGE_KEY = "cartItems";

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error("Failed to parse cart from localStorage", e);
    return [];
  }
};

const saveCartToStorage = (cartItems) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (e) {
    console.error("Failed to save cart to localStorage", e);
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: loadCartFromStorage(),
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find(
        (i) => i._id === item._id && i.size === item.size
      );
      if (existItem) {
        existItem.qty += 1;
      } else {
        state.cartItems.push({ ...item, qty: 1 });
      }
      saveCartToStorage(state.cartItems);
    },

    removeFromCart: (state, action) => {
      const { id, size } = action.payload;
      state.cartItems = state.cartItems.filter(
        (x) => !(x._id === id && x.size === size)
      );
      saveCartToStorage(state.cartItems);
    },

    updateQty: (state, action) => {
      const { id, size, qty } = action.payload;
      const item = state.cartItems.find((x) => x._id === id && x.size === size);
      if (item) item.qty = qty;
      saveCartToStorage(state.cartItems);
    },

    clearCart: (state) => {
      state.cartItems = [];
      saveCartToStorage(state.cartItems);
    }
  }
});

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
