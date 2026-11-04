// Formatting utilities for Pakistani Currency (PKR Lakh/Crore) and Land Area (Marla/Kanal)

export function formatPKR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rs 0';
  
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    return `Rs ${crore.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Crore`;
  }
  
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `Rs ${lakh.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Lakh`;
  }
  
  return `Rs ${amount.toLocaleString('en-US')}`;
}

export function formatArea(size: number | null | undefined, unit: string = 'Marla'): string {
  if (!size) return '';
  return `${size} ${unit}`;
}
