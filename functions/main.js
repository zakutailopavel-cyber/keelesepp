const existingFunctions = require('./index');
const { manualInvoiceApi } = require('./manual-invoice-api');
const { automaticInvoicePreview } = require('./auto-invoice-preview');

module.exports = {
  ...existingFunctions,
  manualInvoiceApi,
  automaticInvoicePreview,
};
