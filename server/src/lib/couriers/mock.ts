import { CourierRateRequest, CourierRateResponse } from './types';

export async function getMockRates(req: CourierRateRequest): Promise<CourierRateResponse[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const basePrice = 4000; // ₹40.00
  const weightFactor = (req.weight_grams / 500) * 2000;
  const volumetricFactor = ((req.length_cm || 10) * (req.width_cm || 10) * (req.height_cm || 10) / 5000) * 1500;
  
  const totalPrice = basePrice + weightFactor + volumetricFactor;

  return [
    {
      courier_id: 'mock_parcel_express',
      courier_name: 'Parcel Express (Mock)',
      logo_url: '/logos/parcel.png',
      price_paise: Math.round(totalPrice),
      official_eta_days: 2,
      cod_available: true,
      cod_fee_paise: 5000,
      pickup_sla_hours: 12,
      rating: 4.8,
      is_sponsored: true,
      tags: ['Fastest', 'Recommended']
    },
    {
      courier_id: 'mock_parcel_economy',
      courier_name: 'Parcel Economy (Mock)',
      logo_url: '/logos/parcel.png',
      price_paise: Math.round(totalPrice * 0.7),
      official_eta_days: 5,
      cod_available: true,
      cod_fee_paise: 3000,
      pickup_sla_hours: 24,
      rating: 4.2,
      is_sponsored: false,
      tags: ['Cheapest']
    }
  ];
}
