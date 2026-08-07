const existingFunctions = require('./index');
const { manualInvoiceApi } = require('./manual-invoice-api');

module.exports = {
  ...existingFunctions,
  manualInvoiceApi,
};
