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
    };

    return iconMap[lucideIconName] || 'circle'; // Default fallback
};

