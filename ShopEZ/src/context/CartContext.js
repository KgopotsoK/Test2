import React, { createContext, useState, useContext, useEffect } from 'react';
import { database } from '../../Firebase';
import { ref, set, onValue, off } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const CART_STORAGE_KEY = 'shopez_cart';

  const saveCartToStorage = async (cartItems) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const loadCartFromStorage = async () => {
    try {
      const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      return [];
    }
  };


  const syncCartWithFirebase = (cartItems) => {
    if (!user) return;

    const cartRef = ref(database, `carts/R{user.uid}`);
    set(cartRef, cartItems);
  };

  const addToCart = (product) => {
    setLoading(true);
    const existingItem = cart.find(item => item.id === product.id);
    
    let newCart;
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    saveCartToStorage(newCart);
    syncCartWithFirebase(newCart);
    setLoading(false);
  };


  const removeFromCart = (productId) => {
    setLoading(true);
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    saveCartToStorage(newCart);
    syncCartWithFirebase(newCart);
    setLoading(false);
  };

 
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setLoading(true);
    const newCart = cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(newCart);
    saveCartToStorage(newCart);
    syncCartWithFirebase(newCart);
    setLoading(false);
  };


  const clearCart = () => {
    setLoading(true);
    setCart([]);
    saveCartToStorage([]);
    if (user) {
      syncCartWithFirebase([]);
    }
    setLoading(false);
  };


  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };


  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      
      if (user) {

        const cartRef = ref(database, `carts/R{user.uid}`);
        onValue(cartRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setCart(data);
            saveCartToStorage(data);
          } else {

            loadCartFromStorage().then(localCart => {
              if (localCart.length > 0) {
                setCart(localCart);
                syncCartWithFirebase(localCart);
              }
            });
          }
          setLoading(false);
        });
      } else {

        const localCart = await loadCartFromStorage();
        setCart(localCart);
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};