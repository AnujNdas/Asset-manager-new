import React, { useState } from "react";
import { upgradeInstance } from "../Services/ApiServices";
import ThemeSwal from "../utils/swalTheme";
import { useOrganization } from "../Context/OrganizationContext";
import Select from "react-select";
import {
  FaTools,
  FaShieldAlt,
  FaCalendarAlt,
  FaDollarSign,
  FaSyncAlt,
  FaLaptop,
} from "react-icons/fa";

const coverageOptions = [
  { label: "Comprehensive", value: "comprehensive" },
  { label: "Accidental Damage", value: "accidental_damage" },
  { label: "Third Party", value: "third_party" },
  { label: "Theft & Burglary", value: "theft_burglary" },
  { label: "Fire & Lightning", value: "fire_lightning" },
  { label: "Natural Disasters", value: "natural_disasters" },
  { label: "Vandalism", value: "vandalism" },
  { label: "Business Interruption", value: "business_interruption" },
  { label: "Transit / Marine Cargo", value: "transit_marine_cargo" },
  { label: "Cyber-Physical Damage", value: "cyber_physical_damage" },
  { label: "Electrical Surge", value: "electrical_surge" },
  { label: "Mechanical Breakdown", value: "mechanical_breakdown" },
  { label: "Other", value: "other" },
  { label: "None", value: "none" },
];
const UpgradeModal = ({ instance, onClose, refresh }) => {
  console.log("Select =", Select);
  console.log(instance)
  const { organization } = useOrganization();
  const currency = organization?.currency;
  const isHardware = instance?.assetType === "hardware";
  const isSoftware = instance?.assetType === "software";
  const [activeTab, setActiveTab] = useState("renewal");

  /* =============================
     🔹 FIELD CONFIG (DYNAMIC)
  ============================== */

// const fieldConfig = [
//   ...(isHardware
//     ? [
//         {
//           name: "maintenanceCost",
//           label: "Maintenance Cost",
//           type: "number",
//           current:
//             instance?.hardware?.costs?.maintenanceCost?.amount || 0,
//         },
//         {
//           name: "warrantyRenewalCost",
//           label: "Warranty Renewal Cost",
//           type: "number",
//           current:
//             instance?.hardware?.costs?.warrantyRenewalCost?.amount || 0,
//         },
//         {
//           name: "insuranceCost",
//           label: "Insurance Cost",
//           type: "number",
//           current:
//             instance?.hardware?.costs?.insuranceCost?.amount || 0,
//         },

//         {
//           name: "newWarrantyPurchaseDate",
//           label: "Warranty Purchase Date",
//           type: "date",
//           current:
//             instance?.hardware?.warrantyPurchaseDate?.split("T")[0] || "-",
//         },
//         {
//           name: "newWarrantyExpiry",
//           label: "Warranty Expiry",
//           type: "date",
//           current:
//             instance?.hardware?.warrantyExpiry?.split("T")[0] || "-",
//         },

//         {
//           name: "newInsurancePurchaseDate",
//           label: "Insurance Purchase Date",
//           type: "date",
//           current:
//             instance?.hardware?.insurancePurchaseDate?.split("T")[0] || "-",
//         },
//         {
//           name: "newInsuranceExpiry",
//           label: "Insurance Expiry",
//           type: "date",
//           current:
//             instance?.hardware?.insuranceExpiry?.split("T")[0] || "-",
//         },

//         {
//           name: "newMaintenanceDate",
//           label: "Next Maintenance Date",
//           type: "date",
//           current:
//             instance?.hardware?.nextMaintenanceDate?.split("T")[0] || "-",
//         },

//         {
//           name: "newInstallationDate",
//           label: "Installation Date",
//           type: "date",
//           current:
//             instance?.hardware?.installationDate?.split("T")[0] || "-",
//         },
//       ]
//     : []),

//   ...(isSoftware
//     ? [
//         {
//           name: "renewalCost",
//           label: "Renewal Cost",
//           type: "number",
//           current:
//             instance?.software?.costs?.renewalCost?.amount || 0,
//         },
//         {
//           name: "newRenewalDate",
//           label: "Renewal Date",
//           type: "date",
//           current:
//             instance?.software?.renewalDate?.split("T")[0] || "-",
//         },
//         {
//           name: "newLastUsedDate",
//           label: "Last Used Date",
//           type: "date",
//           current:
//             instance?.software?.lastUsedDate?.split("T")[0] || "-",
//         },
//         {
//           name: "newInstallationDate",
//           label: "Installation Date",
//           type: "date",
//           current:
//             instance?.software?.installationDate?.split("T")[0] || "-",
//         },
//       ]
//     : []),
// ];  
  /* =============================
     🔹 INITIAL STATE
  ============================== */
  // SOFTWARE CURRENT VALUES
const currentRenewalCost =
  instance?.software?.costs?.renewalCost?.amount || 0;

const currentRenewalDate =
  instance?.software?.renewalDate?.split("T")[0] || "";

// HARDWARE CURRENT VALUES
const currentMaintenanceCost =
  instance?.hardware?.costs?.maintenanceCost?.amount || 0;

const currentWarrantyCost =
  instance?.hardware?.costs?.warrantyRenewalCost?.amount || 0;

const currentInsuranceCost =
  instance?.hardware?.costs?.insuranceCost?.amount || 0;

const [form, setForm] = useState({
  // ❌ REMOVE currency

 maintenanceCost: "",
warrantyRenewalCost: "",
insuranceCost: "",

renewalCost: "",

newWarrantyPurchaseDate: "",
newInsurancePurchaseDate: "",

newWarrantyExpiry: "",
newInsuranceExpiry: "",

newMaintenanceDate: "",
maintenancePerformedOn: "",

warrantyRenewedOn: "",

insuranceRenewedOn: "",

licenseRenewedOn: "",
newRenewalDate: "",
hasInsurance:
  instance?.hardware?.hasInsurance || false,

insuranceTerm:
  instance?.hardware?.insuranceTerm || "1_year",
  newLastUsedDate:
    instance?.software?.lastUsedDate?.split("T")[0] || "",

  newInstallationDate:
    instance?.hardware?.installationDate?.split("T")[0] ||
    instance?.software?.installationDate?.split("T")[0] ||
    "",
  coverageType:
  instance?.hardware?.coverageType || [],
  condition: instance?.condition || "",
  upgradeDescription: "",
  upgradeNotes: "",
  upgradeDate: new Date().toISOString().split("T")[0] ,
  upgradeCost: "",
});

  /* =============================
     🔹 HANDLERS
  ============================== */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
const payload = {
  condition: form.condition || undefined,
};
const isUpgrade =
form.upgradeDescription?.trim() ||
Number(form.upgradeCost) > 0;

if (isUpgrade) {
payload.upgradeDescription = form.upgradeDescription.trim();
payload.upgradeNotes = form.upgradeNotes || undefined;
payload.upgradeDate = form.upgradeDate || undefined;
payload.upgradeCost = Number(form.upgradeCost) || 0;
}
if (isHardware) {
  if (form.maintenancePerformedOn) {
  payload.maintenancePerformedOn =
    form.maintenancePerformedOn;
}

if (form.warrantyRenewedOn) {
  payload.warrantyRenewedOn =
    form.warrantyRenewedOn;
}

if (form.insuranceRenewedOn) {
  payload.insuranceRenewedOn =
    form.insuranceRenewedOn;
}
  if (form.maintenanceCost !== "") {
    payload.maintenanceCost =
      Number(form.maintenanceCost);
  }

  if (form.warrantyRenewalCost !== "") {
    payload.warrantyRenewalCost =
      Number(form.warrantyRenewalCost);
  }

  if (form.insuranceCost !== "") {
    payload.insuranceCost =
      Number(form.insuranceCost);
  }

  payload.hasInsurance =
    form.hasInsurance;

  payload.insuranceTerm =
    form.insuranceTerm;

  if (form.newWarrantyPurchaseDate) {
    payload.newWarrantyPurchaseDate =
      form.newWarrantyPurchaseDate;
  }

  if (form.newWarrantyExpiry) {
    payload.newWarrantyExpiry =
      form.newWarrantyExpiry;
  }

  if (form.newInsurancePurchaseDate) {
    payload.newInsurancePurchaseDate =
      form.newInsurancePurchaseDate;
  }

  if (form.newInsuranceExpiry) {
    payload.newInsuranceExpiry =
      form.newInsuranceExpiry;
  }

  if (form.newMaintenanceDate) {
    payload.newMaintenanceDate =
      form.newMaintenanceDate;
  }

  if (form.newInstallationDate) {
    payload.newInstallationDate =
      form.newInstallationDate;
  }
  if (form.coverageType?.length) {
  payload.coverageType = form.coverageType;
}
}
if (isSoftware) {
if (form.licenseRenewedOn) {
  payload.licenseRenewedOn =
    form.licenseRenewedOn;
}
  if (form.renewalCost !== "") {
    payload.renewalCost =
      Number(form.renewalCost);
  }

  if (form.newRenewalDate) {
    payload.newRenewalDate =
      form.newRenewalDate;
  }

  if (form.newInstallationDate) {
    payload.newInstallationDate =
      form.newInstallationDate;
  }
}
if (
  form.upgradeCost > 0 &&
  !form.upgradeDescription.trim()
) {
ThemeSwal.fire(
  "Validation",
  "Upgrade description is required when an upgrade cost is entered.",
  "warning"
);
return;
}

      await upgradeInstance(instance._id, payload);

      refresh();
      onClose();
    } catch (err) {
  console.error(err);

  const message =
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong";

  // Renewal / Maintenance / Insurance / Warranty
  if (
    message.includes("Maintenance can only be recorded") ||
    message.includes("Warranty renewal can only be recorded") ||
    message.includes("Insurance renewal can only be recorded") ||
    message.includes("License renewal can only be recorded")
  ) {
    ThemeSwal.fire({
      icon: "warning",
      title: "Renewal Not Due Yet",
      text: message,
    });

    return;
  }

  // Upgrade-specific validation
  if (
    message.includes("upgrade") ||
    message.includes("Upgrade")
  ) {
    ThemeSwal.fire({
      icon: "warning",
      title: "Upgrade Validation",
      text: message,
    });

    return;
  }

  // Generic error
  ThemeSwal.fire({
    icon: "error",
    title: "Update Failed",
    text: message,
  });
}
  };
