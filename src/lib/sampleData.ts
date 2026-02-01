import { SKUData } from '@/types/inventory';

const productNames = [
  'Wireless Mouse Pro',
  'Mechanical Keyboard RGB',
  'USB-C Hub 7-Port',
  'Laptop Stand Aluminum',
  'Webcam HD 1080p',
  'Monitor Arm Dual',
  'Desk Mat XL',
  'Cable Management Kit',
  'Portable SSD 1TB',
  'Bluetooth Headset',
  'Ergonomic Chair Cushion',
  'LED Desk Lamp',
];

export function generateSampleData(count: number = 12): SKUData[] {
  return Array.from({ length: count }, (_, i) => {
    const basePrice = 20 + Math.random() * 180;
    const dailySales = 5 + Math.random() * 45;
    const leadTime = 3 + Math.floor(Math.random() * 12);
    
    // Some items have healthy inventory, some are at risk
    const riskProfile = Math.random();
    let inventoryMultiplier: number;
    
    if (riskProfile < 0.2) {
      // Low stock scenario
      inventoryMultiplier = 0.3 + Math.random() * 0.3;
    } else if (riskProfile > 0.8) {
      // Overstock scenario
      inventoryMultiplier = 3 + Math.random() * 2;
    } else {
      // Normal scenario
      inventoryMultiplier = 1 + Math.random() * 0.5;
    }
    
    const currentInventory = Math.round(dailySales * leadTime * inventoryMultiplier);
    
    return {
      id: `SKU-${String(i + 1).padStart(4, '0')}`,
      name: productNames[i % productNames.length],
      currentInventory,
      dailySalesRate: Math.round(dailySales * 10) / 10,
      salesVariability: 15 + Math.round(Math.random() * 25),
      leadTimeDays: leadTime,
      leadTimeVariability: 1 + Math.round(Math.random() * 3),
      reorderPoint: Math.round(dailySales * (leadTime * 0.8)),
      reorderQuantity: Math.round(dailySales * 14),
      unitCost: Math.round(basePrice * 100) / 100,
      holdingCostPercent: 15 + Math.round(Math.random() * 10),
    };
  });
}

export function parseCSVData(csvText: string): SKUData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map((line, idx) => {
    const values = line.split(',').map(v => v.trim());
    const getValue = (key: string) => {
      const index = headers.findIndex(h => h.includes(key));
      return index >= 0 ? values[index] : '';
    };
    
    return {
      id: getValue('id') || `SKU-${String(idx + 1).padStart(4, '0')}`,
      name: getValue('name') || `Product ${idx + 1}`,
      currentInventory: parseFloat(getValue('inventory')) || 100,
      dailySalesRate: parseFloat(getValue('sales')) || 10,
      salesVariability: parseFloat(getValue('variability')) || 20,
      leadTimeDays: parseFloat(getValue('lead')) || 7,
      leadTimeVariability: parseFloat(getValue('lead') && getValue('variability')) || 2,
      reorderPoint: parseFloat(getValue('reorder') && getValue('point')) || 50,
      reorderQuantity: parseFloat(getValue('reorder') && getValue('quantity')) || 100,
      unitCost: parseFloat(getValue('cost') || getValue('price')) || 25,
      holdingCostPercent: parseFloat(getValue('holding')) || 18,
    };
  });
}
