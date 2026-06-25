/**
 * Generate a unique SKU for a product
 * Format: PREFIX-CATEGORY-TIMESTAMP-RANDOM
 */
const generateSKU = (prefix = 'SKU', categoryName = '') => {
  const catPart = categoryName
    ? categoryName.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')
    : 'GEN';
  const timePart = Date.now().toString(36).toUpperCase().slice(-4);
  const randPart = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `${prefix}-${catPart}-${timePart}${randPart}`;
};

module.exports = generateSKU;
