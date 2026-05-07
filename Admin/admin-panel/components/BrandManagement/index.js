'use client';

import { useState } from 'react';
import BrandList from './BrandList';
import BrandProducts from './BrandProducts';

export default function BrandManagement() {
  const [selectedBrand, setSelectedBrand] = useState(null);

  if (selectedBrand) {
    return (
      <BrandProducts 
        brand={selectedBrand} 
        onBack={() => setSelectedBrand(null)} 
      />
    );
  }

  return (
    <BrandList 
      onManageProducts={(brand) => setSelectedBrand(brand)} 
    />
  );
}
