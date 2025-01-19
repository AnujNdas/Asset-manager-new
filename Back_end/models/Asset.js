const mongoose = require("mongoose")

const assetSchema = new mongoose.Schema({
    assetCode : {
        type: String,
        required: true,
    },
    assetCategory : {
        type: String,
        required: true,
    },
    barcodeNumber : {
        type : String,
        required: true,
    },
    assetName : {
        type : String,
        required : true,
    },
    associateUnit : {
        type : String,
        required: true,
    },
    remarks : {
        type : String,
        required: true,
    },
    locationName : {
        type : String,
        required: true,
    },
    assetSpecification : {
        type : String,
        required: true,
    },
    assetStatus : {
        type : String,
        required: true,
    },
    DOP : {
        type : String,
        required: true,
    },
    DOE : {
        type : String,
        required: true,
    },
    assetLifetime : {
        type : String,
        required: true,
    },
    purchaseFrom : {
        type : String,
        required: true,
    },
    PMD : {
        type : String,
        required: true,
    },
})

const Assets = mongoose.model("Assets", assetSchema);
module.exports = Assets