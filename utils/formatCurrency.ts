interface iAppProps {
 amount: number;
 currency: 'USD' | 'EUR' | 'NGN';
}

// export function formatCurrency({ amount, currency }: iAppProps) {
//  return new Intl.NumberFormat('en-NG', {
//   style: 'currency',
//   currency: currency,
//  }).format(amount);
// }

export function formatCurrency({ amount, currency }: iAppProps) {
 const currencyMap = {
  USD: 'en-US',
  EUR: 'de-DE',
  NGN: 'en-NG',
 };

 return new Intl.NumberFormat(currencyMap[currency], {
  style: 'currency',
  currency: currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
 }).format(amount);
}
