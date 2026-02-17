const express = require("express");
const router = express.Router();
const { createEmployee, getEmployees } = require("../controllers/employeeController");
const authentication = require("../Middleware/Authentication-token");

router.post("/", authentication(["admin" , "user"]), createEmployee);
router.get("/", authentication(["admin" , "user"]), getEmployees);

module.exports = router;
