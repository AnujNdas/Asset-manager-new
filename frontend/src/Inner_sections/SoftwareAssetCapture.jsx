// src/Pages/SoftwareAssetCapture.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../Page_styles/HardwareCapture.css"; // reuse same CSS as hardware
import { getStatuses, getCategories, createSoftwareAsset } from "../Services/ApiServices";

const initialForm = {
  // Basic
  name: "",
  version: "",
  publisher: "",
  category: "",
  businessUnit: "",
  installLocation: "",
  assetTag: "",
  softwareID: "",

  // License
  licenseKey: "",
  licenseType: "",
  licenseModel: "",
  licenseMetric: "",
  licenseUse: "",
  licenseStartDate: "",
  licenseExpiry: "",
  renewalCycle: "Annual",
  renewalReminder: true,
  totalLicenses: "",
  licensesAssigned: "",
  licensesAvailable: 0,
  subscriptionId: "",

  // Financial & Contract
  costPerUnit: "",
  totalCost: 0,
  currency: "INR",
  costCenter: "",
  purchaseDate: "",
  purchaseOrder: "",
  contractTerm: "",
  contractDocsURLs: [], // for URLs if user wants to paste links

  // Support & Vendor
  supportVendor: "",
  supportEmail: "",
  supportPhone: "",
  vendorContactDetails: "",

  // Deployment & Assignment
  assignedTo: "",
  assignedDepartment: "",
  linkedDevices: "",
  integrationDependencies: "",

  // Compliance & Risk
  complianceStatus: "",
  criticality: "Medium",
  riskClassification: "",
  authenticationMethod: "",
  lastAccess: "",

  // Misc
  auditHistory: [],
};

