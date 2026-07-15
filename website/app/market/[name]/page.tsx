import React from 'react';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';
import MarketDetailClient from './MarketDetailClient';

interface PageProps {
       params: Promise<{ name: string }>;
}

async function getMarketData(marketName: string) {
       try {
              let vendors: any[] = [];
              const locResponse = await supabaseRestGet(`/rest/v1/locations?circle=eq.${encodeURIComponent(marketName)}&limit=1`, {
                     next: { revalidate: 60 }
              });
              const loc = locResponse?.[0];

              if (loc) {
                     const vendorsResponse = await supabaseRestGet(`/rest/v1/vendors?city=eq.${encodeURIComponent(loc.city)}&select=*`, {
                            next: { revalidate: 60 }
                     });

                     vendors = (vendorsResponse || []).filter((v: any) => {
                            // Check status
                            const isActive = v.status === 'Active' ||
                                   v.is_verified === true ||
                                   v.kyc_status === 'Verified' ||
                                   v.kycStatus === 'Verified';
                            if (!isActive) return false;

                            const vCircle = v.circle?.trim().toLowerCase();
                            const vTown = v.town?.trim().toLowerCase();
                            const locCircle = loc.circle?.trim().toLowerCase();
                            const locTown = loc.town?.trim().toLowerCase();

                            // Match 1: Direct circle match
                            if (vCircle === locCircle) return true;

                            // Match 2: Vendor registered with macro-circle (v.circle is North Circle) matching loc.town (NORTH CIRCLE)
                            if (vCircle && locTown && vCircle === locTown) return true;

                            // Match 3: Vendor town matches loc.town and circle is not specified or same as town
                            if (vTown && locTown && vTown === locTown && (!vCircle || vCircle === vTown)) return true;

                            return false;
                     });
              } else {
                     const words = marketName.split(/\s+/).filter(w =>
                            w.length > 2 && !['market', 'street', 'circle', 'area', 'town'].includes(w.toLowerCase())
                     );
                     const primaryKeyword = words[0] || marketName;
                     const encodedKeyword = encodeURIComponent(`*${primaryKeyword}*`);
                     const encodedFullName = encodeURIComponent(`*${marketName}*`);

                     // Try searching for the full name OR the primary keyword across columns
                     const query = `/rest/v1/vendors?or=(sub_tehsil.ilike.${encodedFullName},circle.ilike.${encodedFullName},town.ilike.${encodedFullName},circle.ilike.${encodedKeyword},town.ilike.${encodedKeyword})&select=*`;
                     const vendorsResponse = await supabaseRestGet(query, {
                            next: { revalidate: 60 }
                     });

                     // Allow any shop that is Active, or has been verified by admin
                     vendors = (vendorsResponse || []).filter((v: any) =>
                            v.status === 'Active' ||
                            v.is_verified === true ||
                            v.kyc_status === 'Verified' ||
                            v.kycStatus === 'Verified'
                     );
              }

              // Fetch some products from these vendors to show trending items
              let products: any[] = [];
              if (vendors.length > 0) {
                     const vendorIds = vendors.map((v: any) => v.id).join(',');
                     const productsResponse = await supabaseRestGet(
                            `/rest/v1/vendor_products?vendor_id=in.(${vendorIds})&limit=12&select=*,vendors(name)`,
                            { next: { revalidate: 60 } }
                     );
                     products = productsResponse || [];
              }

              return { vendors, products };
       } catch (error) {
              console.error('Error fetching market data:', error);
              return { vendors: [], products: [] };
       }
}

export default async function Page({ params }: PageProps) {
       const resolvedParams = await params;
       const marketName = decodeURIComponent(resolvedParams.name);
       const data = await getMarketData(marketName);

       return <MarketDetailClient marketName={marketName} initialData={data} />;
}
