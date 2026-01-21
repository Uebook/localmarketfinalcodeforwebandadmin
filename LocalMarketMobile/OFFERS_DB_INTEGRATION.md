# Offers Screen Database Integration

## ✅ Complete Database Integration

The OffersScreen component now fetches **ALL offers from the database** via the Festive Offers API.

## 🔄 Changes Made

### 1. **Removed Hardcoded Data**
- ❌ Removed dependency on `vendorData.offers` (constants)
- ❌ Removed dependency on `NEARBY_BUSINESSES` (constants)
- ✅ Now uses only database offers

### 2. **API Integration**

#### Updated `getFestiveOffers()` in `src/services/api.js`
- Now accepts filters (status)
- Returns array directly (not wrapped in `{offers: []}`)
- Handles both old and new response formats

#### Updated `OffersScreen.js`
- Fetches offers from `/api/festive-offers` with `status=active`
- Filters offers by:
  - Status: `active` only
  - Date range: Current date must be between `start_date` and `end_date`
- Fetches vendor details for vendor-specific offers
- Transforms database format to UI format

### 3. **Data Transformation**

Database fields → UI format:
- `id` → `id`
- `title` → `title`
- `description` → `description`
- `discount_percent` → `discount`
- `start_date` → `startDate`
- `end_date` → `endDate`
- `vendor_ids` → `vendorIds`
- `type`, `target`, `circle` → Preserved for filtering

### 4. **Vendor-Specific Offers**

- If offer `target === 'specific'` and has `vendor_ids`:
  - Fetches vendor details from Vendors API
  - Updates `businessName` with vendor name
  - Updates `businessId` with vendor ID
  - Makes offer clickable to navigate to vendor details

### 5. **Offer Display**

Each offer shows:
- Title
- Description
- Discount percentage badge (if > 0)
- Offer code (if available)
- Business/Vendor name
- "Redeem Now" button

## 📊 Database Schema

**Table**: `festive_offers`

**Fields**:
- `id` (UUID) - Primary key
- `title` (TEXT) - Offer title
- `type` (TEXT) - 'vendor' or 'user'
- `target` (TEXT) - 'all', 'circle', or 'specific'
- `circle` (TEXT) - Circle name (if target='circle')
- `vendor_ids` (UUID[]) - Array of vendor IDs (if target='specific')
- `start_date` (DATE) - Offer start date
- `end_date` (DATE) - Offer end date
- `discount_percent` (NUMERIC) - Discount percentage
- `description` (TEXT) - Offer description
- `status` (TEXT) - 'active', 'inactive', or 'expired'
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## 🎯 Features

### ✅ Active Offers Only
- Filters by `status = 'active'`
- Checks date range (current date between start and end)

### ✅ Vendor-Specific Offers
- Fetches vendor names for vendor-specific offers
- Shows vendor name instead of "Festive Offer"
- Clickable to navigate to vendor details

### ✅ Loading States
- Shows loading indicator while fetching
- Empty state when no offers available

### ✅ Error Handling
- Gracefully handles API errors
- Falls back to empty array on error
- Console logs for debugging

## 🔌 API Endpoints Used

1. **GET** `/api/festive-offers?status=active`
   - Fetches all active festive offers
   - Returns array of offers

2. **GET** `/api/vendors?status=Active&limit=100`
   - Fetches vendors for vendor-specific offers
   - Used to get vendor names

## 📱 Component Props

```javascript
<OffersScreen
  navigation={navigation}
  locationState={locationState} // Optional, for future location-based filtering
/>
```

## 🚀 Future Enhancements

1. **Location-Based Filtering**
   - Filter offers by user's location/circle
   - Show only relevant offers based on location

2. **Offer Categories**
   - Group offers by type (vendor/user)
   - Filter by circle

3. **Pull-to-Refresh**
   - Allow users to refresh offers
   - Update when returning to screen

4. **Offer Details Page**
   - Navigate to detailed offer page
   - Show terms and conditions
   - Show applicable vendors/products

---

**Last Updated**: January 2024
**Status**: ✅ All offers now fetched from database
