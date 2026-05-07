import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart, saveCart, addToCart as addToCartUtil, removeFromCart as removeFromCartUtil, updateQuantity as updateQuantityUtil, clearCart as clearCartUtil } from '../utils/cartStorage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    const refreshCart = async () => {
        const items = await getCart();
        setCartItems(items || []);
        const count = (items || []).reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
    };

    useEffect(() => {
        refreshCart();
    }, []);

    const addToCart = async (item, vendorId, vendorName) => {
        // Ensure item has vendor info
        const itemWithVendor = {
            ...item,
            id: item.id,
            name: item.name || item.title || 'Product',
            price: item.price || 0,
            image: item.image || item.image_url || item.imageUrl || (item.images && item.images[0]),
            vendorId: vendorId || item.vendorId || item.vendor_id,
            vendorName: vendorName || item.vendorName || item.shop_name || item.business_name || 'Local Store'
        };
        await addToCartUtil(itemWithVendor);
        await refreshCart();
    };

    const removeFromCart = async (itemId) => {
        await removeFromCartUtil(itemId);
        await refreshCart();
    };

    const updateQuantity = async (itemId, quantity) => {
        await updateQuantityUtil(itemId, quantity);
        await refreshCart();
    };

    const clearCart = async () => {
        await clearCartUtil();
        await refreshCart();
    };

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            cartCount, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart,
            refreshCart 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