const isDue = (date) => {
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate <= today;
};
const maintenanceDue = isDue(
  instance?.hardware?.nextMaintenanceDate
);

const warrantyDue = isDue(
  instance?.hardware?.warrantyExpiry
);

const insuranceDue = isDue(
  instance?.hardware?.insuranceExpiry
);
const firstInsurance =
  !instance?.hardware?.insurancePurchaseDate &&
  !instance?.hardware?.insuranceExpiry;

const canEditInsurance =
  form.hasInsurance &&
  (firstInsurance || insuranceDue);

const softwareRenewalDue = isDue(
  instance?.software?.renewalDate
);
  /* =============================
     🔹 RENDER
  ============================== */

  return (
//     <div className="modal-overlay">
//       <div className="modal">

//         <h2>Upgrade Asset</h2>
//         <div className="modal-tabs">
//   <button
//     type="button"
//     className={activeTab === "renewal" ? "active" : ""}
//     onClick={() => setActiveTab("renewal")}
//   >
//     Renewals
//   </button>

//   <button
//     type="button"
//     className={activeTab === "upgrade" ? "active" : ""}
//     onClick={() => setActiveTab("upgrade")}
//   >
//     Upgrades
//   </button>
// </div>
// {activeTab === "upgrade" && (
//   <>
//     <div className="input-group">
//       <label>Condition</label>

//       <select
//         name="condition"
//         value={form.condition}
//         onChange={handleChange}
//       >
//         <option value="new">New</option>
//         <option value="used">Used</option>
//         <option value="damaged">Damaged</option>
//         <option value="stolen">Stolen</option>
//         <option value="broken">Broken</option>
//         <option value="repaired(in)">Repair(IN)</option>
//         <option value="repaired(out)">Repair(OUT)</option>
//       </select>
//     </div>

//     <div className="input-group">
//       <label>Upgrade Cost</label>

//       <input
//         type="number"
//         name="upgradeCost"
//         value={form.upgradeCost}
//         onChange={handleChange}
//       />
//     </div>

//     <div className="input-group">
//       <label>Upgrade Details</label>

//       <textarea
//         name="upgradeDescription"
//         value={form.upgradeDescription}
//         onChange={handleChange}
//         rows={3}
//       />
//     </div>

//     <div className="input-group">
//       <label>Upgrade Date</label>

//       <input
//         type="date"
//         name="upgradeDate"
//         value={form.upgradeDate}
//         onChange={handleChange}
//       />
//     </div>
//   </>
// )}
// {( activeTab == "renewal" && (
//   <>
//   {isHardware && (
//   <>
//     {/* ================= GENERAL ================= */}

//     <div className="upgrade-section">
//       <div className="section-header">
//         <FaLaptop />
//         <h3>General</h3>
//       </div>

//       <div className="grid-2">

//         <div className="input-group">
//           <label>Currency</label>

//           <input
//             value={currency}
//             readOnly
//             className="readonly-input"
//           />
//         </div>

//         <div className="checkbox-group">
//           <input
//             type="checkbox"
//             className="checkbox-ins"
//             name="hasInsurance"
//             checked={form.hasInsurance}
//             onChange={(e) =>
//               setForm({
//                 ...form,
//                 hasInsurance: e.target.checked,
//               })
//             }
//           />
//           <label>Has Insurance</label>
//         </div>

//       </div>
//     </div>

//     {/* ================= MAINTENANCE ================= */}

//     <div className="upgrade-section">

//       <div className="section-header">
//         <FaTools />
//         <h3>Maintenance</h3>
//       </div>

//       <div className="grid-2">

//         <div className="input-group">
//           <label>Current Maintenance Cost</label>

//           <small>
//             {currency} {currentMaintenanceCost}
//           </small>

//         <input
//     type="number"
//     name="maintenanceCost"
//     value={form.maintenanceCost}
//     onChange={handleChange}
//     disabled={!maintenanceDue}
// />
//         </div>

//         <div className="input-group">

//           <label>Next Maintenance Date</label>

//           <small>
//             {instance?.hardware?.nextMaintenanceDate?.split("T")[0] || "-"}
//           </small>

// <input
//     type="date"
//     name="newMaintenanceDate"
//     value={form.newMaintenanceDate}
//     onChange={handleChange}
//     disabled={!maintenanceDue}
// />

//         </div>
//             <div className="input-group">
              
//   <label>Maintenance Performed On</label>
//                   <small style={{opacity: "0"}}>
//                     adjustment
//           </small>
//   <input
//     type="date"
//     name="maintenancePerformedOn"
//     value={form.maintenancePerformedOn}
//     onChange={handleChange}
//   />
// </div>
//       </div>

//     </div>

//     {/* ================= WARRANTY ================= */}

//     <div className="upgrade-section">

//       <div className="section-header">

//         <FaShieldAlt />

//         <h3>Warranty</h3>

//       </div>

//       <div className="grid-2">

//         <div className="input-group">

//           <label>Renewal Cost</label>

//           <small>
//             {currency} {currentWarrantyCost}
//           </small>

//           <input
//     type="number"
//     name="warrantyRenewalCost"
//     value={form.warrantyRenewalCost}
//     onChange={handleChange}
//     disabled={!warrantyDue}
// />

//         </div>

//         <div className="input-group">

//           <label>Purchase Date</label>
//                       <small>
//             {instance?.hardware?.warrantyPurchaseDate?.split("T")[0] || "-"}
//           </small>
//   <input
//     type="date"
//     name="newWarrantyPurchaseDate"
//     value={form.newWarrantyPurchaseDate}
//     onChange={handleChange}
//     disabled={!warrantyDue}
// />

//         </div>

//         <div className="input-group">

//           <label>Expiry Date</label>

//           <small>
//             {instance?.hardware?.warrantyExpiry?.split("T")[0] || "-"}
//           </small>

// <input
//     type="date"
//     name="newWarrantyExpiry"
//     value={form.newWarrantyExpiry}
//     onChange={handleChange}
//     disabled={!warrantyDue}
// />

//         </div>
//             <div className="input-group">
//   <label>Warranty Renewed On</label>

//   <input
//     type="date"
//     name="warrantyRenewedOn"
//     value={form.warrantyRenewedOn}
//     onChange={handleChange}
//   />
// </div>
//       </div>

//     </div>

//     {/* ================= INSURANCE ================= */}

//     {form.hasInsurance && (

//       <div className="upgrade-section">

//         <div className="section-header">

//           <FaSyncAlt />

//           <h3>Insurance</h3>

//         </div>

//         <div className="grid-2">

//           <div className="input-group">

//             <label>Insurance Term</label>
//                 <small style={{opacity: "0"}}>
//                     adjustment
//           </small>
//           <select
//     name="insuranceTerm"
//     value={form.insuranceTerm}
//     onChange={handleChange}
//     disabled={!canEditInsurance}
// >
//           <option value="6_months">6 Months</option>
//     <option value="1_year">1 Year</option>
//     <option value="2_years">2 Years</option>
//     <option value="3_years">3 Years</option>
//     <option value="4_years">4 Years</option>
//     <option value="5_years">5 Years</option>
//     <option value="6_years">6 Years</option>
//     <option value="7_years">7 Years</option>
//     <option value="8_years">8 Years</option>
//     <option value="9_years">9 Years</option>
//     <option value="10_years">10 Years</option>
//             </select>

//           </div>
//           <div className="input-group">

//   <label>Coverage Type</label>
//    <small style={{opacity: "0"}}>
//                     adjustment
//           </small>

//   <Select
//     isMulti
//     styles={customSelectStyles}
//     className="react-select-container"
//     classNamePrefix="react-select"
//     options={coverageOptions}
//     isDisabled={!canEditInsurance}
//     value={coverageOptions.filter((opt) =>
//       (form.coverageType || []).includes(opt.value)
//     )}
//     onChange={(selected, actionMeta) => {
//       let values = selected
//         ? selected.map((s) => s.value)
//         : [];

//       const lastSelected = actionMeta?.option?.value;

//       if (lastSelected === "none") {
//         values = ["none"];
//       } else {
//         values = values.filter((v) => v !== "none");
//       }

//       setForm({
//         ...form,
//         coverageType: values,
//       });
//     }}
//   />

// </div>

//           <div className="input-group">

//             <label>Insurance Cost</label>

//             <small>
//               {currency} {currentInsuranceCost}
//             </small>

//             <input
//               type="number"
//               name="insuranceCost"
//               value={form.insuranceCost}
//               onChange={handleChange}
//               disabled={!canEditInsurance}
//             />

//           </div>

//           <div className="input-group">

//             <label>Purchase Date</label>
//                       <small>
//             {instance?.hardware?.insurancePurchaseDate?.split("T")[0] || "-"}
//           </small>
//             <input
//               type="date"
//               name="newInsurancePurchaseDate"
//               value={form.newInsurancePurchaseDate}
//               onChange={handleChange}
//               disabled={!canEditInsurance}
//             />

//           </div>
//        <div className="input-group">

//             <label>Expiry Date</label>

//             <small>
//               {instance?.hardware?.insuranceExpiry?.split("T")[0] || "-"}
//             </small>

//             <input
//               type="date"
//               name="newInsuranceExpiry"
//               value={form.newInsuranceExpiry}
//               onChange={handleChange}
//               disabled
//             />

//           </div>
   
//           <div className="input-group">
//   <label>Insurance Renewed On</label>
//           <small style={{opacity: "0"}}>
//                     adjustment
//           </small>
//   <input
//     type="date"
//     name="insuranceRenewedOn"
//     value={form.insuranceRenewedOn}
//     onChange={handleChange}
//   />
// </div>

//         </div>

//       </div>

//     )}
//   </>
// )}
// {isSoftware && (

//   <>
//     {/* ================= GENERAL ================= */}

//     <div className="upgrade-section">

//       <div className="section-header">

//         <FaLaptop />

//         <h3>Software License</h3>

//       </div>

//       <div className="grid-2">

//         <div className="input-group">

//           <label>Currency</label>

//           <input
//             readOnly
//             value={currency}
//             className="readonly-input"
//           />

//         </div>

//       </div>

//     </div>

//     {/* ================= LICENSE ================= */}

//     <div className="upgrade-section">

//       <div className="section-header">

//         <FaSyncAlt />

//         <h3>License Renewal</h3>

//       </div>

//       <div className="grid-2">

//         <div className="input-group">

//           <label>Renewal Cost</label>

//           <small>
//             {currency} {currentRenewalCost}
//           </small>

//           <input
//             type="number"
//             name="renewalCost"
//             value={form.renewalCost}
//             onChange={handleChange}
//           />

//         </div>

//         <div className="input-group">

//           <label>Renewal Date</label>

//           <small>
//             {currentRenewalDate || "-"}
//           </small>

//           <input
//             type="date"
//             name="newRenewalDate"
//             value={form.newRenewalDate}
//             onChange={handleChange}
//           />

//         </div>

//         <div className="input-group">

//           <label>Installation Date</label>

//           <small>
//             {instance?.software?.installationDate?.split("T")[0] || "-"}
//           </small>

//           <input
//             type="date"
//             name="newInstallationDate"
//             value={form.newInstallationDate}
//             onChange={handleChange}
//           />

//         </div>
//         <div className="input-group">
//   <label>License Renewed On</label>

//   <input
//     type="date"
//     name="licenseRenewedOn"
//     value={form.licenseRenewedOn}
//     onChange={handleChange}
//   />
// </div>

//       </div>

//     </div>

//   </>

// )}
//         </>
// ))}

//         {/* ACTIONS */}
//         <div className="modal-actions">
//           <button onClick={onClose} className="btn-cancel">Cancel</button>

//           <button onClick={handleSubmit} className="btn-save">
//           {activeTab === "renewal"
//   ? "Apply Renewal"
//   : "Apply Upgrade"}
//           </button>
//         </div>

//       </div>
//     </div>

<div
  className="asset-upgrade-overlay"
  onClick={onClose}
>
  <div
    className="asset-upgrade-dialog"
    onClick={(e) => e.stopPropagation()}
  >

    {/* =====================================================
        HEADER
    ===================================================== */}
    <div className="asset-upgrade-header">

      <div className="asset-upgrade-header-content">
        <span className="asset-upgrade-eyebrow">
          ASSET MANAGEMENT
        </span>

        <h2>
          {activeTab === "renewal"
            ? "Renew Asset"
            : "Upgrade Asset"}
        </h2>

        <p>
          {instance?.deviceName || "Asset Instance"}
          {instance?.instanceCode
            ? ` • ${instance.instanceCode}`
            : ""}
        </p>
      </div>

      <button
        type="button"
        className="asset-upgrade-close"
        onClick={onClose}
        aria-label="Close modal"
      >
        ×
      </button>

    </div>


    {/* =====================================================
        TABS
    ===================================================== */}
    <div className="asset-upgrade-tabs">

      <button
        type="button"
        className={
          activeTab === "renewal" ? "active" : ""
        }
        onClick={() => setActiveTab("renewal")}
      >
        <span className="asset-upgrade-tab-icon">
          ↻
        </span>

        <span>
          <strong>Renewals</strong>
          <small>
            Maintenance, warranty & licenses
          </small>
        </span>
      </button>


      <button
        type="button"
        className={
          activeTab === "upgrade" ? "active" : ""
        }
        onClick={() => setActiveTab("upgrade")}
      >
        <span className="asset-upgrade-tab-icon">
          ↑
        </span>

        <span>
          <strong>Upgrades</strong>
          <small>
            Condition, cost & upgrade details
          </small>
        </span>
      </button>

    </div>


    {/* =====================================================
        SCROLLABLE BODY
    ===================================================== */}
    <div className="asset-upgrade-body">

      {/* ===================================================
          UPGRADE TAB
      =================================================== */}
      {activeTab === "upgrade" && (
        <div className="asset-upgrade-tab-content">

          <div className="asset-upgrade-section">

            <div className="asset-upgrade-section-header">
              <div className="asset-upgrade-section-icon">
                ↑
              </div>

              <div>
                <h3>Upgrade Information</h3>
                <p>
                  Record changes made to this asset
                  instance.
                </p>
              </div>
            </div>


            <div className="asset-upgrade-form-grid">

              {/* CONDITION */}
              <div className="asset-upgrade-field">
                <label htmlFor="upgrade-condition">
                  Condition
                </label>

                <span className="asset-upgrade-field-hint">
                  Current asset condition
                </span>

                <select
                  id="upgrade-condition"
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="damaged">
                    Damaged
                  </option>
                  <option value="stolen">
                    Stolen
                  </option>
                  <option value="broken">
                    Broken
                  </option>
                  <option value="repaired(in)">
                    Repair (IN)
                  </option>
                  <option value="repaired(out)">
                    Repair (OUT)
                  </option>
                </select>
              </div>


              {/* UPGRADE COST */}
              <div className="asset-upgrade-field">
                <label htmlFor="upgrade-cost">
                  Upgrade Cost
                </label>

                <span className="asset-upgrade-field-hint">
                  Currency: {currency}
                </span>

                <div className="asset-upgrade-money-input">
                  <span>{currency}</span>

                  <input
                    id="upgrade-cost"
                    type="number"
                    name="upgradeCost"
                    value={form.upgradeCost}
                    onChange={handleChange}
                    min="0"
                    placeholder="0.00"
                  />
                </div>
              </div>


              {/* DATE */}
              <div className="asset-upgrade-field">
                <label htmlFor="upgrade-date">
                  Upgrade Date
                </label>

                <span className="asset-upgrade-field-hint">
                  Date upgrade was performed
                </span>

                <input
                  id="upgrade-date"
                  type="date"
                  name="upgradeDate"
                  value={form.upgradeDate}
                  onChange={handleChange}
                />
              </div>


              {/* DESCRIPTION */}
              <div className="asset-upgrade-field asset-upgrade-field-wide">
                <label htmlFor="upgrade-description">
                  Upgrade Details
                </label>

                <span className="asset-upgrade-field-hint">
                  Describe the work or changes performed
                </span>

                <textarea
                  id="upgrade-description"
                  name="upgradeDescription"
                  value={form.upgradeDescription}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter upgrade details..."
                />
              </div>

            </div>

          </div>

        </div>
      )}


      {/* ===================================================
          RENEWAL TAB
      =================================================== */}
      {activeTab === "renewal" && (
        <div className="asset-upgrade-tab-content">

          {/* =================================================
              HARDWARE
          ================================================= */}
          {isHardware && (
            <>

              {/* GENERAL */}
              <div className="asset-upgrade-section">

                <div className="asset-upgrade-section-header">

                  <div className="asset-upgrade-section-icon">
                    <FaLaptop />
                  </div>

                  <div>
                    <h3>General</h3>
                    <p>
                      Asset renewal configuration
                    </p>
                  </div>

                </div>


                <div className="asset-upgrade-form-grid">

                  <div className="asset-upgrade-field">
                    <label>Currency</label>

                    <span className="asset-upgrade-field-hint">
                      Organization currency
                    </span>

                    <input
                      value={currency}
                      readOnly
                      className="asset-upgrade-readonly"
                    />
                  </div>


                  <div className="asset-upgrade-insurance-toggle">

                    <div>
                      <strong>
                        Asset Insurance
                      </strong>

                      <span>
                        Enable insurance management
                      </span>
                    </div>

                    <label className="asset-upgrade-switch">

                      <input
                        type="checkbox"
                        name="hasInsurance"
                        checked={form.hasInsurance}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            hasInsurance:
                              e.target.checked,
                          })
                        }
                      />

                      <span className="asset-upgrade-switch-slider" />

                    </label>

                  </div>

                </div>

              </div>


              {/* =============================================
                  MAINTENANCE
              ============================================= */}
              <div
                className={`asset-upgrade-section ${
                  !maintenanceDue
                    ? "asset-upgrade-section-disabled"
                    : ""
                }`}
              >

                <div className="asset-upgrade-section-header">

                  <div className="asset-upgrade-section-icon">
                    <FaTools />
                  </div>

                  <div>
                    <h3>Maintenance</h3>

                    <p>
                      Update maintenance cost and
                      service schedule
                    </p>
                  </div>


                  <span
                    className={`asset-upgrade-due-badge ${
                      maintenanceDue
                        ? "due"
                        : "current"
                    }`}
                  >
                    <span />

                    {maintenanceDue
                      ? "Renewal Due"
                      : "Up to Date"}
                  </span>

                </div>


                <div className="asset-upgrade-form-grid">

                  {/* COST */}
                  <div className="asset-upgrade-field">
                    <label>
                      Maintenance Cost
                    </label>

                    <span className="asset-upgrade-current">
                      Current: {currency}{" "}
                      {currentMaintenanceCost}
                    </span>

                    <div className="asset-upgrade-money-input">
                      <span>{currency}</span>

                      <input
                        type="number"
                        name="maintenanceCost"
                        value={form.maintenanceCost}
                        onChange={handleChange}
                        disabled={!maintenanceDue}
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                  </div>


                  {/* NEXT DATE */}
                  <div className="asset-upgrade-field">
                    <label>
                      Next Maintenance Date
                    </label>

                    <span className="asset-upgrade-current">
                      Current:{" "}
                      {instance?.hardware
                        ?.nextMaintenanceDate
                        ?.split("T")[0] || "-"}
                    </span>

                    <input
                      type="date"
                      name="newMaintenanceDate"
                      value={form.newMaintenanceDate}
                      onChange={handleChange}
                      disabled={!maintenanceDue}
                    />
                  </div>


                  {/* PERFORMED */}
                  <div className="asset-upgrade-field">
                    <label>
                      Maintenance Performed On
                    </label>

                    <span className="asset-upgrade-field-hint">
                      Actual service date
                    </span>

                    <input
                      type="date"
                      name="maintenancePerformedOn"
                      value={
                        form.maintenancePerformedOn
                      }
                      onChange={handleChange}
                    />
                  </div>

                </div>

              </div>


              {/* =============================================
                  WARRANTY
              ============================================= */}
              <div
                className={`asset-upgrade-section ${
                  !warrantyDue
                    ? "asset-upgrade-section-disabled"
                    : ""
                }`}
              >

                <div className="asset-upgrade-section-header">

                  <div className="asset-upgrade-section-icon">
                    <FaShieldAlt />
                  </div>

                  <div>
                    <h3>Warranty</h3>

                    <p>
                      Manage warranty renewal and
                      coverage dates
                    </p>
                  </div>


                  <span
                    className={`asset-upgrade-due-badge ${
                      warrantyDue
                        ? "due"
                        : "current"
                    }`}
                  >
                    <span />

                    {warrantyDue
                      ? "Renewal Due"
                      : "Up to Date"}
                  </span>

                </div>


                <div className="asset-upgrade-form-grid">

                  {/* COST */}
                  <div className="asset-upgrade-field">
                    <label>Renewal Cost</label>

                    <span className="asset-upgrade-current">
                      Current: {currency}{" "}
                      {currentWarrantyCost}
                    </span>

                    <div className="asset-upgrade-money-input">
                      <span>{currency}</span>

                      <input
                        type="number"
                        name="warrantyRenewalCost"
                        value={
                          form.warrantyRenewalCost
                        }
                        onChange={handleChange}
                        disabled={!warrantyDue}
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                  </div>


                  {/* PURCHASE */}
                  <div className="asset-upgrade-field">
                    <label>Purchase Date</label>

                    <span className="asset-upgrade-current">
                      Current:{" "}
                      {instance?.hardware
                        ?.warrantyPurchaseDate
                        ?.split("T")[0] || "-"}
                    </span>

                    <input
                      type="date"
                      name="newWarrantyPurchaseDate"
                      value={
                        form.newWarrantyPurchaseDate
                      }
                      onChange={handleChange}
                      disabled={!warrantyDue}
                    />
                  </div>


                  {/* EXPIRY */}
                  <div className="asset-upgrade-field">
                    <label>Expiry Date</label>

                    <span className="asset-upgrade-current">
                      Current:{" "}
                      {instance?.hardware
                        ?.warrantyExpiry
                        ?.split("T")[0] || "-"}
                    </span>

                    <input
                      type="date"
                      name="newWarrantyExpiry"
                      value={form.newWarrantyExpiry}
                      onChange={handleChange}
                      disabled={!warrantyDue}
                    />
                  </div>


                  {/* RENEWED */}
                  <div className="asset-upgrade-field">
                    <label>
                      Warranty Renewed On
                    </label>

                    <span className="asset-upgrade-field-hint">
                      Actual renewal date
                    </span>

                    <input
                      type="date"
                      name="warrantyRenewedOn"
                      value={form.warrantyRenewedOn}
                      onChange={handleChange}
                    />
                  </div>

                </div>

              </div>


              {/* =============================================
                  INSURANCE
              ============================================= */}
              {form.hasInsurance && (
                <div
                  className={`asset-upgrade-section ${
                    !canEditInsurance
                      ? "asset-upgrade-section-disabled"
                      : ""
                  }`}
                >

                  <div className="asset-upgrade-section-header">

                    <div className="asset-upgrade-section-icon">
                      <FaSyncAlt />
                    </div>

                    <div>
                      <h3>Insurance</h3>

                      <p>
                        Manage insurance coverage,
                        cost and renewal
                      </p>
                    </div>


                    <span
                      className={`asset-upgrade-due-badge ${
                        canEditInsurance
                          ? "due"
                          : "current"
                      }`}
                    >
                      <span />

                      {canEditInsurance
                        ? "Renewal Due"
                        : "Up to Date"}
                    </span>

                  </div>


                  <div className="asset-upgrade-form-grid">

                    {/* TERM */}
                    <div className="asset-upgrade-field">
                      <label>Insurance Term</label>

                      <span className="asset-upgrade-field-hint">
                        Select coverage duration
                      </span>

                      <select
                        name="insuranceTerm"
                        value={form.insuranceTerm}
                        onChange={handleChange}
                        disabled={!canEditInsurance}
                      >
                        <option value="6_months">
                          6 Months
                        </option>

                        <option value="1_year">
                          1 Year
                        </option>

                        <option value="2_years">
                          2 Years
                        </option>

                        <option value="3_years">
                          3 Years
                        </option>

                        <option value="4_years">
                          4 Years
                        </option>

                        <option value="5_years">
                          5 Years
                        </option>

                        <option value="6_years">
                          6 Years
                        </option>

                        <option value="7_years">
                          7 Years
                        </option>

                        <option value="8_years">
                          8 Years
                        </option>

                        <option value="9_years">
                          9 Years
                        </option>

                        <option value="10_years">
                          10 Years
                        </option>
                      </select>
                    </div>


                    {/* COVERAGE */}
                    <div className="asset-upgrade-field">
                      <label>Coverage Type</label>

                      <span className="asset-upgrade-field-hint">
                        Select one or more coverage types
                      </span>

                      <Select
                        isMulti
                        className="asset-upgrade-react-select"
                        classNamePrefix="asset-upgrade-select"
                        options={coverageOptions}
                        isDisabled={!canEditInsurance}
                        value={coverageOptions.filter(
                          (opt) =>
                            (
                              form.coverageType || []
                            ).includes(opt.value)
                        )}
                        onChange={(
                          selected,
                          actionMeta
                        ) => {
                          let values = selected
                            ? selected.map(
                                (s) => s.value
                              )
                            : [];

                          const lastSelected =
                            actionMeta?.option?.value;

                          if (
                            lastSelected === "none"
                          ) {
                            values = ["none"];
                          } else {
                            values = values.filter(
                              (v) => v !== "none"
                            );
                          }

                          setForm({
                            ...form,
                            coverageType: values,
                          });
                        }}
                      />
                    </div>


                    {/* COST */}
                    <div className="asset-upgrade-field">
                      <label>Insurance Cost</label>

                      <span className="asset-upgrade-current">
                        Current: {currency}{" "}
                        {currentInsuranceCost}
                      </span>

                      <div className="asset-upgrade-money-input">
                        <span>{currency}</span>

                        <input
                          type="number"
                          name="insuranceCost"
                          value={form.insuranceCost}
                          onChange={handleChange}
                          disabled={
                            !canEditInsurance
                          }
                          min="0"
                          placeholder="0.00"
                        />
                      </div>
                    </div>


                    {/* PURCHASE DATE */}
                    <div className="asset-upgrade-field">
                      <label>Purchase Date</label>

                      <span className="asset-upgrade-current">
                        Current:{" "}
                        {instance?.hardware
                          ?.insurancePurchaseDate
                          ?.split("T")[0] || "-"}
                      </span>

                      <input
                        type="date"
                        name="newInsurancePurchaseDate"
                        value={
                          form.newInsurancePurchaseDate
                        }
                        onChange={handleChange}
                        disabled={!canEditInsurance}
                      />
                    </div>


                    {/* EXPIRY */}
                    <div className="asset-upgrade-field">
                      <label>Expiry Date</label>

                      <span className="asset-upgrade-current">
                        Current:{" "}
                        {instance?.hardware
                          ?.insuranceExpiry
                          ?.split("T")[0] || "-"}
                      </span>

                      <input
                        type="date"
                        name="newInsuranceExpiry"
                        value={
                          form.newInsuranceExpiry
                        }
                        onChange={handleChange}
                        disabled
                      />
                    </div>


                    {/* RENEWED */}
                    <div className="asset-upgrade-field">
                      <label>
                        Insurance Renewed On
                      </label>

                      <span className="asset-upgrade-field-hint">
                        Actual renewal date
                      </span>

                      <input
                        type="date"
                        name="insuranceRenewedOn"
                        value={
                          form.insuranceRenewedOn
                        }
                        onChange={handleChange}
                      />
                    </div>

                  </div>

                </div>
              )}

            </>
          )}


          {/* =================================================
              SOFTWARE
          ================================================= */}
          {isSoftware && (
            <>

              {/* GENERAL */}
              <div className="asset-upgrade-section">

                <div className="asset-upgrade-section-header">

                  <div className="asset-upgrade-section-icon">
                    <FaLaptop />
                  </div>

                  <div>
                    <h3>Software License</h3>

                    <p>
                      License and billing configuration
                    </p>
                  </div>

                </div>


                <div className="asset-upgrade-form-grid">

                  <div className="asset-upgrade-field">
                    <label>Currency</label>

                    <span className="asset-upgrade-field-hint">
                      Organization currency
                    </span>

                    <input
                      readOnly
                      value={currency}
                      className="asset-upgrade-readonly"
                    />
                  </div>

                </div>

              </div>


              {/* LICENSE RENEWAL */}
              <div className="asset-upgrade-section">

                <div className="asset-upgrade-section-header">

                  <div className="asset-upgrade-section-icon">
                    <FaSyncAlt />
                  </div>

                  <div>
                    <h3>License Renewal</h3>

                    <p>
                      Update license renewal cost and
                      dates
                    </p>
                  </div>

                </div>


                <div className="asset-upgrade-form-grid">

                  {/* COST */}
                  <div className="asset-upgrade-field">
                    <label>Renewal Cost</label>

                    <span className="asset-upgrade-current">
                      Current: {currency}{" "}
                      {currentRenewalCost}
                    </span>

                    <div className="asset-upgrade-money-input">
                      <span>{currency}</span>

                      <input
                        type="number"
                        name="renewalCost"
                        value={form.renewalCost}
                        onChange={handleChange}
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                  </div>


                  {/* RENEWAL DATE */}
                  <div className="asset-upgrade-field">
                    <label>Renewal Date</label>

                    <span className="asset-upgrade-current">
                      Current:{" "}
                      {currentRenewalDate || "-"}
                    </span>

                    <input
                      type="date"
                      name="newRenewalDate"
                      value={form.newRenewalDate}
                      onChange={handleChange}
                    />
                  </div>


                  {/* INSTALLATION */}
                  <div className="asset-upgrade-field">
                    <label>Installation Date</label>

                    <span className="asset-upgrade-current">
                      Current:{" "}
                      {instance?.software
                        ?.installationDate
                        ?.split("T")[0] || "-"}
                    </span>

                    <input
                      type="date"
                      name="newInstallationDate"
                      value={
                        form.newInstallationDate
                      }
                      onChange={handleChange}
                    />
                  </div>


                  {/* RENEWED ON */}
                  <div className="asset-upgrade-field">
                    <label>
                      License Renewed On
                    </label>

                    <span className="asset-upgrade-field-hint">
                      Actual renewal date
                    </span>

                    <input
                      type="date"
                      name="licenseRenewedOn"
                      value={form.licenseRenewedOn}
                      onChange={handleChange}
                    />
                  </div>

                </div>

              </div>

            </>
          )}

        </div>
      )}

    </div>


    {/* =====================================================
        FOOTER
    ===================================================== */}
    <div className="asset-upgrade-footer">

      <span className="asset-upgrade-footer-note">
        Changes will be recorded in the asset lifecycle.
      </span>

      <div className="asset-upgrade-footer-actions">

        <button
          type="button"
          onClick={onClose}
          className="asset-upgrade-cancel"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="asset-upgrade-save"
        >
          {activeTab === "renewal"
            ? "Apply Renewal"
            : "Apply Upgrade"}
        </button>

      </div>

    </div>

  </div>
</div>
  );
};

export default UpgradeModal;