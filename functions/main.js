const existingFunctions = require('./index');
const { manualInvoiceApi } = require('./manual-invoice-api');
const { learningSessionApi } = require('./learning-session-api');
const { learningProfileEvidenceApi } = require('./learning-profile-evidence-api');

module.exports = {
  ...existingFunctions,
  manualInvoiceApi,
  learningSessionApi,
  learningProfileEvidenceApi,
};