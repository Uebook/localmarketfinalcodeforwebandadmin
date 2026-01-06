'use client';

import VendorDashboardLayout from '@/components/VendorDashboardLayout';
import BulkPriceUpdate from '@/components/BulkPriceUpdate';
import { useRouter } from 'next/navigation';

export default function BulkUpdatePage() {
  const router = useRouter();

  return (
    <VendorDashboardLayout hideTabs={false}>
      <BulkPriceUpdate
        onBack={() => router.push('/vendor/dashboard')}
        vendorProducts={[]}
        onUpdatePrices={() => {
          router.push('/vendor/dashboard/catalog');
        }}
      />
    </VendorDashboardLayout>
  );
}
