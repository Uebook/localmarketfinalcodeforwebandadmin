/**
 * AI-Generated Default Items for various categories
 * These help vendors quickly populate their catalog on the website.
 */

export interface AIProductSuggestion {
    name: string;
    description: string;
    price: string;
    image_urls: string[];
    category: string;
}

const CATEGORIES = [
  // 1. Groceries, Food & Beverages
  "Daily Essentials & Grocery",
  "Fruits & Vegetables (Fresh)",
  "Organic & Health Foods",
  "Dairy Products & Milk Booth",
  "Sweets, Desserts & Confectionery",
  "Bakery & Cake Shops",
  "Fresh Meat & Poultry",
  "Fish & Seafood",
  "Spices, Masalas & Herbs",
  "Dry Fruits, Nuts & Seeds",
  "Frozen Foods & Ready-to-Eat",
  "Beverages, Juices & Soft Drinks",
  "Tea, Coffee & Brewing Supplies",
  "Edible Oils, Ghee & Vanaspati",
  "Rice, Grains & Pulses",
  "Flour & Atta Mills",
  "Packaged Snacks & Namkeen",
  "Chocolates & Candies",
  "Ice Cream Parlours",
  "Gourmet & Import Foods",
  "Food Plaza / Restaurants",
  "Cafes & Bistro",
  "Fast Food & Street Food Joints",
  "Food Trucks & Pop-ups",
  "Catering Services",
  "Tiffin & Meal Box Services",
  "Juice Stalls & Shake Bars",
  "Paan & Mouth Freshener Shops",
  "Poultry Feed & Animal Feed Retailers",
  "Breweries & Wine Shops",

  // 2. Apparel, Fashion & Lifestyle
  "Men's Wear (Casual & Formal)",
  "Women's Wear (Ethnic & Western)",
  "Kids' & Infant Wear",
  "Bridal & Wedding Wear",
  "Designer Boutiques",
  "Tailors & Custom Drapers",
  "Sarees & Dress Materials",
  "Innerwear & Sleepwear",
  "Activewear & Gym Apparel",
  "Woolen & Winter Wear",
  "Footwear",
  "Bags & Luggage",
  "Belts, Wallets & Accessories",
  "Jewellery (Gold & Silver)",
  "Fashion & Artificial Jewellery",
  "Watches & Clocks",
  "Eyewear & Optical Frames",
  "Cosmetics & Makeup Products",
  "Perfumes & Body Fragrances",
  "Handlooms & Traditional Crafts",
  "Uniforms (School & Corporate)",
  "Dry Cleaners & Laundry Services",
  "Dyeing & Alteration Services",
  "Fabric & Textile Wholesalers",

  // 3. Electronics, Mobiles & Gadgets
  "Mobile Phone Stores",
  "Mobile Phone Accessories & Cases",
  "Laptops, Desktops & Computer Stores",
  "Computer Accessories & Peripherals",
  "Tablets & E-readers",
  "Smart Home Devices & Automation",
  "Audio Gear (Headphones & Speakers)",
  "Cameras & Photography Equipment",
  "Gaming Consoles & Video Games",
  "Television & Home Entertainment",
  "Major Home Appliances (AC & Fridge)",
  "Small Kitchen Appliances",
  "Electronic Components & DIY Kits",
  "CCTV & Security Systems",
  "Batteries, Inverters & Power Backups",
  "Printers, Scanners & Copiers",
  "Networking Gear (Routers & Modems)",
  "Refurbished & Second-Hand Electronics",
  "Mobile & Gadget Repair Shops",
  "Electronics Rental Services",

  // 4. Home, Furniture & Kitchenware
  "Furniture Showrooms",
  "Carpenters & Wood Craftsmen",
  "Mattress & Bedding Stores",
  "Curtains, Blinds & Drapes",
  "Carpets, Rugs & Doormats",
  "Cushions, Pillows & Sofa Covers",
  "Kitchen Utensils & Cookware",
  "Crockery & Glassware",
  "Home Decor & Wall Arts",
  "Lighting & Decorative Lamps",
  "Plastic Household Goods",
  "Cleaning Utilities",
  "Mirrors & Glass Works",
  "Wallpapers & Decals",
  "Pooja Items & Religious Store",
  "Artifacts, Antiques & Handicrafts",
  "Modular Kitchen Designers",
  "Wardrobe & Storage Solutions",
  "Safe Deposit Boxes & Vaults",
  "General Hardware & Home Essentials",

  // 5. Hardware, Building & Construction
  "Paint, Varnishes & Wall Coatings",
  "Tiles, Marbles & Granite Merchants",
  "Sanitaryware & Bathroom Fittings",
  "Plywood, Laminates & Veneers",
  "Electrical Wires, Switches & Fittings",
  "Plumbing Pipes, Valves & Accessories",
  "Cement, Sand & Bricks Dealers",
  "Steel, Iron Bars & Metal Sheets",
  "Glass Panels & Aluminium Sections",
  "Power Tools & Hand Tools",
  "Fasteners (Screws, Bolts, Nails)",
  "Locks & Home Security Hardware",
  "Water Tanks & Pump Systems",
  "Solar Panels & Green Energy Systems",
  "Adhesives, Sealants & Waterproofing",
  "Roofing Materials & Sheets",
  "Scaffolding & Ladder Rentals",
  "Modular Office Cabin Manufacturers",
  "Iron Grills & Gate Fabricators",
  "Swimming Pool Equipment & Maintenance",
  "Hardware Tools & Equipment Wholesale",
  "Wire Mesh & Fencing Materials",
  "PVC Panels & False Ceiling Materials",
  "Wood Carvers & Timber Merchants",
  "Safety Wear & Protective Gear",

  // 6. Health, Wellness & Pharmacy
  "Retail Pharmacies / Chemists",
  "Ayurvedic & Herbal Medicines",
  "Homeopathic Clinics & Medicines",
  "Surgical Supplies & Medical Equipment",
  "Fitness Supplements & Protein Stores",
  "Dental Clinics & Orthodontics",
  "Eye Care Centers & Optometrists",
  "Hearing Aid & Audiology Centers",
  "Diagnostic Labs & Pathology Centers",
  "Physiotherapy & Clinic Services",
  "Yoga & Meditation Centers",
  "Gyms, Fitness Clubs & Crossfit",
  "Wellness Spas & Massage Therapies",
  "Orthopedic Mattress & Support Stores",
  "Baby Care & Maternity Stores",
  "Organic Cosmetics & Wellness Products",
  "Dieticians & Nutritionists",
  "Mental Health Counseling & Therapy",
  "Wheelchair & Mobility Scooter Retailers",
  "First Aid & Emergency Supplies",

  // 7. Automotive, Wheels & Spares
  "New Car Dealerships",
  "Pre-owned Car Dealers",
  "Two-Wheeler / Bike Showrooms",
  "Electric Vehicle (EV) Dealerships",
  "Bicycle & Cycling Equipment Stores",
  "Car Accessories & Car Audio Stores",
  "Bike Modification & Accessory Shops",
  "Auto Spare Parts (Retail)",
  "Auto Parts Wholesalers",
  "Tyres, Tubes & Wheel Alignment",
  "Car Wash & Detailing Services",
  "Garage & Auto Repair Workshops",
  "Two-Wheeler Service Centers",
  "EV Charging Stations",
  "Car & Bike Battery Dealers",
  "Auto Lubricants & Engine Oils",
  "Rent-a-Car / Self-Drive Rentals",
  "Towing Services",
  "Helmets & Rider Safety Gear",
  "Vehicle Insurance Agents",

  // 8. Books, Stationery & Gifts
  "Academic & School Bookshops",
  "Novel & Literature Bookstores",
  "Comic Book & Manga Stores",
  "Stationery Shops (Office & School)",
  "Art & Craft Supplies",
  "Gift Shops & Novelties",
  "Greeting Cards & Postcards",
  "Party Supplies & Decorations",
  "Corporate Gifting Solutions",
  "Board Games & Puzzles",
  "Custom Printing (Mugs & T-shirts)",
  "Stamps & Coins Collectibles",
  "Musical Instruments & Sheet Music",
  "Packaging Materials",
  "Office Paper & Bulk Printing Supplies",

  // 9. Kids, Toys & Baby Products
  "Toys & Action Figures",
  "Baby Strollers, Prams & Walkers",
  "Nursery Furniture & Cribs",
  "Kids' Learning & Educational Kits",
  "Video Games & Consoles",
  "Kids' Bicycle & Tricycle Stores",
  "Baby Clothes & Infant Essentials",
  "Maternity Wear & Accessories",
  "School Bags & Lunchbox Accessories",
  "Playground Equipment Dealers",
  "Remote Control (RC) Hobby Shops",
  "Soft Toys & Dolls",
  "Kids' Party Organizers & Planners",
  "Baby Bath & Skin Products",
  "Diapers & Hygiene Products",

  // 10. Professional & Business Services
  "Chartered Accountants (CA) & Taxes",
  "Lawyers, Advocates & Notary Services",
  "Real Estate Agents & Brokers",
  "Architects & Interior Designers",
  "Graphic Design & Branding Agencies",
  "Digital Marketing & SEO Services",
  "IT Consulting & Software Developers",
  "Insurance Brokers",
  "Financial Planners & Advisors",
  "Photocopy, Printing & DTP Centers",
  "Courier, Cargo & Logistics Services",
  "Translation & Interpretation Services",
  "HR Consultants & Recruitment Agencies",
  "Advertising & PR Agencies",
  "Vastu & Feng Shui Consultants",
  "Packers & Movers",
  "Printing Press & Flex Printers",
  "Event Managers & Planners",
  "Business Registration Consultants",
  "Private Investigators & Security Agencies",

  // 11. Maintenance, Repair & Cleaning
  "Electricians",
  "Plumbers",
  "Carpenters",
  "AC & Refrigerator Repair Services",
  "RO Water Purifier Service & Spares",
  "House Painters & Texture Artists",
  "Home Cleaning & Sanitization Services",
  "Pest Control Services",
  "Gas Stove & Chimney Repair",
  "TV & Electronics Repair Shop",
  "Key Makers & Locksmiths",
  "Sofa & Upholstery Cleaners",
  "Gardening & Landscaping Services",
  "Masonry & Tiling Services",
  "Scrap Dealers & Recycling Buyers",

  // 12. Agriculture, Gardening & Pets
  "Seeds & Bulbs Store",
  "Plant Nurseries (Indoors & Outdoors)",
  "Fertilizers, Manure & Pesticides",
  "Gardening Tools & Irrigation",
  "Hydroponics & Modern Farming Kits",
  "Pet Grooming Salons",
  "Pet Clinics & Vets",
  "Pet Food & Nutrition Stores",
  "Pet Toy & Accessories Shops",
  "Aquarium, Fish & Coral Retailers",
  "Dog Trainers & Pet Daycare",
  "Poultry Equipment Dealers",
  "Livestock Feed Retailers",
  "Flower & Bouquet Shops (Florists)",
  "Exotic Pet Accessories",

  // 13. Sports, Entertainment & Travel
  "Sports Goods & Equipment Shops",
  "Trophies, Medals & Shield Manufacturers",
  "Bicycles & Accessories",
  "Fitness Accessories",
  "Camping & Hiking Gear",
  "Swimming Wear & Training Accessories",
  "Travel Agencies & Tour Operators",
  "Luggage Repairs & Accessories",
  "Music & Dance Academies",
  "Drama & Theater Costumes Rental",
  "Art Galleries & Frame Shops",
  "Photography Studios",
  "Gaming Parlours & VR Zones",
  "Ticket Booking Counters",
  "Outdoor Adventure Organizers"
];

const ADJECTIVES = ["Premium", "Super", "Eco", "Classic", "Deluxe", "Smart", "Ultra", "Organic", "Pure", "Essential", "Comfort", "Elite", "Pro", "Advance", "Signature", "Natural", "Golden", "Royal", "Choice", "Select"];
const SUFFIXES = ["Pack of 1", "Pack of 2", "Pack of 5", "Set of 3", "Special Edition", "Value Pack", "Standard Size", "Large", "Medium", "Compact", "Heavy Duty", "Pro Edition", "Super Saver"];

const SECTOR_IMAGES: Record<string, string[]> = {
  food: [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=400&q=80"
  ],
  fashion: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=400&q=80"
  ],
  electronics: [
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80"
  ],
  home: [
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1513519247388-193ad51c991b?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80"
  ],
  services: [
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80"
  ]
};

function getSectorForCategory(category: string): string {
  const catLower = category.toLowerCase();
  if (catLower.includes("food") || catLower.includes("grocer") || catLower.includes("dairy") || catLower.includes("sweet") || catLower.includes("meat") || catLower.includes("fish") || catLower.includes("bakery") || catLower.includes("fruit") || catLower.includes("vegetable") || catLower.includes("drink") || catLower.includes("beverage")) {
    return "food";
  }
  if (catLower.includes("wear") || catLower.includes("clothing") || catLower.includes("fashion") || catLower.includes("bag") || catLower.includes("jewel") || catLower.includes("watch") || catLower.includes("cosmetic") || catLower.includes("footwear")) {
    return "fashion";
  }
  if (catLower.includes("phone") || catLower.includes("mobile") || catLower.includes("laptop") || catLower.includes("computer") || catLower.includes("electronic") || catLower.includes("tv") || catLower.includes("cctv") || catLower.includes("gadget") || catLower.includes("smart")) {
    return "electronics";
  }
  if (catLower.includes("furniture") || catLower.includes("decor") || catLower.includes("kitchen") || catLower.includes("utensil") || catLower.includes("bedding") || catLower.includes("mattress") || catLower.includes("curtain") || catLower.includes("light")) {
    return "home";
  }
  return "services";
}

