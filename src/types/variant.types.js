/**
 * @typedef {Object} ProductVariantDto
 * @property {number} id
 * @property {number} productId
 * @property {string} productCode
 * @property {string} productName
 * @property {number} sizeId
 * @property {string} sizeValue
 * @property {number} colorId
 * @property {string} colorName
 * @property {string} hexCode
 * @property {string} sku
 * @property {number} importPrice
 * @property {number} salePrice
 * @property {number} availableQuantity
 * @property {string} status
 */
export const DEFAULT_VARIANT_FILTER = {
  keyword: '',
  productId: null,
  sizeId: null,
  colorId: null
}
