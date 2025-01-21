const mongoose = require('mongoose');

// Last Asset Code Schema
const lastAssetCodeSchema = new mongoose.Schema({
  lastCode: { type: Number, required: true },
});

const LastAssetCode = mongoose.model('LastAssetCode', lastAssetCodeSchema);
module.exports = LastAssetCode;

