
/**
 * AI-Generated Default Items for various categories
 * These help vendors quickly populate their catalog.
 */

export const AI_DEFAULT_ITEMS = {
    'Groceries': [
        {
            name: 'Fresh Organic Milk (1L)',
            description: 'Pure, farm-fresh organic cow milk. No preservatives added.',
            price: '65',
            image_urls: [
                'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1563636619-e9108b455242?auto=format&fit=crop&w=400&q=80'
            ],
            category: 'Groceries'
        },
        {
            name: 'Basmati Rice Premium (5kg)',
            description: 'Long-grain aged basmati rice with exquisite aroma.',
            price: '550',
            image_urls: [
                'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1512183588612-ad436f562967?auto=format&fit=crop&w=400&q=80'
            ],
            category: 'Groceries'
        },
        {
            name: 'Farm Fresh Tomatoes (1kg)',
            description: 'Red, juicy, and locally sourced tomatoes.',
            price: '40',
            image_urls: [
                'https://images.unsplash.com/photo-1546095667-0c4e01a98039?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80'
            ],
            category: 'Groceries'
        }
    ],
    'Electronics': [
        {
            name: 'Wireless Bluetooth Earbuds',
            description: 'Noise-canceling earbuds with 24-hour battery life and deep bass.',
            price: '1999',
            image_urls: [
                'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'
            ],
            category: 'Electronics'
        },
        {
            name: 'Smart Watch (Fitness Tracker)',
            description: 'Heart rate monitor, sleep tracking, and multiple sports modes.',
            price: '2999',
            image_urls: [
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1508685096489-775b0af30362?auto=format&fit=crop&w=400&q=80'
            ],
            category: 'Electronics'
        }
    ],
    'Clothing': [
        {
            name: 'Classic White Cotton T-Shirt',
            description: 'Premium 100% cotton, breathable and comfortable for daily wear.',
            price: '499',
            image_urls: [
                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=400&q=80'
            ],
            category: 'Clothing'
        },
        {
            name: 'Slim Fit Denim Jeans',
            description: 'Durable stretchable denim with a modern slim fit layout.',
            price: '1299',
            image_urls: [
                'https://images.unsplash.com/photo-1542272617-08f08630793c?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80'
            ],
            category: 'Clothing'
        }
    ],
    'Home': [
        {
            name: 'Modern Table Lamp',
            description: 'Sleek design with warm LED lighting, perfect for bedside or study.',
            price: '899',
            image_urls: [
                'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80'
            ],
            category: 'Home'
        }
    ],
    'Restaurant': [
        {
            name: 'Butter Chicken Signature Box',
            description: 'Creamy tomato-based gravy with tender chicken pieces and 2 butter naans.',
            price: '350',
            image_urls: [
                'https://images.unsplash.com/photo-1603894527134-c76a91181827?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=400&q=80'
            ],
            category: 'Restaurant'
        }
    ]
};

export const getSuggestedItemsByCategory = (categoryName) => {
    return AI_DEFAULT_ITEMS[categoryName] || [];
};

export const getAllCategoriesWithSuggestions = () => {
    return Object.keys(AI_DEFAULT_ITEMS);
};
