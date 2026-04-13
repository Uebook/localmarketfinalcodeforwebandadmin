import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'localmarket_cart';

/**
 * Get all items in the cart
 * @returns {Promise<Array>} List of cart items
 */
export const getCart = async () => {
    try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!saved) return [];
        return JSON.parse(saved);
    } catch (error) {
        console.error('Error getting cart from AsyncStorage:', error);
        return [];
    }
};

/**
 * Save the entire cart to storage
 * @param {Array} items List of items to save
 */
export const saveCart = async (items) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        // You could trigger a global event here if needed, 
        // but in React Native we often use context or state management.
    } catch (error) {
        console.error('Error saving cart to AsyncStorage:', error);
    }
};

/**
 * Add an item to the cart
 * @param {Object} item Item to add
 */
export const addToCart = async (item) => {
    const items = await getCart();
    const existing = items.find(i => i.id === item.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        items.push({ ...item, quantity: 1 });
    }
    await saveCart(items);
};

/**
 * Remove an item from the cart
 * @param {string} itemId ID of the item to remove
 */
export const removeFromCart = async (itemId) => {
    const items = (await getCart()).filter(i => i.id !== itemId);
    await saveCart(items);
};

/**
 * Update the quantity of an item in the cart
 * @param {string} itemId ID of the item to update
 * @param {number} quantity New quantity
 */
export const updateQuantity = async (itemId, quantity) => {
    const items = await getCart();
    const item = items.find(i => i.id === itemId);
    if (item) {
        item.quantity = Math.max(0, quantity);
        if (item.quantity === 0) {
            await removeFromCart(itemId);
            return;
        }
    }
    await saveCart(items);
};

/**
 * Clear the entire cart
 */
export const clearCart = async () => {
    await saveCart([]);
};
