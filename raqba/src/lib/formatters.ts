/**
 * Pakistani Currency & Area Formatting Utilities
 * Standard: Lakh (100,000) and Crore (10,000,000) in PKR (Rs)
 */

export function formatPKR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rs 0';
  const abs = Math.abs(amount);

  if (abs >= 10000000) {
    const crores = amount / 10000000;
    // Format to 1 or 2 decimal places if needed
    const formatted = crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(2).replace(/\.?0+$/, '');
    return `Rs ${formatted} Crore`;
  } else if (abs >= 100000) {
    const lakhs = amount / 100000;
    const formatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2).replace(/\.?0+$/, '');
    return `Rs ${formatted} Lakh`;
  } else {
    return `Rs ${amount.toLocaleString('en-PK')}`;
  }
}

export function formatArea(size: number, unit: 'Marla' | 'Kanal' | 'Sq Ft' | 'Sq Yd'): string {
  if (!size) return '';
  return `${size} ${unit}`;
}

export function formatUrduPKR(amount: number | null | undefined): string {
  if (!amount) return '0 روپے';
  if (amount >= 10000000) {
    const crores = (amount / 10000000).toFixed(2).replace(/\.?0+$/, '');
    return `${crores} کروڑ روپے`;
  } else if (amount >= 100000) {
    const lakhs = (amount / 100000).toFixed(2).replace(/\.?0+$/, '');
    return `${lakhs} لاکھ روپے`;
  }
  return `${amount.toLocaleString()} روپے`;
}
