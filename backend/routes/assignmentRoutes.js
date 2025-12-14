const express = require("express");
const {
  assignAsset,
  returnAsset,
} = require("../controllers/assignmentController");

const router = express.Router();

router.post("/assign", assignAsset);
router.put("/return/:assignmentId", returnAsset);

module.exports = router;
