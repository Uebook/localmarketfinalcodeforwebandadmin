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
        'Store': 'shopping-cart', // or store if using different set, fallback to shopping-cart

        // Categories
        'Smartphone': 'smartphone',
        'Shirt': 'circle', // Feather doesn't have shirt
        'Pill': 'activity', // Feather doesn't have pill, use 'activity' or 'plus-circle'
        'Zap': 'zap',
        'Home': 'home',
        'Headphones': 'headphones',
        'Trophy': 'award', // Trophy -> award in Feather
        'Scissors': 'scissors',
        'Wrench': 'tool',
        'Car': 'truck', // closest in feather is truck or navigation
        'Book': 'book',
        'Briefcase': 'briefcase',
        'Coffee': 'coffee',
        'Music': 'music',
        'Camera': 'camera',
        'Utensils': 'circle', // fallback
        'Dumbbell': 'activity', // fallback
        'Stethoscope': 'plus-circle', // fallback
        'Building': 'home', // closest
        'GraduationCap': 'book-open', // closest
        'Hammer': 'tool', // closest
        'Truck': 'truck',
        'Baby': 'smile', // closest
        'Tv': 'tv',
        'Sofa': 'square', // fallback
        'Bike': 'circle', // fallback
        'PaintBucket': 'edit-2', // fallback
        'Flower': 'sun', // fallback
        'Leaf': 'wind', // fallback
        'Droplet': 'droplet',

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
        'Grid': 'grid',
        'Ticket': 'tag',
        'Hash': '#', // Note: Using # character, Feather doesn't have hash icon
        'FileText': 'file-text',
        'File': 'file',
        'TrendingUp': 'trending-up',
        'Package': 'package',
        'Bookmark': 'bookmark',
        'Activity': 'activity',
        'Shield': 'shield',
        'Eye': 'eye',
        'Image': 'image',
        'Calendar': 'calendar',
        'Palette': 'circle', // fallback
        'Copy': 'copy',
        'ThumbsUp': 'thumbs-up',
        'Lock': 'lock',
        'PlusCircle': 'plus-circle',
        'CreditCard': 'credit-card',
        'Download': 'download',
        'Upload': 'upload',
        'Tool': 'tool',
        'Apple': 'circle', // Using circle as fallback for apple
        'Drumstick': 'circle', // Using circle as fallback
        'Fish': 'circle', // Using circle as fallback
        'Sparkles': 'star', // Using star as fallback
        'Wind': 'wind',
        'Gem': 'star', // Using star as fallback
        'Footprints': 'circle', // Using circle as fallback
        'Toy': 'circle', // Using circle as fallback
        'Monitor': 'monitor',
        'Gamepad': 'circle', // Using circle as fallback
        'Square': 'square',
        'Layers': 'layers',
        'Bed': 'circle', // Using circle as fallback
        'Sun': 'sun',
        'Box': 'box',
    };

    return iconMap[lucideIconName] || 'circle'; // Default fallback to circle
};

