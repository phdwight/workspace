/**
 * Format currency amounts with proper negative sign placement
 * @param amount - The amount to format
 * @param showPositiveSign - Whether to show a + sign for positive amounts
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, showPositiveSign: boolean = false): string => {
  const absAmount = Math.abs(amount);
  const formattedAmount = `¤${absAmount.toFixed(2)}`;
  
  if (amount < 0) {
    return `-${formattedAmount}`;
  } else if (amount > 0 && showPositiveSign) {
    return `+${formattedAmount}`;
  } else {
    return formattedAmount;
  }
};
