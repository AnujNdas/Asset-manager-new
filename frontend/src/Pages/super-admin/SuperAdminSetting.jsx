import { useEffect, useState } from "react";
import {
  getSystemSettings,
  updateSystemSettings,
  approveAffiliateStatus,
  getAffiliates
} from "../../Services/AdminServices";
import "../../Page_styles/SuperAdminSetting.css"; 

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  const [settings, setSettings] = useState({
    allowRegistrations: false,
    maintenanceMode: false,
    defaultUserRole: "user",
    requireEmailVerification: true,
    autoApproveAffiliates: false,
    defaultCommissionRate: 10,
    minimumPayout: 50
  });

  const [affiliates, setAffiliates] = useState([]);

  /* ================= FETCH INITIAL DATA ================= */

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsData, affiliatesData] = await Promise.all([
        getSystemSettings(),
        getAffiliates("pending") // Fetching pending applications
      ]);

      setSettings((prev) => ({ ...prev, ...settingsData }));
      setAffiliates(affiliatesData.data || affiliatesData);
    } catch (err) {
      console.error(err);
      setError(err.userMessage || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await updateSystemSettings(settings);
      alert("System settings updated successfully");
    } catch (err) {
      alert(err.userMessage || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  // Handler for Appending/Rejecting Affiliate Status
  const handleStatusUpdate = async (id, status, rejectionReason = "") => {
    try {
      await approveAffiliateStatus(id, { status, rejectionReason });
      
      // Remove handled affiliate from the pending list view
      setAffiliates((prev) => prev.filter((aff) => aff._id !== id));
      alert(`Affiliate application successfully ${status}!`);
    } catch (err) {
      alert(err.message || "Failed to update affiliate status");
    }
  };

  /* ================= UI STATES ================= */

  if (loading) return <div className="settings-container"><h2>Loading...</h2></div>;
  if (error) return <div className="settings-container"><h2>{error}</h2></div>;

  return (
    <div className="settings-container">
      
      <div className="settings-header">
        <h1>Platform Settings & Management</h1>
        <p>Manage global configurations, user policies, and review affiliate applications.</p>
      </div>

      {/* Tab Navigation Bar */}
      <div className="settings-tabs">
        <button
          onClick={() => setActiveTab("general")}
          className={`tab-btn ${activeTab === "general" ? "active" : ""}`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab("user")}
          className={`tab-btn ${activeTab === "user" ? "active" : ""}`}
        >
          User
        </button>
        <button
          onClick={() => setActiveTab("affiliate")}
          className={`tab-btn ${activeTab === "affiliate" ? "active" : ""}`}
        >
          Affiliate
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="settings-card">
        
        {/* GENERAL TAB */}
        {activeTab === "general" && (
          <div>
            <h3>General System Configurations</h3>
            <div className="field-group checkbox-field">
              <input
                type="checkbox"
                name="allowRegistrations"
                checked={settings.allowRegistrations}
                onChange={handleChange}
                id="allowRegistrations"
              />
              <label htmlFor="allowRegistrations">Allow new user registrations</label>
            </div>
          </div>
        )}

        {/* USER TAB */}
        {activeTab === "user" && (
          <div>
            <h3>User & Account Settings</h3>
            <div className="field-group input-field">
              <label>Default User Role</label>
              <select
                name="defaultUserRole"
                value={settings.defaultUserRole}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="affiliate">Affiliate</option>
              </select>
            </div>
          </div>
        )}

        {/* AFFILIATE TAB (Detailed View) */}
        {activeTab === "affiliate" && (
          <div>
            <h3>Pending Affiliate Applications</h3>
            {affiliates.length === 0 ? (
              <p className="field-hint" style={{ marginTop: "12px" }}>No pending affiliate applications found.</p>
            ) : (
              <div className="affiliates-list">
                {affiliates.map((aff) => (
                  <div key={aff._id} className="affiliate-item-card">
                    
                    <div className="affiliate-info-main">
                      <div className="affiliate-name-row">
                        <h4>{aff.fullName}</h4>
                        <span className="affiliate-code-badge">{aff.affiliateCode}</span>
                      </div>
                      
                      <p className="affiliate-subtext">
                        {aff.email} {aff.phone ? `| ${aff.phone}` : ""}
                      </p>

                      <div className="affiliate-details-grid">
                        <span>Audience: <strong>{aff.audienceType || "N/A"}</strong></span>
                        <span>Website: <strong>{aff.website || "None"}</strong></span>
                        <span>Method: <strong>{aff.promotionMethod || "N/A"}</strong></span>
                        <span>Applied: <strong>{new Date(aff.createdAt).toLocaleDateString()}</strong></span>
                      </div>
                    </div>

                    <div className="affiliate-actions">
                      <button 
                        className="btn-reject"
                        onClick={() => {
                          const reason = prompt("Enter rejection reason:");
                          if (reason !== null) {
                            handleStatusUpdate(aff._id, "rejected", reason);
                          }
                        }}
                      >
                        Reject
                      </button>
                      <button 
                        className="btn-approve" 
                        onClick={() => handleStatusUpdate(aff._id, "approved")}
                      >
                        Approve
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Save Button for Settings */}
      {activeTab !== "affiliate" && (
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="btn-save"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      )}

    </div>
  );
};

export default Settings;