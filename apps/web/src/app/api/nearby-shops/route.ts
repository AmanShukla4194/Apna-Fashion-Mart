import { NextRequest, NextResponse } from 'next/server';

// Geoapify place categories for fashion/apparel (verified from API docs)
const FASHION_CATEGORIES = [
  'commercial.clothing',
  'commercial.clothing.clothes',
  'commercial.clothing.shoes',
  'commercial.clothing.men',
  'commercial.clothing.women',
  'commercial.clothing.kids',
  'commercial.clothing.accessories',
  'commercial.bag',
  'commercial.wedding',
  'service.tailor',
].join(',');

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  men:         ['men', 'gents', 'mens', 'male'],
  women:       ['women', 'ladies', 'female', 'saree', 'kurti', 'lehenga', 'bridal'],
  kids:        ['kids', 'children', 'baby', 'infant'],
  boutique:    ['boutique', 'atelier', 'studio'],
  ethnic:      ['ethnic', 'saree', 'kurti', 'lehenga', 'salwar', 'silk', 'handloom'],
  western:     ['western', 'casual', 'jeans', 'denim'],
  footwear:    ['shoe', 'footwear', 'sandal', 'chappal', 'sneaker'],
  accessories: ['accessories', 'jewelry', 'handbag', 'bag', 'scarf'],
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat      = searchParams.get('lat');
  const lng      = searchParams.get('lng');
  const radiusKm = parseFloat(searchParams.get('radius') || '5');
  const openNow  = searchParams.get('openNow') === 'true';
  const category = searchParams.get('category') || '';

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEOAPIFY_API_KEY is not set in environment variables', shops: [] },
      { status: 500 }
    );
  }

  const userLat      = parseFloat(lat);
  const userLng      = parseFloat(lng);
  const radiusMeters = Math.min(radiusKm * 1000, 50000);

  try {
    const params = new URLSearchParams({
      categories: FASHION_CATEGORIES,
      filter:     `circle:${userLng},${userLat},${radiusMeters}`,
      bias:       `proximity:${userLng},${userLat}`,
      limit:      '50',
      apiKey,
    });

    const res = await fetch(
      `https://api.geoapify.com/v2/places?${params}`,
      { next: { revalidate: 300 } }   // cache 5 min
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('Geoapify error:', res.status, err);
      return NextResponse.json({ error: 'Places API error', shops: [] }, { status: 502 });
    }

    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let features: any[] = data.features || [];

    // Filter by category keywords on shop name
    if (category && CATEGORY_KEYWORDS[category]) {
      const kws = CATEGORY_KEYWORDS[category];
      features = features.filter(f => {
        const name = (f.properties?.name || '').toLowerCase();
        return kws.some((kw: string) => name.includes(kw));
      });
    }

    const shops = features
      .filter(f => f.properties?.name)
      .map(f => {
        const props    = f.properties;
        const shopLng  = f.geometry.coordinates[0] as number;
        const shopLat  = f.geometry.coordinates[1] as number;
        const dist     = haversineKm(userLat, userLng, shopLat, shopLng);

        const address = [props.address_line1, props.address_line2]
          .filter(Boolean).join(', ');

        return {
          id:          props.place_id as string,
          name:        props.name as string,
          address,
          lat:         shopLat,
          lng:         shopLng,
          rating:      null,          // Geoapify free tier does not include ratings
          reviews:     0,
          isOpen:      props.opening_hours ? null : null,
          hours:       props.opening_hours || null,
          photoUrl:    null,
          distanceKm:  Math.round(dist * 10) / 10,
          phone:       props.phone || props.contact?.phone || null,
          website:     props.website || props.contact?.website || null,
          shopType:    (props.categories?.[0] as string)?.split('.').pop() || null,
        };
      });

    // Open Now: Geoapify free tier doesn't return live open/closed status,
    // so we show shops that have hours listed as a best-effort filter
    const finalShops = openNow ? shops.filter(s => s.hours !== null) : shops;

    return NextResponse.json({ shops: finalShops });
  } catch (error) {
    console.error('nearby-shops error:', error);
    return NextResponse.json({ error: 'Internal server error', shops: [] }, { status: 500 });
  }
}