export default function SoftwareAssetCapture() {
  const [formData, setFormData] = useState(initialForm);
  const [tab, setTab] = useState(0); // not used visually but keep for quick nav if needed
  const [statuses, setStatuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [contractFiles, setContractFiles] = useState([]);
  const [licenseFiles, setLicenseFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([getStatuses(), getCategories()]);
        setStatuses(s || []);
        setCategories(c || []);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load dropdown data", "error");
      }
    })();
  }, []);

  // Auto calculations for licensesAvailable & totalCost
  useEffect(() => {
    const total = Number(formData.totalLicenses) || 0;
    const assigned = Number(formData.licensesAssigned) || 0;
    const costPerUnit = Number(formData.costPerUnit) || 0;

    setFormData((prev) => ({
      ...prev,
      licensesAvailable: total - assigned,
      totalCost: total && costPerUnit ? total * costPerUnit : prev.totalCost,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.totalLicenses, formData.licensesAssigned, formData.costPerUnit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFiles = (e, setFilesFn) => {
    const files = Array.from(e.target.files || []);
    setFilesFn(files);
  };

  const resetForm = () => {
    setFormData(initialForm);
    setContractFiles([]);
    setLicenseFiles([]);
    setTab(0);
  };

const buildJsonPayload = () => {
  const assignedUsers = formData.assignedTo
    ? formData.assignedTo.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const integrationDependencies = formData.integrationDependencies
    ? formData.integrationDependencies.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  return {
    // Basic
    name: formData.name,
    version: formData.version,
    publisher: formData.publisher,
    category: formData.category,
    businessUnit: formData.businessUnit,
    installLocation: formData.installLocation,
    assetTag: formData.assetTag,

    // License
    licenseKey: formData.licenseKey,
    licenseType: formData.licenseType,
    licenseModel: formData.licenseModel,
    licenseMetric: formData.licenseMetric,
    licenseUse: formData.licenseUse,
    licenseStartDate: formData.licenseStartDate || null,
    licenseExpiry: formData.licenseExpiry || null,
    renewalCycle: formData.renewalCycle,
    renewalReminder: formData.renewalReminder,

    totalLicenses: Number(formData.totalLicenses) || 0,
    licensesAssigned: 0,
    subscriptionId: formData.subscriptionId,

    // Financial
    purchaseDate: formData.purchaseDate || null,
    costPerUnit: Number(formData.costPerUnit) || 0,
    totalCost: Number(formData.totalCost) || 0,
    currency: formData.currency,
    costCenter: formData.costCenter,
    purchaseOrder: formData.purchaseOrder,

    // Contract
    contractTerm: formData.contractTerm,
    contractDocs: formData.contractDocsURLs || [],
    licenseDocument: [],

    // Support
    supportContract: {
      vendorContact: formData.vendorContactDetails || "",
    },

    // Assignment / Usage
    assignedUsers,
    integrationDependencies,

    // Compliance
    complianceStatus: formData.complianceStatus,
    criticality: formData.criticality,
    riskClassification: formData.riskClassification,
    authenticationMethod: formData.authenticationMethod,
    lastAccess: formData.lastAccess || null,

    // Audit
    auditHistory: [
      { date: new Date(), notes: "Created via Software Capture" }
    ],
  };
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name) {
      Swal.fire("Validation", "Please provide the software name.", "warning");
      return;
    }
    if (!formData.category) {
      Swal.fire("Validation", "Please select a category.", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      const hasFiles = (contractFiles && contractFiles.length > 0) || (licenseFiles && licenseFiles.length > 0);

      if (hasFiles) {
        const fd = new FormData();
        const metadata = buildJsonPayload();
        fd.append("metadata", JSON.stringify(metadata));

        contractFiles.forEach((file) => fd.append("contractDocs", file));
        licenseFiles.forEach((file) => fd.append("licenseDocuments", file));

        const token = sessionStorage.getItem("token");
        const res = await fetch("/api/software-assets", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Upload failed");

        Swal.fire("Success", "Software asset created with files.", "success");
        resetForm();
        setIsSubmitting(false);
        return;
      }

      // No files → use JSON helper
      const payload = buildJsonPayload();
      await createSoftwareAsset(payload);

      Swal.fire("Success", "Software asset captured successfully!", "success");
      resetForm();
    } catch (err) {
      console.error("Error creating software asset:", err);
      Swal.fire("Error", err.message || "Failed to capture asset", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Small helper UI components to match hardware layout
  const SectionTitle = ({ children }) => <h3 className="section-title">{children}</h3>;

  return (
    <div className="asset-wrapper">
      <div className="asset-header">
        <h2>Software Capture</h2>
      </div>

      <form className="asset-form" onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Basic Details */}
        <div className="section">
          <SectionTitle>Basic Details</SectionTitle>
          <div className="grid-2">
            <div className="input-group">
              <label>Software Name <span style={{ color: "#e11d48" }}>*</span></label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Software name" />
            </div>

            <div className="input-group">
              <label>Version</label>
              <input name="version" value={formData.version} onChange={handleChange} placeholder="1.0.0" />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Publisher</label>
              <input name="publisher" value={formData.publisher} onChange={handleChange} placeholder="Publisher name" />
            </div>

            <div className="input-group">
              <label>Category <span style={{ color: "#e11d48" }}>*</span></label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Business Unit</label>
              <input name="businessUnit" value={formData.businessUnit} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>Install Location</label>
              <input name="installLocation" value={formData.installLocation} onChange={handleChange} />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Asset Tag</label>
              <input name="assetTag" value={formData.assetTag} onChange={handleChange} placeholder="e.g. LICS-0001" />
            </div>

            <div className="input-group">
              <label>Software ID</label>
              <input name="softwareID" value={formData.softwareID} onChange={handleChange} placeholder="internal id" />
            </div>
          </div>
        </div>

        {/* License Details */}
        <div className="section">
          <SectionTitle>License Details</SectionTitle>

          <div className="grid-2">
            <div className="input-group">
              <label>License Key</label>
              <input name="licenseKey" value={formData.licenseKey} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>License Type</label>
              <input name="licenseType" value={formData.licenseType} onChange={handleChange} placeholder="Perpetual / Subscription" />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>License Model</label>
              <input name="licenseModel" value={formData.licenseModel} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>License Metric</label>
              <input name="licenseMetric" value={formData.licenseMetric} onChange={handleChange} placeholder="Per User / Per Device" />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>License Start Date</label>
              <input type="date" name="licenseStartDate" value={formData.licenseStartDate} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>License Expiry</label>
              <input type="date" name="licenseExpiry" value={formData.licenseExpiry} onChange={handleChange} />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Total Licenses</label>
              <input type="number" name="totalLicenses" value={formData.totalLicenses} onChange={handleChange} />
            </div> 1   
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Licenses Available</label>
              <input type="number" name="licensesAvailable" value={formData.licensesAvailable} disabled />
            </div>

            <div className="input-group">
              <label>Subscription ID</label>
              <input name="subscriptionId" value={formData.subscriptionId} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Financial & Contract */}
        <div className="section">
          <SectionTitle>Financial & Contract</SectionTitle>

          <div className="grid-2">
            <div className="input-group">
              <label>Cost Per Unit</label>
              <input type="number" name="costPerUnit" value={formData.costPerUnit} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>Total Cost</label>
              <input type="number" name="totalCost" value={formData.totalCost} disabled />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Currency</label>
              <select name="currency" value={formData.currency} onChange={handleChange}>
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>

            <div className="input-group">
              <label>Cost Center</label>
              <input name="costCenter" value={formData.costCenter} onChange={handleChange} />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Purchase Date</label>
              <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>Purchase Order</label>
              <input name="purchaseOrder" value={formData.purchaseOrder} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label>Contract Term / Notes</label>
            <input name="contractTerm" value={formData.contractTerm} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Support Vendor</label>
            <input name="supportVendor" value={formData.supportVendor} onChange={handleChange} />
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Support Email</label>
              <input name="supportEmail" value={formData.supportEmail} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Support Phone</label>
              <input name="supportPhone" value={formData.supportPhone} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label>Upload Contract Documents (multiple)</label>
            <input type="file" multiple onChange={(e) => handleFiles(e, setContractFiles)} />
            {contractFiles.length > 0 && (
              <ul className="file-list">
                {contractFiles.map((f, i) => <li key={i}>{f.name}</li>)}
              </ul>
            )}
          </div>

          <div className="input-group">
            <label>Upload License Documents (multiple)</label>
            <input type="file" multiple onChange={(e) => handleFiles(e, setLicenseFiles)} />
            {licenseFiles.length > 0 && (
              <ul className="file-list">
                {licenseFiles.map((f, i) => <li key={i}>{f.name}</li>)}
              </ul>
            )}
          </div>

          <div className="input-group">
            <label>Or paste contract doc URLs (one per line)</label>
            <textarea
              name="contractDocsURLs"
              value={formData.contractDocsURLs.join("\n")}
              onChange={(e) => setFormData({ ...formData, contractDocsURLs: e.target.value.split("\n").map(s => s.trim()).filter(Boolean)})}
              rows={3}
            />
          </div>
        </div>

        {/* Deployment & Assignment */}
        <div className="section">
          <SectionTitle>Deployment & Assignment</SectionTitle>

          <div className="input-group">
            <label>Assigned To (comma-separated)</label>
            <input name="assignedTo" value={formData.assignedTo} onChange={handleChange} placeholder="user1@org.com, user2@org.com" />
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Assigned Department</label>
              <input name="assignedDepartment" value={formData.assignedDepartment} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>Linked Devices (comma-separated)</label>
              <input name="linkedDevices" value={formData.linkedDevices} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label>Integration Dependencies</label>
            <input name="integrationDependencies" value={formData.integrationDependencies} onChange={handleChange} />
          </div>
        </div>

        {/* Compliance & Risk */}
        <div className="section">
          <SectionTitle>Compliance & Risk</SectionTitle>

          <div className="grid-2">
            <div className="input-group">
              <label>Compliance Status</label>
              <select name="complianceStatus" value={formData.complianceStatus} onChange={handleChange}>
                <option value="">Select Status</option>
                {statuses.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label>Criticality</label>
              <select name="criticality" value={formData.criticality} onChange={handleChange}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Risk Classification</label>
              <input name="riskClassification" value={formData.riskClassification} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>Authentication Method</label>
              <input name="authenticationMethod" value={formData.authenticationMethod} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label>Last Access</label>
            <input type="date" name="lastAccess" value={formData.lastAccess} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Vendor Contact Details / Notes</label>
            <input name="vendorContactDetails" value={formData.vendorContactDetails} onChange={handleChange} />
          </div>
        </div>

          {/* <div className="left-actions">
            <button type="button" className="btn-secondary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Top
            </button>
            <button type="button" className="btn-secondary" onClick={() => resetForm()}>
              Reset
            </button>
          </div> */}

            <button className="submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Software Asset"}
            </button>
      </form>
    </div>
  );
}
