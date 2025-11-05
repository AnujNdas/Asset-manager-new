import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../Page_styles/CaptureForm.css";
import { getStatuses, getCategories, createSoftwareAsset } from "../Services/ApiServices"; 
// Note: createSoftwareAsset is used only for JSON-only payloads. Multipart posts go directly to /api/software-assets.

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
  assignedTo: "", // comma-separated
  assignedDepartment: "",
  linkedDevices: "", // comma-separated ids
  integrationDependencies: "", // comma-separated

  // Compliance & Risk
  complianceStatus: "",
  criticality: "Medium",
  riskClassification: "",
  authenticationMethod: "",
  lastAccess: "",

  // Misc
  subscriptionId: "",
  auditHistory: [],
};

const SoftwareAssetCapture = () => {
  const [tab, setTab] = useState(0);
  const [statuses, setStatuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(initialForm);

  // Files
  const [contractFiles, setContractFiles] = useState([]); // contractDocs (multiple)
  const [licenseFiles, setLicenseFiles] = useState([]); // licenseDocument (multiple)

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([getStatuses(), getCategories()]);
        setStatuses(s || []);
        setCategories(c || []);
      } catch (e) {
        console.error(e);
        Swal.fire("Error", "Failed to load dropdown data", "error");
      }
    })();
  }, []);

  // Auto calculations: licensesAvailable & totalCost
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
      setFormData({ ...formData, [name]: checked });
    } else setFormData({ ...formData, [name]: value });
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
    // Convert comma-separated fields into arrays
    const assignedToArr = formData.assignedTo
      ? formData.assignedTo.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const linkedDevicesArr = formData.linkedDevices
      ? formData.linkedDevices.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const integrationDependenciesArr = formData.integrationDependencies
      ? formData.integrationDependencies.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    return {
      name: formData.name,
      version: formData.version,
      publisher: formData.publisher,
      category: formData.category,
      businessUnit: formData.businessUnit,
      installLocation: formData.installLocation,
      assetTag: formData.assetTag,
      softwareID: formData.softwareID,

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
      licensesAssigned: Number(formData.licensesAssigned) || 0,
      licensesAvailable: Number(formData.licensesAvailable) || 0,
      subscriptionId: formData.subscriptionId,

      costPerUnit: Number(formData.costPerUnit) || 0,
      totalCost: Number(formData.totalCost) || 0,
      currency: formData.currency,
      costCenter: formData.costCenter,
      purchaseDate: formData.purchaseDate || null,
      purchaseOrder: formData.purchaseOrder,
      contractTerm: formData.contractTerm,
      contractDocs: formData.contractDocsURLs || [],

      supportVendor: formData.supportVendor,
      supportEmail: formData.supportEmail,
      supportPhone: formData.supportPhone,
      vendorContactDetails: formData.vendorContactDetails,

      assignedTo: assignedToArr,
      assignedDepartment: formData.assignedDepartment,
      linkedDevices: linkedDevicesArr,
      integrationDependencies: integrationDependenciesArr,

      complianceStatus: formData.complianceStatus,
      criticality: formData.criticality,
      riskClassification: formData.riskClassification,
      authenticationMethod: formData.authenticationMethod,
      lastAccess: formData.lastAccess || null,

      auditHistory: [
        ...(formData.auditHistory || []),
        { date: new Date().toISOString(), notes: "Created via capture form" },
      ],
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name) {
      Swal.fire("Validation", "Please provide the software name.", "warning");
      setTab(0);
      return;
    }
    if (!formData.category) {
      Swal.fire("Validation", "Please select a category.", "warning");
      setTab(0);
      return;
    }

    try {
      // If there are files to upload, send multipart/form-data
      const hasFiles = (contractFiles && contractFiles.length > 0) || (licenseFiles && licenseFiles.length > 0);

      if (hasFiles) {
        const fd = new FormData();
        const jsonPayload = buildJsonPayload();

        // Append JSON fields as a single JSON string (server should parse)
        fd.append("metadata", JSON.stringify(jsonPayload));

        // Append contract files
        contractFiles.forEach((file, i) => {
          fd.append("contractDocs", file);
        });
        // Append license files
        licenseFiles.forEach((file, i) => {
          fd.append("licenseDocuments", file);
        });

        // POST to backend directly (adjust endpoint if your API path differs)
        const token = localStorage.getItem("token"); // if you use auth token
        const res = await fetch("/api/software-assets", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Upload failed");

        Swal.fire("Success", "Software asset created with files.", "success");
        resetForm();
        return;
      }

      // No files → use existing createSoftwareAsset helper (assumed to accept JSON)
      const payload = buildJsonPayload();
      // If your createSoftwareAsset expects a different shape, update ApiServices accordingly
      await createSoftwareAsset(payload);

      Swal.fire("Success", "Software asset captured successfully!", "success");
      resetForm();
    } catch (err) {
      console.error("Error creating software asset:", err);
      Swal.fire("Error", err.message || "Failed to capture asset", "error");
    }
  };

  // Simple Tab components
  const Tabs = ({ index, label }) => (
    <button
      type="button"
      className={`tab-btn ${tab === index ? "active" : ""}`}
      onClick={() => setTab(index)}
    >
      {label}
    </button>
  );

  return (
    <div className="capture-container capture-upgraded">
      <h2 className="capture-title">Software Asset Capture</h2>

      <div className="tabs-wrap">
        <Tabs index={0} label="Basic Info" />
        <Tabs index={1} label="License Details" />
        <Tabs index={2} label="Financial & Contract" />
        <Tabs index={3} label="Deployment & Assignment" />
        <Tabs index={4} label="Compliance & Risk" />
      </div>

      <form className="capture-form upgrade-form" onSubmit={handleSubmit} encType="multipart/form-data">
        {/* ====== TAB 0: BASIC ====== */}
        {tab === 0 && (
          <div className="tab-panel">
            <input name="name" placeholder="Software Name" value={formData.name} onChange={handleChange} required />
            <input name="version" placeholder="Version" value={formData.version} onChange={handleChange} />
            <input name="publisher" placeholder="Publisher" value={formData.publisher} onChange={handleChange} />

            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input name="businessUnit" placeholder="Business Unit" value={formData.businessUnit} onChange={handleChange} />
            <input name="installLocation" placeholder="Install Location" value={formData.installLocation} onChange={handleChange} />
            <input name="assetTag" placeholder="Asset Tag (e.g., LICS-0001)" value={formData.assetTag} onChange={handleChange} />
            <input name="softwareID" placeholder="Software ID (internal)" value={formData.softwareID} onChange={handleChange} />
          </div>
        )}

        {/* ====== TAB 1: LICENSE ====== */}
        {tab === 1 && (
          <div className="tab-panel">
            <input name="licenseKey" placeholder="License Key" value={formData.licenseKey} onChange={handleChange} />
            <input name="licenseType" placeholder="License Type (Perpetual / Subscription / Trial)" value={formData.licenseType} onChange={handleChange} />
            <input name="licenseModel" placeholder="License Model (OEM / Volume / Enterprise)" value={formData.licenseModel} onChange={handleChange} />
            <input name="licenseMetric" placeholder="License Metric (Per User / Per Device / Per Core)" value={formData.licenseMetric} onChange={handleChange} />
            <input name="licenseUse" placeholder="License Use (Internal / External / Test)" value={formData.licenseUse} onChange={handleChange} />
            <label className="small-label">License Start Date</label>
            <input type="date" name="licenseStartDate" value={formData.licenseStartDate} onChange={handleChange} />
            <label className="small-label">License Expiry Date</label>
            <input type="date" name="licenseExpiry" value={formData.licenseExpiry} onChange={handleChange} />
            <select name="renewalCycle" value={formData.renewalCycle} onChange={handleChange}>
              <option value="Annual">Annual</option>
              <option value="Monthly">Monthly</option>
              <option value="Lifetime">Lifetime</option>
            </select>
            <div className="row">
              <input type="number" name="totalLicenses" placeholder="Total Licenses" value={formData.totalLicenses} onChange={handleChange} />
              <input type="number" name="licensesAssigned" placeholder="Licenses Assigned" value={formData.licensesAssigned} onChange={handleChange} />
              <input type="number" name="licensesAvailable" placeholder="Licenses Available" value={formData.licensesAvailable} readOnly />
            </div>
            <input name="subscriptionId" placeholder="Subscription ID (SaaS tenant)" value={formData.subscriptionId} onChange={handleChange} />
          </div>
        )}

        {/* ====== TAB 2: FINANCIAL & CONTRACT ====== */}
        {tab === 2 && (
          <div className="tab-panel">
            <div className="row">
              <input type="number" name="costPerUnit" placeholder="Cost Per Unit" value={formData.costPerUnit} onChange={handleChange} />
              <input type="number" name="totalCost" placeholder="Total Cost" value={formData.totalCost} readOnly />
            </div>
            <select name="currency" value={formData.currency} onChange={handleChange}>
              <option>INR</option>
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
            <input name="costCenter" placeholder="Cost Center / Dept" value={formData.costCenter} onChange={handleChange} />
            <label className="small-label">Purchase Date</label>
            <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} />
            <input name="purchaseOrder" placeholder="Purchase Order" value={formData.purchaseOrder} onChange={handleChange} />
            <input name="contractTerm" placeholder="Contract Term / Notes" value={formData.contractTerm} onChange={handleChange} />

            <h4>Support / Vendor</h4>
            <input name="supportVendor" placeholder="Support Vendor" value={formData.supportVendor} onChange={handleChange} />
            <input name="supportEmail" placeholder="Support Email" value={formData.supportEmail} onChange={handleChange} />
            <input name="supportPhone" placeholder="Support Phone" value={formData.supportPhone} onChange={handleChange} />

            <label className="small-label">Upload Contract Documents (multiple)</label>
            <input type="file" multiple onChange={(e) => handleFiles(e, setContractFiles)} />

            <label className="small-label">Upload License Documents (multiple)</label>
            <input type="file" multiple onChange={(e) => handleFiles(e, setLicenseFiles)} />

            <label className="small-label">Or paste contract doc URLs (one per line)</label>
            <textarea
              name="contractDocsURLs"
              value={formData.contractDocsURLs.join("\n")}
              onChange={(e) => setFormData({ ...formData, contractDocsURLs: e.target.value.split("\n").map(s => s.trim()).filter(Boolean)})}
              rows={4}
            />
          </div>
        )}

        {/* ====== TAB 3: DEPLOYMENT & ASSIGNMENT ====== */}
        {tab === 3 && (
          <div className="tab-panel">
            <label className="small-label">Assigned To (comma-separated emails/usernames)</label>
            <input name="assignedTo" placeholder="user1@org.com, user2@org.com" value={formData.assignedTo} onChange={handleChange} />

            <input name="assignedDepartment" placeholder="Assigned Department" value={formData.assignedDepartment} onChange={handleChange} />
            <label className="small-label">Linked Devices (comma-separated IDs)</label>
            <input name="linkedDevices" placeholder="deviceId1, deviceId2" value={formData.linkedDevices} onChange={handleChange} />
            <label className="small-label">Integration Dependencies (comma-separated)</label>
            <input name="integrationDependencies" placeholder="ServiceA, ServiceB" value={formData.integrationDependencies} onChange={handleChange} />
          </div>
        )}

        {/* ====== TAB 4: COMPLIANCE & RISK ====== */}
        {tab === 4 && (
          <div className="tab-panel">
            <select name="complianceStatus" value={formData.complianceStatus} onChange={handleChange}>
              <option value="">Select Status</option>
              {statuses.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select name="criticality" value={formData.criticality} onChange={handleChange}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <input name="riskClassification" placeholder="Risk Classification" value={formData.riskClassification} onChange={handleChange} />
            <input name="authenticationMethod" placeholder="Authentication Method" value={formData.authenticationMethod} onChange={handleChange} />
            <label className="small-label">Last Access</label>
            <input type="date" name="lastAccess" value={formData.lastAccess} onChange={handleChange} />
            <input name="vendorContactDetails" placeholder="Vendor Contact Details / Notes" value={formData.vendorContactDetails} onChange={handleChange} />
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => setTab((t) => Math.max(0, t - 1))}>
            Previous
          </button>
          <button type="button" className="btn-secondary" onClick={() => setTab((t) => Math.min(4, t + 1))}>
            Next
          </button>
          <button type="submit" className="btn-primary">
            Save Software Asset
          </button>
        </div>
      </form>
    </div>
  );
};

export default SoftwareAssetCapture;
