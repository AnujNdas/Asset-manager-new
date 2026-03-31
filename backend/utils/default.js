const defaultLocations = [
    { name : "United States" },
    { name : "New york city" },
	{ name : "Canada" },
    { name : "Ottawa" },
	{ name : "India" },
    { name : "delhi" },
	{ name : "France" },
    { name : "Paris" },
	{ name : "Germany" },
    { name : "Berlin" },
	{ name : "Italy" },
    { name : "Rome" },
	{ name : "United Kingdom" },
    { name : "London" },
	{ name : "Spain" },
    { name : "Madrid" },
]
const defaultCategories = [
  // HARDWARE (HAM)
  { name: "User End Device", categoryType: "hardware" },
  { name: "Transport", categoryType: "hardware" },
  { name: "Security & Safety", categoryType: "hardware" },
  { name: "Equipment", categoryType: "hardware" },
  { name: "Machinery", categoryType: "hardware" },
  { name: "Tools", categoryType: "hardware" },
  { name: "Robotics", categoryType: "hardware" },
  { name: "Electronics", categoryType: "hardware" },
  { name: "Others", categoryType: "hardware" },

  // SOFTWARE (SAM)
  { name: "Operating System", categoryType: "software" },
  { name: "SaaS", categoryType: "software" },
  { name: "Server", categoryType: "software" },
  { name: "Desktop Applications", categoryType: "software" },
  { name: "Enterprise Systems", categoryType: "software" },
  { name: "Digital Accessories", categoryType: "software" },
  { name: "Storage (Cloud)", categoryType: "software" },
  { name: "AI Models", categoryType: "software" },
  { name: "Data & Infrastructure", categoryType: "software" },
  { name: "Others", categoryType: "software" }
];

const defaultDepartments = [ 
    { name : "Sales" },
    { name : "Research & development" },
    { name : "Product management" },    
    { name : "Operations/administration" },
    { name : "Marketing" },
    { name : "Logistics / warehouse" },
    { name : "Information technology" },
    { name : "Human resources (hr)" },  
    { name : "Finance & accounting" },
    { name : "Customer support" },
]
const defaultStatuses = [            
    { name : "Sold / Donated" },
    { name : "Missing / Stolen" },
    { name : "In Stock" },
    { name : "In Repair" },
    { name : "Disposed" },
    { name : "Active (In use)" },
]
const defaultUnits = [
    { name : "User / seat" },
    { name : "Terabytes (TB)" },
    { name : "Piece" },
    { name : "Gigabytes (GB)" },
    { name : "Device / endpoint" },
    { name : "Cores / Sockets" },
    { name : "Concurrent user" },
]

module.exports = { defaultUnits , defaultCategories , defaultDepartments , defaultLocations , defaultStatuses }