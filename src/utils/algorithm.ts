/**
 * Algorithm Challenge: Find products expiring in the next N days
 *
 * @param products - Array of products with id, expiry date, and stock
 * @param days - Number of days to check for expiry
 * @returns Array of product IDs that are expiring within the specified days
 */
export function findExpiring(
  products: { id: string; expiry: string; stock: number }[],
  days: number,
): string[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return products 
    .filter((product) => {
      const expiryDate = new Date(product.expiry);
      // Product expires if expiry date is between now and future date
      return expiryDate >= now && expiryDate <= futureDate;
    })
    .map((product) => product.id);
}
