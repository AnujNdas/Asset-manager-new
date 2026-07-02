import React, { useState } from "react";
import { upgradeInstance } from "../Services/ApiServices";
import ThemeSwal from "../utils/swalTheme";
import { useOrganization } from "../Context/OrganizationContext";
const UpgradeModal = ({ instance, onClose, refresh }) => {
  const { organization } = useOrganization();
  const currency = organization?.currency;
  const isHardware = instance?.assetType === "hardware";
  const isSoftware = instance?.assetType === "software";
  const [activeTab, setActiveTab] = useState("renewal");

  /* =============================
     🔹 FIELD CONFIG (DYNAMIC)
  ============================== */

const fieldConfig = [
  ...(isHardware
    ? [
        {
          name: "maintenanceCost",
          label: "Maintenance Cost",
          type: "number",
          current:
            instance?.hardware?.costs?.maintenanceCost?.amount || 0,
        },
        {
          name: "warrantyRenewalCost",
          label: "Warranty Renewal Cost",
          type: "number",
          current:
            instance?.hardware?.costs?.warrantyRenewalCost?.amount || 0,
        },
        {
          name: "insuranceCost",
          label: "Insurance Cost",
          type: "number",
          current:
            instance?.hardware?.costs?.insuranceCost?.amount || 0,
        },

        {
          name: "newWarrantyPurchaseDate",
          label: "Warranty Purchase Date",
          type: "date",
          current:
            instance?.hardware?.warrantyPurchaseDate?.split("T")[0] || "-",
        },
        {
          name: "newWarrantyExpiry",
          label: "Warranty Expiry",
          type: "date",
          current:
            instance?.hardware?.warrantyExpiry?.split("T")[0] || "-",
        },

        {
          name: "newInsurancePurchaseDate",
          label: "Insurance Purchase Date",
          type: "date",
          current:
            instance?.hardware?.insurancePurchaseDate?.split("T")[0] || "-",
        },
        {
          name: "newInsuranceExpiry",
          label: "Insurance Expiry",
          type: "date",
          current:
            instance?.hardware?.insuranceExpiry?.split("T")[0] || "-",
        },

        {
          name: "newMaintenanceDate",
          label: "Next Maintenance Date",
          type: "date",
          current:
            instance?.hardware?.nextMaintenanceDate?.split("T")[0] || "-",
        },

        {
          name: "newInstallationDate",
          label: "Installation Date",
          type: "date",
          current:
            instance?.hardware?.installationDate?.split("T")[0] || "-",
        },
      ]
    : []),

  ...(isSoftware
    ? [
        {
          name: "renewalCost",
          label: "Renewal Cost",
          type: "number",
          current:
            instance?.software?.costs?.renewalCost?.amount || 0,
        },
        {
          name: "newRenewalDate",
          label: "Renewal Date",
          type: "date",
          current:
            instance?.software?.renewalDate?.split("T")[0] || "-",
        },
        {
          name: "newLastUsedDate",
          label: "Last Used Date",
          type: "date",
          current:
            instance?.software?.lastUsedDate?.split("T")[0] || "-",
        },
        {
          name: "newInstallationDate",
          label: "Installation Date",
          type: "date",
          current:
            instance?.software?.installationDate?.split("T")[0] || "-",
        },
      ]
    : []),
];  
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

  upgradeDescription:
    form.upgradeDescription || undefined,

  upgradeNotes:
    form.upgradeNotes || undefined,

  upgradeDate:
    form.upgradeDate || undefined,

  upgradeCost:
    Number(form.upgradeCost) || 0,
};
if (isHardware) {
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
}
if (isSoftware) {
  if (form.renewalCost !== "") {
    payload.renewalCost =
      Number(form.renewalCost);
  }

  if (form.newRenewalDate) {
    payload.newRenewalDate =
      form.newRenewalDate;
  }

  if (form.newLastUsedDate) {
    payload.newLastUsedDate =
      form.newLastUsedDate;
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

  /* =============================
     🔹 RENDER
  ============================== */

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h2>Upgrade Asset</h2>
        <div className="modal-tabs">
  <button
    type="button"
    className={activeTab === "renewal" ? "active" : ""}
    onClick={() => setActiveTab("renewal")}
  >
    Renewals
  </button>

  <button
    type="button"
    className={activeTab === "upgrade" ? "active" : ""}
    onClick={() => setActiveTab("upgrade")}
  >
    Upgrades
  </button>
</div>
{activeTab === "upgrade" && (
  <>
    <div className="input-group">
      <label>Condition</label>

      <select
        name="condition"
        value={form.condition}
        onChange={handleChange}
      >
        <option value="new">New</option>
        <option value="used">Used</option>
        <option value="damaged">Damaged</option>
        <option value="stolen">Stolen</option>
        <option value="broken">Broken</option>
        <option value="repaired(in)">Repaired(IN)</option>
        <option value="repaired(out)">Repaired(OUT)</option>
      </select>
    </div>

    <div className="input-group">
      <label>Upgrade Cost</label>

      <input
        type="number"
        name="upgradeCost"
        value={form.upgradeCost}
        onChange={handleChange}
      />
    </div>

    <div className="input-group">
      <label>Upgrade Details</label>

      <textarea
        name="upgradeDescription"
        value={form.upgradeDescription}
        onChange={handleChange}
        rows={3}
      />
    </div>

    <div className="input-group">
      <label>Upgrade Date</label>

      <input
        type="date"
        name="upgradeDate"
        value={form.upgradeDate}
        onChange={handleChange}
      />
    </div>
  </>
)}
{( activeTab == "renewal" && (
  <>
  <div className="input-group">
  <label>Currency</label>

  <input
    type="text"
    value={currency || "NA"}
    readOnly
    className="readonly-input"
  />
</div>
        {isHardware && (
  <>
    {/* HAS INSURANCE */}
<div className="checkbox-group">
  <input
    type="checkbox"
    className="checkbox-ins"
    name="hasInsurance"
    checked={form.hasInsurance}
    onChange={(e) => {
      const checked = e.target.checked;
    
      setForm({
        ...form,
        hasInsurance: checked,
        ...(checked
          ? {}
          : {
              insuranceTerm: "1_year",
              insuranceCost: "",
              newInsurancePurchaseDate: ""
            })
      });
    }}  
  />
  <label>Has Insurance</label>
</div>

    {/* INSURANCE TERM */}
{form.hasInsurance && (
  <>
    <div className="input-group">
      <label>Insurance Term</label>
      <select
        name="insuranceTerm"
        value={form.insuranceTerm}
        onChange={handleChange}
      >
        <option value="6_months">6 Months</option>
        <option value="1_year">1 Year</option>
        <option value="3_years">3 Years</option>
      </select>
    </div>

    <div className="input-group">
      <label>Insurance Purchase Date</label>
      <input
        type="date"
        name="newInsurancePurchaseDate"
        value={form.newInsurancePurchaseDate}
        onChange={handleChange}
      />
    </div>

    <div className="input-group">
      <label>Insurance Cost</label>
      <input
        type="number"
        name="insuranceCost"
        value={form.insuranceCost}
        onChange={handleChange}
      />
    </div>
  </>
)}
  </>
)}

        {/* ✅ DYNAMIC FIELDS */}
        <div className="grid-2">
          {fieldConfig
            .map((field) => (
              <div className="input-group" key={field.name}>
                <label>{field.label}</label>
                      <small className="current-value">
        Current: {field.current}
      </small>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                />
              </div>
            ))}
        </div>
        </>
))}

        {/* ACTIONS */}
        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">Cancel</button>

          <button onClick={handleSubmit} className="btn-save">
          {activeTab === "renewal"
  ? "Apply Renewal"
  : "Apply Upgrade"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpgradeModal;