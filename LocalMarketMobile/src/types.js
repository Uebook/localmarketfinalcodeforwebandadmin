// Type definitions (JSDoc for JavaScript)

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} iconName
 */

/**
 * @typedef {Object} Offer
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} code
 * @property {string} discountAmount
 * @property {string} validUntil
 * @property {boolean} isActive
 * @property {string} [color]
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} price
 * @property {string} imageUrl
 * @property {string} [description]
 * @property {'product'|'service'} [type]
 * @property {string} [category]
 * @property {string} [mrp]
 * @property {string} [stockQty]
 * @property {string} [uom]
 * @property {string} [brand]
 * @property {boolean} [isFastMoving]
 * @property {boolean} [inStock]
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} userName
 * @property {number} rating
 * @property {string} date
 * @property {string} comment
 * @property {string} [reply]
 */

/**
 * @typedef {Object} Business
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {number} rating
 * @property {number} reviewCount
 * @property {string} distance
 * @property {string} imageUrl
 * @property {boolean} [isPromoted]
 * @property {boolean} [isVerified]
 * @property {string} [address]
 * @property {string} [yearsInBusiness]
 * @property {string} [openTime]
 * @property {string} [reviewSnippet]
 * @property {string} [responseTime]
 * @property {string} [about]
 * @property {Product[]} [products]
 * @property {Review[]} [reviews]
 * @property {Offer[]} [offers]
 * @property {string} [landmark]
 * @property {string} [city]
 * @property {string} [district]
 * @property {string} [pincode]
 * @property {string} [circle]
 * @property {string} [weeklyOff]
 */

/**
 * @typedef {Object} Enquiry
 * @property {string} id
 * @property {string} senderName
 * @property {string} senderMobile
 * @property {string} message
 * @property {string} date
 * @property {'new'|'read'|'replied'} status
 */

/**
 * @typedef {Object} VendorProfile
 * @extends {Business}
 * @property {string} ownerName
 * @property {string} contactNumber
 * @property {string} email
 * @property {string} [alternateMobile]
 * @property {string} [whatsappNumber]
 * @property {string} [referralCode]
 * @property {{lat: number, lng: number}} [geoLocation]
 * @property {string} [openingTime]
 * @property {string} [closingTime]
 * @property {string} [ownerPhotoUrl]
 * @property {string} [shopFrontPhotoUrl]
 * @property {string} [insideShopPhotoUrl]
 * @property {'Aadhaar'|'PAN'|'Voter ID'|'Driving Licence'} [idProofType]
 * @property {string} [idProofUrl]
 * @property {'GST Certificate'|'Shop License'|'Rent Agreement'|'Utility Bill'} [shopProofType]
 * @property {string} [shopProofUrl]
 * @property {string} [gstNumber]
 * @property {string} [panNumber]
 * @property {string} [username]
 * @property {boolean} [otpVerified]
 * @property {'Pending'|'Approved'|'Rejected'} [kycStatus]
 * @property {'Active'|'Pending'|'Blocked'} [activationStatus]
 * @property {string[]} [secondaryCategories]
 * @property {string[]} [customCategories]
 * @property {'Daily'|'Alternate days'|'Weekly'} [priceUpdateFrequency]
 * @property {'In Stock'|'Out of Stock'} [stockUpdateOption]
 * @property {boolean} [enableBulkUpload]
 * @property {boolean} [enablePriceNotifications]
 * @property {'500m'|'1km'|'2km'} [competitorRadius]
 * @property {string[]} [allowedCategories]
 * @property {Enquiry[]} enquiries
 */

/**
 * @typedef {Object} CustomerProfile
 * @property {string} name
 * @property {string} mobile
 * @property {string} location
 * @property {string} [email]
 * @property {string} [profilePhotoUrl]
 */

/**
 * @typedef {Object} PromoBanner
 * @property {string} id
 * @property {string} title
 * @property {string} subtitle
 * @property {string} imageUrl
 * @property {string} ctaText
 */

/**
 * @typedef {Object} GeoLocationState
 * @property {number|null} lat
 * @property {number|null} lng
 * @property {string} city
 * @property {boolean} loading
 * @property {string|null} error
 */

/**
 * @typedef {Object} ServiceItem
 * @property {string} id
 * @property {string} name
 * @property {string} imageUrl
 */

/**
 * @typedef {'default'|'blue'|'green'|'purple'|'dark'} ThemeOption
 */