function generate100Products(category: string): AIProductSuggestion[] {
  const words = category.replace(/[()&,/]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !['and', 'the', 'for', 'with', 'shop', 'store', 'stores', 'shops', 'services', 'service'].includes(w.toLowerCase()));
  const baseKeyword = words[0] || "Product";
  const secondKeyword = words[1] || "";
  
  const sector = getSectorForCategory(category);
  const images = SECTOR_IMAGES[sector] || SECTOR_IMAGES.services;
  
  const products: AIProductSuggestion[] = [];
  for (let i = 1; i <= 100; i++) {
    const adj = ADJECTIVES[i % ADJECTIVES.length];
    const suf = SUFFIXES[i % SUFFIXES.length];
    
    let name = "";
    if (i % 3 === 0) {
      name = `${adj} ${baseKeyword} ${secondKeyword ? secondKeyword + ' ' : ''}- ${suf}`;
    } else if (i % 3 === 1) {
      name = `${baseKeyword} ${suf} (${adj})`;
    } else {
      name = `${adj} Quality ${baseKeyword} - Model ${i}`;
    }
    
    name = name.replace(/\s+/g, ' ').trim();
    
    let basePrice = 100;
    if (sector === "electronics") basePrice = 999;
    if (sector === "fashion") basePrice = 499;
    if (sector === "home") basePrice = 799;
    if (sector === "services") basePrice = 299;
    const price = (basePrice + (i * 7) % 300).toString();
    
    const description = `High quality ${name} designed for everyday use in ${category}. Brought to you by Local Market Vendor. Certified quality and durable build.`;
    
    const img1 = images[i % images.length];
    const img2 = images[(i + 1) % images.length];
    
    products.push({
      name,
      description,
      price,
      image_urls: [img1, img2],
      category
    });
  }
  return products;
}

export const AI_DEFAULT_ITEMS: Record<string, AIProductSuggestion[]> = {};
for (const cat of CATEGORIES) {
  AI_DEFAULT_ITEMS[cat] = generate100Products(cat);
}

export const getSuggestedItemsByCategory = (categoryName: string): AIProductSuggestion[] => {
    return AI_DEFAULT_ITEMS[categoryName] || [];
};

export const getAllCategoriesWithSuggestions = (): string[] => {
    return Object.keys(AI_DEFAULT_ITEMS);
};
