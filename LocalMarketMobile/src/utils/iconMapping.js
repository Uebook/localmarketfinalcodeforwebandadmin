// Icon mapping utility to convert lucide-react icon names to react-native-vector-icons
// This maps icon names from the web version to appropriate Feather icons

export const getIconName = (lucideIconName) => {
    const iconMap = {
        // Navigation & UI
        'Menu': 'menu',
        'MapPin': 'map-pin',
        'ChevronDown': 'chevron-down',
        'ChevronLeft': 'chevron-left',
        'ArrowLeft': 'arrow-left',
        'User': 'user',
        'Bell': 'bell',
        'Search': 'search',
        'Mic': 'mic',
        'Clock': 'clock',
        'Star': 'star',
        'Phone': 'phone',
        'ChevronRight': 'chevron-right',
        'Heart': 'heart',
        'ShoppingBag': 'shopping-bag',
        'Gift': 'gift',
        'ChevronUp': 'chevron-up',
        'Tag': 'tag',
        'Store': 'store',

        // Categories
        'Smartphone': 'smartphone',
        'Shirt': 'shirt',
        'Pill': 'pill', // Note: Feather doesn't have pill, use 'activity' or 'plus-circle'
        'Zap': 'zap',
        'Home': 'home',
        'Headphones': 'headphones',
        'Trophy': 'award', // Trophy -> award in Feather

        // Additional icons that might be needed
        'X': 'x',
        'Check': 'check',
        'Edit': 'edit',
        'Trash': 'trash-2',
        'Plus': 'plus',
        'Minus': 'minus',
        'Settings': 'settings',
        'LogOut': 'log-out',
        'HelpCircle': 'help-circle',
        'Info': 'info',
        'Mail': 'mail',
        'MessageCircle': 'message-circle',
        'MessageSquare': 'message-square',
        'Share2': 'share-2',
        'MoreVertical': 'more-vertical',
        'CheckCircle': 'check-circle',
        'SlidersHorizontal': 'sliders',
        'Sliders': 'sliders',
        'AlertCircle': 'alert-circle',
        'ArrowRight': 'arrow-right',
        'Briefcase': 'briefcase',
        'Grid': 'grid',
        'Ticket': 'tag',
        'Hash': '#', // Note: Using # character, Feather doesn't have hash icon
        'FileText': 'file-text',
        'File': 'file',
        'TrendingUp': 'trending-up',
        'Package': 'package',
        'MessageSquare': 'message-square',
        'Wrench': 'tool',
        'Bookmark': 'bookmark',
        'Activity': 'activity',
        'Plus': 'plus',
        'Shield': 'shield',
        'Camera': 'camera',
        'Eye': 'eye',
        'Image': 'image',
        'Calendar': 'calendar',
        'Palette': 'palette',
        'Copy': 'copy',
        'ThumbsUp': 'thumbs-up',
        'Lock': 'lock',
        'ArrowRight': 'arrow-right',
        'PlusCircle': 'plus-circle',
        'CreditCard': 'credit-card',
        'Download': 'download',
        'Upload': 'upload',
        'Tool': 'tool',
        'Apple': 'circle', // Using circle as fallback for apple
        'Droplet': 'droplet',
        'Drumstick': 'circle', // Using circle as fallback
        'Fish': 'circle', // Using circle as fallback
        'Sparkles': 'star', // Using star as fallback
        'Wind': 'wind',
        'Gem': 'star', // Using star as fallback
        'Footprints': 'circle', // Using circle as fallback
        'Toy': 'circle', // Using circle as fallback
        'Music': 'music',
        'Monitor': 'monitor',
        'Gamepad': 'circle', // Using circle as fallback
        'Car': 'circle', // Using circle as fallback
        'Bike': 'circle', // Using circle as fallback
        'Square': 'square',
        'Layers': 'layers',
        'Bed': 'circle', // Using circle as fallback
        'Sun': 'sun',
        'Utensils': 'circle', // Using circle as fallback
        'Box': 'box',
        'Leaf': 'circle', // Using circle as fallback
        'Wrench': 'tool',
        'Toy': 'circle', // Using circle as fallback
        'Drumstick': 'circle', // Using circle as fallback
        'Fish': 'circle', // Using circle as fallback
        'Footprints': 'circle', // Using circle as fallback
        'Gamepad': 'circle', // Using circle as fallback
        'Car': 'circle', // Using circle as fallback
        'Bike': 'circle', // Using circle as fallback
        'Bed': 'circle', // Using circle as fallback
        'Utensils': 'circle', // Using circle as fallback
    };

    return iconMap[lucideIconName] || 'circle'; // Default fallback to circle
};

