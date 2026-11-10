/**
 * @typedef {Object} ProductDto
 * @property {number} id
 * @property {string} productCode
 * @property {string} productName
 * @property {number} brandId
 * @property {string} brandName
 * @property {number} categoryId
 * @property {string} categoryName
 * @property {number} importPrice
 * @property {number} salePrice
 * @property {string} status
 */
export const DEFAULT_PRODUCT_FILTER = {
  keyword: '',
  brandId: null,
  categoryId: null,
  status: ''
}
