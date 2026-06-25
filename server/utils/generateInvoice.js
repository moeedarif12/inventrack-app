/**
 * Generate a unique invoice number
 * Format: PREFIX-YEAR-SEQUENCE (e.g., INV-2024-000001)
 */
const generateInvoiceNumber = async (Sale, businessId, prefix = 'INV') => {
  const year = new Date().getFullYear();
  const count = await Sale.countDocuments({ business: businessId });
  const sequence = String(count + 1).padStart(6, '0');
  return `${prefix}-${year}-${sequence}`;
};

module.exports = generateInvoiceNumber;
