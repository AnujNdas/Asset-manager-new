const Asset = require("../models/Asset")

// Add a new Asset
const addAsset = async (req,res) => {
    try {
        console.log("Incoming data:", req.body); // Log the incoming request
        const newAsset = new Asset(req.body);
        const savedAsset = await newAsset.save();
        res.status(201).json(savedAsset);
    } catch (error) {
        res.status(500).json({ message : "Error adding asset",error: error.message});
    }
};

// Delete an asset by ID
const deleteAsset = async (req,res) => {
    try {
        const { id } = req.params;
        const deletedAsset = await Asset.findByIdAndDelete(id);
        if (!deletedAsset) {
            return res.status(404).json({ message : "Asset not found"});
        }
        res.status(200).json({ message : "Asset succesfully deleted", deletedAsset});
    } catch (error) {
        res.status(500).json({ message : "Error deleting asset", error : error.message});
    }
};

// Get all Assets
const getAllAssets = async (req,res)=>{
    try {
        const Assets = await Asset.find();
        res.status(200).json(Assets);
    } catch (error) {
        res.status(500).json({ message : "Error feteching assets", error : error.message});
    }
};

module.exports = {
    addAsset,
    deleteAsset,
    getAllAssets
};