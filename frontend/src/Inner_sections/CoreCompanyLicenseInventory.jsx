import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  getCoreLicenses,
  getStatuses,
  deleteCoreLicense,
  updateCoreLicense,
} from "../Services/ApiServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../Page_styles/InventoryCards.css";

const CoreCompanyLicenseList = () => {
  const [licenses, setLicenses] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, licenseRes] = await Promise.all([
          getStatuses(),
          getCoreLicenses(),
        ]);
        setStatuses(Array.isArray(statusRes) ? statusRes : []);
        if (licenseRes && licenseRes.success && Array.isArray(licenseRes.data)) {
          // ensure defaults for frontend-only fields
          const normalized = licenseRes.data.map((l) => ({
            ...l,
            licenseName: l.licenseName || l.licenseHolder || "",
            businessDetails: l.businessDetails || {
              legalName: l.businessName || "",
              registrationNumber: l.registrationNumber || "",
              address: { registered: l.businessAddress || "", operational: "" },
              contact: { phone: l.contactPhone || "", email: l.contactEmail || "", fax: "" },
              authorizedSignatories: l.authorizedSignatories || [],
            },
            financialDetails: l.financialDetails || {
              licenseCost: l.licenseCost || 0,
              paymentStatus: l.paymentStatus || "Unpaid",
              paymentDate: l.paymentDate || null,
              invoiceNumber: l.invoiceNumber || "",
              penalties: l.penalties || 0,
            },
            complianceChecklist: l.complianceChecklist || [],
            documents: l.documents || [],
            auditTrail: l.auditTrail || [],
            crossBorderDetails: l.crossBorderDetails || { isCrossBorder: false },
            accessControl: l.accessControl || { viewableBy: [], editableBy: [] },
            reminderDaysBefore: l.reminderDaysBefore ?? 30,
            status: l.status || "Active",
          }));
          setLicenses(normalized);
        } else {
          setLicenses([]);
        }
      } catch (err) {
        Swal.fire("Error", err.message || "Failed to fetch data", "error");
      }
    };
    fetchData();
  }, []);

  // pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = licenses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(licenses.length / itemsPerPage);

  // delete
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete License?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;
    try {
      await deleteCoreLicense(id);
      setLicenses((prev) => prev.filter((l) => l._id !== id));
      Swal.fire("Deleted!", "License removed successfully.", "success");
    } catch (err) {
      Swal.fire("Error", "Could not delete license.", "error");
    }
  };

  // compute days left for expiry
  const getDaysLeft = (expiryDate) => {
    if (!expiryDate) return null;
    const d = new Date(expiryDate);
    const diff = d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // start editing: map license to nested editForm
  const startEditing = (license) => {
    setEditing(license);
    setEditForm({
      _id: license._id,
      // Basic
      licenseName: license.licenseName || license.licenseHolder || "",
      licenseNumber: license.licenseNumber || "",
      documentType: license.documentType || "",
      licenseCategory: license.licenseCategory || "",
      issuingAuthority: license.issuingAuthority || "",
      businessType: license.businessType || "",
      jurisdiction: {
        country: license.jurisdiction?.country || "",
        state: license.jurisdiction?.state || "",
        city: license.jurisdiction?.city || "",
      },
      industrySector: license.industrySector || "",
      description: license.description || "",
      // Dates & renewal
      issueDate: license.issueDate ? new Date(license.issueDate).toISOString().split("T")[0] : "",
      expiryDate: license.expiryDate ? new Date(license.expiryDate).toISOString().split("T")[0] : "",
      renewalTerms: license.renewalTerms || "",
      renewalFrequency: license.renewalFrequency || "",
      gracePeriod: license.gracePeriod ?? 0,
      reminderDaysBefore: license.reminderDaysBefore ?? 30,
      status: license.status || "Active",
      // Business Details (nested)
      businessDetails: {
        legalName: license.businessDetails?.legalName || license.businessName || license.licenseHolder || "",
        registrationNumber: license.businessDetails?.registrationNumber || license.registrationNumber || "",
        address: {
          registered: license.businessDetails?.address?.registered || license.businessAddress || "",
          operational: license.businessDetails?.address?.operational || "",
        },
        contact: {
          phone: license.businessDetails?.contact?.phone || license.contactPhone || "",
          email: license.businessDetails?.contact?.email || license.contactEmail || "",
          fax: license.businessDetails?.contact?.fax || "",
        },
        authorizedSignatories: (license.businessDetails && license.businessDetails.authorizedSignatories) || license.authorizedSignatories || [],
      },
      // Compliance & docs
      complianceChecklist: license.complianceChecklist || [],
      verificationStatus: license.verificationStatus || "Pending",
      documents: license.documents || [], // existing attachments (fileUrl etc.)
      newDocuments: [], // local File objects to upload later
      // Financial
      financialDetails: license.financialDetails || {
        licenseCost: 0,
        paymentStatus: "Unpaid",
        paymentDate: license.financialDetails?.paymentDate || "",
        invoiceNumber: license.financialDetails?.invoiceNumber || "",
        penalties: license.financialDetails?.penalties || 0,
      },
      // Access / cross-border
      accessControl: {
        viewableBy: (license.accessControl && license.accessControl.viewableBy) || [],
        editableBy: (license.accessControl && license.accessControl.editableBy) || [],
      },
      crossBorderDetails: license.crossBorderDetails || { isCrossBorder: false, importExportLicenseNo: "", foreignJurisdiction: "" },
      // Audit / versions
      auditTrail: license.auditTrail || [],
      versions: license.versions || [],
    });
  };

  // generic form change for top-level and nested using dot-notation
  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    // file input
    if (type === "file") {
      // accept multiple
      const fArr = Array.from(files);
      // simulate storing minimal file info client-side
      const newDocs = fArr.map((f) => ({
        fileName: f.name,
        fileType: f.type,
        size: f.size,
        uploadedAt: new Date(),
        // previewURL: URL.createObjectURL(f) // optional
      }));
      setEditForm((prev) => ({
        ...prev,
        newDocuments: [...(prev.newDocuments || []), ...newDocs],
      }));
      return;
    }
    // allow nested names like businessDetails.legalName, jurisdiction.country, financialDetails.licenseCost
    if (name.includes(".")) {
      const parts = name.split(".");
      setEditForm((prev) => {
        const copy = { ...prev };
        let obj = copy;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!obj[parts[i]]) obj[parts[i]] = {};
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = type === "checkbox" ? checked : value;
        return copy;
      });
    } else {
      setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  // add/remove authorized signatory
  const addSignatory = () => {
    setEditForm((prev) => ({
      ...prev,
      businessDetails: {
        ...(prev.businessDetails || {}),
        authorizedSignatories: [...((prev.businessDetails && prev.businessDetails.authorizedSignatories) || []), { name: "", designation: "", contact: "" }],
      },
    }));
  };
  const updateSignatory = (index, key, value) => {
    setEditForm((prev) => {
      const bd = { ...(prev.businessDetails || {}) };
      const arr = [...(bd.authorizedSignatories || [])];
      arr[index] = { ...arr[index], [key]: value };
      bd.authorizedSignatories = arr;
      return { ...prev, businessDetails: bd };
    });
  };
  const removeSignatory = (index) => {
    setEditForm((prev) => {
      const bd = { ...(prev.businessDetails || {}) };
      const arr = [...(bd.authorizedSignatories || [])];
      arr.splice(index, 1);
      bd.authorizedSignatories = arr;
      return { ...prev, businessDetails: bd };
    });
  };

  // add/remove compliance item (simple text)
  const addComplianceItem = () => {
    const val = prompt("Enter compliance checklist item (e.g., Fire NOC)");
    if (!val) return;
    setEditForm((prev) => ({ ...prev, complianceChecklist: [...(prev.complianceChecklist || []), val] }));
  };
  const removeComplianceItem = (idx) => {
    setEditForm((prev) => {
      const arr = [...(prev.complianceChecklist || [])];
      arr.splice(idx, 1);
      return { ...prev, complianceChecklist: arr };
    });
  };

  // remove a new selected document (client-side)
  const removeNewDocument = (idx) => {
    setEditForm((prev) => {
      const arr = [...(prev.newDocuments || [])];
      arr.splice(idx, 1);
      return { ...prev, newDocuments: arr };
    });
  };

  // submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // prepare payload to match schema - backend expects nested objects
      const payload = {
        licenseName: editForm.licenseName,
        licenseNumber: editForm.licenseNumber,
        documentType: editForm.documentType,
        licenseCategory: editForm.licenseCategory,
        issuingAuthority: editForm.issuingAuthority,
        businessType: editForm.businessType,
        jurisdiction: editForm.jurisdiction,
        industrySector: editForm.industrySector,
        description: editForm.description,
        issueDate: editForm.issueDate || null,
        expiryDate: editForm.expiryDate || null,
        renewalTerms: editForm.renewalTerms,
        renewalFrequency: editForm.renewalFrequency,
        gracePeriod: Number(editForm.gracePeriod || 0),
        reminderDaysBefore: Number(editForm.reminderDaysBefore || 30),
        status: editForm.status,
        businessDetails: {
          legalName: editForm.businessDetails?.legalName || "",
          registrationNumber: editForm.businessDetails?.registrationNumber || "",
          address: {
            registered: editForm.businessDetails?.address?.registered || "",
            operational: editForm.businessDetails?.address?.operational || "",
          },
          contact: {
            phone: editForm.businessDetails?.contact?.phone || "",
            email: editForm.businessDetails?.contact?.email || "",
            fax: editForm.businessDetails?.contact?.fax || "",
          },
          authorizedSignatories: editForm.businessDetails?.authorizedSignatories || [],
        },
        complianceChecklist: editForm.complianceChecklist || [],
        verificationStatus: editForm.verificationStatus || "Pending",
        // merge existing documents + newDocuments (frontend only)
        documents: [...(editForm.documents || []), ...(editForm.newDocuments || [])],
        financialDetails: {
          licenseCost: Number(editForm.financialDetails?.licenseCost || 0),
          paymentStatus: editForm.financialDetails?.paymentStatus || "Unpaid",
          paymentDate: editForm.financialDetails?.paymentDate || "",
          invoiceNumber: editForm.financialDetails?.invoiceNumber || "",
          penalties: Number(editForm.financialDetails?.penalties || 0),
        },
        accessControl: {
          viewableBy: Array.isArray(editForm.accessControl?.viewableBy) ? editForm.accessControl.viewableBy : (typeof editForm.accessControl?.viewableBy === "string" ? editForm.accessControl.accessibleBy?.split(",").map(s => s.trim()) : []),
          editableBy: Array.isArray(editForm.accessControl?.editableBy) ? editForm.accessControl.editableBy : (typeof editForm.accessControl?.editableBy === "string" ? editForm.accessControl.editableBy.split(",").map(s => s.trim()) : []),
        },
        crossBorderDetails: editForm.crossBorderDetails || { isCrossBorder: false },
        // push audit trail entry - backend controller also adds one; this is frontend note
        auditTrail: [...(editForm.auditTrail || []), { action: "Edited (frontend)", user: "currentUser", timestamp: new Date() }],
      };

      const updated = await updateCoreLicense(editForm._id, payload);
      if (updated && updated.success) {
        // API returned object
        setLicenses((prev) =>
          prev.map((l) => (l._id === updated.data._id ? updated.data : l))
        );
        Swal.fire("Updated!", "License updated successfully.", "success");
      } else if (updated && updated.data) {
        // sometimes API returns data directly
        setLicenses((prev) =>
          prev.map((l) => (l._id === updated.data._id ? updated.data : l))
        );
        Swal.fire("Updated!", "License updated successfully.", "success");
      } else {
        // optimistic update fallback: update local state using payload
        setLicenses((prev) => prev.map((l) => (l._id === editForm._id ? { ...l, ...payload } : l)));
        Swal.fire("Updated!", "License updated locally (backend pending).", "success");
      }

      setEditing(null);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update license.", "error");
    }
  };

  // VIEW modal formatted display helper
  const renderViewField = (label, value) => (
    <p>
      <strong>{label}:</strong> {value ?? "—"}
    </p>
  );

  return (
    <div className="inventory-container">
      <h2 className="inventory-title">Core Company Licenses</h2>

      <div className="inventory-grid">
        <AnimatePresence>
          {currentItems.map((license) => {
            const daysLeft = getDaysLeft(license.expiryDate);
            return (
              <motion.div
                key={license._id}
                className="inventory-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ y: -5, boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}
                transition={{ duration: 0.25 }}
              >
                <div className="card-header">
                  <h3 className="card-title">{license.licenseName || license.businessDetails?.legalName || license.licenseHolder}</h3>
                  <span
                    className={`status-badge ${
                      daysLeft < 0 ? "expired" : daysLeft < (license.reminderDaysBefore ?? 30) ? "near-expiry" : ""
                    }`}
                  >
                    {daysLeft === null ? "No expiry" : daysLeft < 0 ? "Expired" : `${daysLeft} days left`}
                  </span>
                </div>

                <div className="card-info2">
                  <p><strong>Document:</strong> {license.documentType}</p>
                  <p><strong>License No:</strong> {license.licenseNumber}</p>
                  <p><strong>Authority:</strong> {license.issuingAuthority}</p>
                  <p><strong>Expiry:</strong> {license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : "—"}</p>
                </div>

                <div className="card-actions">
                  <button onClick={() => setSelected(license)} className="btn-view">
                    <FontAwesomeIcon icon={faEye} /> View
                  </button>
                  <button onClick={() => startEditing(license)} className="btn-edit">
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                  <button onClick={() => handleDelete(license._id)} className="btn-delete">
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* VIEW MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="overlay-content" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3>{selected.licenseName || selected.licenseHolder} — Details</h3>

              {/* Basic */}
              {renderViewField("License Name", selected.licenseName)}
              {renderViewField("License Number", selected.licenseNumber)}
              {renderViewField("Document Type", selected.documentType)}
              {renderViewField("Category", selected.licenseCategory)}
              {renderViewField("Issuing Authority", selected.issuingAuthority)}
              {renderViewField("Business Type", selected.businessType)}
              {renderViewField("Industry Sector", selected.industrySector)}
              {renderViewField("Description", selected.description)}

              {/* Jurisdiction */}
              <h4>Jurisdiction</h4>
              {renderViewField("Country", selected.jurisdiction?.country)}
              {renderViewField("State", selected.jurisdiction?.state)}
              {renderViewField("City", selected.jurisdiction?.city)}

              {/* Dates */}
              <h4>Validity & Dates</h4>
              {renderViewField("Issue Date", selected.issueDate ? new Date(selected.issueDate).toLocaleDateString() : null)}
              {renderViewField("Expiry Date", selected.expiryDate ? new Date(selected.expiryDate).toLocaleDateString() : null)}
              {renderViewField("Renewal Terms", selected.renewalTerms)}
              {renderViewField("Renewal Frequency", selected.renewalFrequency)}
              {renderViewField("Grace Period (days)", selected.gracePeriod)}
              {renderViewField("Reminder Days Before", selected.reminderDaysBefore)}
              {renderViewField("Status", selected.status)}

              {/* Business Details */}
              <h4>Business Details</h4>
              {renderViewField("Legal Name", selected.businessDetails?.legalName)}
              {renderViewField("Registration No.", selected.businessDetails?.registrationNumber)}
              {renderViewField("Registered Address", selected.businessDetails?.address?.registered)}
              {renderViewField("Operational Address", selected.businessDetails?.address?.operational)}
              {renderViewField("Contact Email", selected.businessDetails?.contact?.email)}
              {renderViewField("Contact Phone", selected.businessDetails?.contact?.phone)}
              {selected.businessDetails?.authorizedSignatories?.length > 0 && (
                <>
                  <h5>Authorized Signatories</h5>
                  {selected.businessDetails.authorizedSignatories.map((s, idx) => (
                    <p key={idx}><strong>{s.name}</strong> — {s.designation} ({s.contact})</p>
                  ))}
                </>
              )}

              {/* Compliance */}
              <h4>Compliance</h4>
              {selected.complianceChecklist?.length ? (
                <ul>
                  {selected.complianceChecklist.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              ) : renderViewField("Compliance Checklist", "—")}
              {renderViewField("Verification Status", selected.verificationStatus)}

              {/* Documents */}
              <h4>Documents</h4>
              {selected.documents?.length ? (
                <ul>
                  {selected.documents.map((d, i) => (
                    <li key={i}>
                      {d.fileName} {d.fileUrl ? (<a href={d.fileUrl} target="_blank" rel="noreferrer">(open)</a>) : null} — {d.fileType}
                    </li>
                  ))}
                </ul>
              ) : renderViewField("Documents", "—")}

              {/* Financial */}
              <h4>Financial</h4>
              {renderViewField("License Cost", selected.financialDetails?.licenseCost)}
              {renderViewField("Payment Status", selected.financialDetails?.paymentStatus)}
              {renderViewField("Payment Date", selected.financialDetails?.paymentDate ? new Date(selected.financialDetails.paymentDate).toLocaleDateString() : null)}
              {renderViewField("Invoice No.", selected.financialDetails?.invoiceNumber)}
              {renderViewField("Penalties", selected.financialDetails?.penalties)}

              {/* Cross-border */}
              <h4>Cross-border</h4>
              {renderViewField("Is Cross Border", selected.crossBorderDetails?.isCrossBorder ? "Yes" : "No")}
              {renderViewField("Import/Export No.", selected.crossBorderDetails?.importExportLicenseNo)}
              {renderViewField("Foreign Jurisdiction", selected.crossBorderDetails?.foreignJurisdiction)}

              {/* Access Control */}
              <h4>Access Control</h4>
              {renderViewField("Viewable By", (selected.accessControl?.viewableBy || []).join(", "))}
              {renderViewField("Editable By", (selected.accessControl?.editableBy || []).join(", "))}

              {/* Audit Trail */}
              <h4>Audit Trail</h4>
              {selected.auditTrail?.length ? (
                <ul>
                  {selected.auditTrail.map((a, i) => (
                    <li key={i}>
                      [{new Date(a.timestamp).toLocaleString()}] {a.user} — {a.action}
                    </li>
                  ))}
                </ul>
              ) : renderViewField("Audit", "—")}

              <button className="close-btn" onClick={() => setSelected(null)}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editing && (
          <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="overlay-content" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3>Edit License – {editing.licenseName || editing.licenseHolder}</h3>
              <form onSubmit={handleEditSubmit} className="overlay-form">
                {/* Basic fields */}
                <input type="text" name="licenseName" value={editForm.licenseName || ""} onChange={handleFormChange} placeholder="License Name" />
                <input type="text" name="licenseNumber" value={editForm.licenseNumber || ""} onChange={handleFormChange} placeholder="License Number" />
                <input type="text" name="documentType" value={editForm.documentType || ""} onChange={handleFormChange} placeholder="Document Type" />
                <input type="text" name="licenseCategory" value={editForm.licenseCategory || ""} onChange={handleFormChange} placeholder="License Category" />
                <input type="text" name="issuingAuthority" value={editForm.issuingAuthority || ""} onChange={handleFormChange} placeholder="Issuing Authority" />
                <input type="text" name="businessType" value={editForm.businessType || ""} onChange={handleFormChange} placeholder="Business Type (Sole Prop / Pvt Ltd)" />
                <input type="text" name="industrySector" value={editForm.industrySector || ""} onChange={handleFormChange} placeholder="Industry Sector" />

                {/* Jurisdiction */}
                <input type="text" name="jurisdiction.country" value={editForm.jurisdiction?.country || ""} onChange={handleFormChange} placeholder="Country" />
                <input type="text" name="jurisdiction.state" value={editForm.jurisdiction?.state || ""} onChange={handleFormChange} placeholder="State/Province" />
                <input type="text" name="jurisdiction.city" value={editForm.jurisdiction?.city || ""} onChange={handleFormChange} placeholder="City" />

                {/* Dates & renewal */}
                <input type="date" name="issueDate" value={editForm.issueDate || ""} onChange={handleFormChange} />
                <input type="date" name="expiryDate" value={editForm.expiryDate || ""} onChange={handleFormChange} />
                <input type="text" name="renewalTerms" value={editForm.renewalTerms || ""} onChange={handleFormChange} placeholder="Renewal Terms" />
                <input type="text" name="renewalFrequency" value={editForm.renewalFrequency || ""} onChange={handleFormChange} placeholder="Renewal Frequency" />
                <input type="number" name="gracePeriod" value={editForm.gracePeriod || 0} onChange={handleFormChange} placeholder="Grace Period (days)" />
                <input type="number" name="reminderDaysBefore" value={editForm.reminderDaysBefore || 30} onChange={handleFormChange} placeholder="Reminder Days Before" />
                <input type="text" name="status" value={editForm.status || ""} onChange={handleFormChange} placeholder="Status" />

                {/* Business Details */}
                <h4>Business Details</h4>
                <input type="text" name="businessDetails.legalName" value={editForm.businessDetails?.legalName || ""} onChange={handleFormChange} placeholder="Business Legal Name" />
                <input type="text" name="businessDetails.registrationNumber" value={editForm.businessDetails?.registrationNumber || ""} onChange={handleFormChange} placeholder="Registration Number (CIN / GSTIN)" />
                <textarea name="businessDetails.address.registered" value={editForm.businessDetails?.address?.registered || ""} onChange={handleFormChange} placeholder="Registered Address" />
                <textarea name="businessDetails.address.operational" value={editForm.businessDetails?.address?.operational || ""} onChange={handleFormChange} placeholder="Operational Address" />
                <input type="email" name="businessDetails.contact.email" value={editForm.businessDetails?.contact?.email || ""} onChange={handleFormChange} placeholder="Contact Email" />
                <input type="text" name="businessDetails.contact.phone" value={editForm.businessDetails?.contact?.phone || ""} onChange={handleFormChange} placeholder="Contact Phone" />
                <input type="text" name="businessDetails.contact.fax" value={editForm.businessDetails?.contact?.fax || ""} onChange={handleFormChange} placeholder="Fax" />

                {/* Authorized Signatories */}
                <h5>Authorized Signatories</h5>
                {(editForm.businessDetails?.authorizedSignatories || []).map((s, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                    <input type="text" value={s.name} onChange={(e) => updateSignatory(idx, "name", e.target.value)} placeholder="Name" />
                    <input type="text" value={s.designation} onChange={(e) => updateSignatory(idx, "designation", e.target.value)} placeholder="Designation" />
                    <input type="text" value={s.contact} onChange={(e) => updateSignatory(idx, "contact", e.target.value)} placeholder="Contact" />
                    <button type="button" onClick={() => removeSignatory(idx)} className="close-btn">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addSignatory} className="save-btn" style={{ marginBottom: 8 }}>Add Signatory</button>

                {/* Compliance */}
                <h4>Compliance & Documents</h4>
                <div>
                  <button type="button" onClick={addComplianceItem} className="save-btn" style={{ marginBottom: 8 }}>Add Compliance Item</button>
                  <div>
                    {(editForm.complianceChecklist || []).map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <span>{c}</span>
                        <button type="button" onClick={() => removeComplianceItem(i)} className="close-btn">Remove</button>
                      </div>
                    ))}
                    {!editForm.complianceChecklist?.length && <p>No compliance items</p>}
                  </div>
                </div>

                {/* Document uploads (frontend-only simulation) */}
                <label style={{ marginTop: 8 }}>Upload Documents (frontend-only)</label>
                <input type="file" name="documents" onChange={handleFormChange} multiple />
                <div>
                  <h5>Existing Documents</h5>
                  {(editForm.documents || []).map((d, i) => (
                    <div key={i}>
                      <span>{d.fileName} {d.fileUrl ? <a href={d.fileUrl} target="_blank" rel="noreferrer">(open)</a> : null}</span>
                    </div>
                  ))}
                  <h5>New Documents (selected)</h5>
                  {(editForm.newDocuments || []).map((d, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span>{d.fileName} ({Math.round(d.size/1024)} KB)</span>
                      <button type="button" onClick={() => removeNewDocument(i)} className="close-btn">Remove</button>
                    </div>
                  ))}
                </div>

                {/* Financial */}
                <h4>Financial Details</h4>
                <input type="number" name="financialDetails.licenseCost" value={editForm.financialDetails?.licenseCost || 0} onChange={handleFormChange} placeholder="License Cost" />
                <select name="financialDetails.paymentStatus" value={editForm.financialDetails?.paymentStatus || "Unpaid"} onChange={handleFormChange}>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Due">Due</option>
                  <option value="Overdue">Overdue</option>
                </select>
                <input type="date" name="financialDetails.paymentDate" value={editForm.financialDetails?.paymentDate || ""} onChange={handleFormChange} />
                <input type="text" name="financialDetails.invoiceNumber" value={editForm.financialDetails?.invoiceNumber || ""} onChange={handleFormChange} placeholder="Invoice Number" />
                <input type="number" name="financialDetails.penalties" value={editForm.financialDetails?.penalties || 0} onChange={handleFormChange} placeholder="Penalties (if any)" />

                {/* Cross-border */}
                <h4>Cross-border Details</h4>
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="checkbox" name="crossBorderDetails.isCrossBorder" checked={!!editForm.crossBorderDetails?.isCrossBorder} onChange={handleFormChange} />
                  Is Cross-border
                </label>
                <input type="text" name="crossBorderDetails.importExportLicenseNo" value={editForm.crossBorderDetails?.importExportLicenseNo || ""} onChange={handleFormChange} placeholder="Import/Export License No" />
                <input type="text" name="crossBorderDetails.foreignJurisdiction" value={editForm.crossBorderDetails?.foreignJurisdiction || ""} onChange={handleFormChange} placeholder="Foreign Jurisdiction" />

                {/* Access control */}
                <h4>Access Control (comma-separated roles)</h4>
                <input type="text" name="accessControl.viewableBy" value={(editForm.accessControl?.viewableBy || []).join(", ")} onChange={(e) => {
                  const val = e.target.value.split(",").map(s=>s.trim()).filter(Boolean);
                  setEditForm(prev => ({...prev, accessControl: {...(prev.accessControl||{}), viewableBy: val}}));
                }} placeholder="Admin,Manager,Auditor" />
                <input type="text" name="accessControl.editableBy" value={(editForm.accessControl?.editableBy || []).join(", ")} onChange={(e) => {
                  const val = e.target.value.split(",").map(s=>s.trim()).filter(Boolean);
                  setEditForm(prev => ({...prev, accessControl: {...(prev.accessControl||{}), editableBy: val}}));
                }} placeholder="Admin,Manager" />

                {/* Verification */}
                <select name="verificationStatus" value={editForm.verificationStatus || "Pending"} onChange={handleFormChange}>
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <div className="modal-actions">
                  <button type="submit" className="save-btn">Save</button>
                  <button type="button" className="close-btn" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoreCompanyLicenseList;
