import { useEffect, useState } from "react";
import {
  getSystemSettings,
  updateSystemSettings,
  approveAffiliateStatus
} from "../../Services/AdminServices";
import "../../Page_styles/SuperAdminSetting.css"; 

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'user' | 'affiliate'

  const [settings, setSettings] = useState({
    // General Settings
    allowRegistrations: false,
    maintenanceMode: false,
    
    // User Settings
    defaultUserRole: "user",
    requireEmailVerification: true,

    // Affiliate Settings
    autoApproveAffiliates: false,
    defaultCommissionRate: 10,
    minimumPayout: 50
  });

  /* ================= FETCH SETTINGS ================= */

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSystemSettings();
      setSettings((prev) => ({ ...prev, ...data }));
    } catch (err) {
      console.error(err);
      setError(err.userMessage || "Failed to load system settings");
    } finally {
      setLoading(false);
    }
  };
  const approveStatus = async () => {
    try {
      setLoading(true);
      const data = await approveAffiliateStatus();
      setSettings((prev) => ({ ...prev, ...data }));
    } catch (err) {
      console.error(err);
      setError(err.userMessage || "Failed to load system settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    approveStatus();
  }, []);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async () => {
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

  /* ================= UI STATES ================= */

  if (loading) return <div className="settings-container"><h2>Loading settings...</h2></div>;
  if (error) return <div className="settings-container"><h2>{error}</h2></div>;

  return (
    <div className="settings-container">
      
      {/* Header section matching style */}
      <div className="settings-header">
        <h1>Platform Settings</h1>
        <p>Manage global configurations, user policies, and affiliate program rules.</p>
      </div>

      {/* 🔹 Tab Navigation Bar (Matching layout design pattern) */}
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

      {/* 🔹 Tab Content Panels Container */}
      <div className="settings-card">
        
        {/* TAB 1: GENERAL SETTINGS */}
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
              <div>
                <label htmlFor="allowRegistrations">Allow new user registrations</label>
                <span className="field-hint">Permit new visitors to sign up for accounts on the platform.</span>
              </div>
            </div>

            <div className="field-group checkbox-field" style={{ marginTop: "16px" }}>
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                id="maintenanceMode"
              />
              <div>
                <label htmlFor="maintenanceMode">Enable maintenance mode</label>
                <span className="field-hint">Temporarily shut down public access for maintenance updates.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER SETTINGS */}
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

            <div className="field-group checkbox-field" style={{ marginTop: "20px" }}>
              <input
                type="checkbox"
                name="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onChange={handleChange}
                id="requireEmailVerification"
              />
              <div>
                <label htmlFor="requireEmailVerification">Require email verification on signup</label>
                <span className="field-hint">Users must verify their email address before accessing core features.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AFFILIATE SETTINGS */}
        {activeTab === "affiliate" && (
          <div>
            <h3>Affiliate Program Settings</h3>
            
            <div className="field-group checkbox-field">
              <input
                type="checkbox"
                name="autoApproveAffiliates"
                checked={settings.autoApproveAffiliates}
                onChange={handleChange}
                id="autoApproveAffiliates"
              />
              <div>
                <label htmlFor="autoApproveAffiliates">Auto-approve affiliate applications</label>
                <span className="field-hint">If unchecked, affiliates require manual Super Admin approval before referencing users.</span>
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: "20px" }}>
              <div className="field-group input-field" style={{ maxWidth: "none" }}>
                <label>Default Commission Rate (%)</label>
                <input
                  type="number"
                  name="defaultCommissionRate"
                  value={settings.defaultCommissionRate}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group input-field" style={{ maxWidth: "none" }}>
                <label>Minimum Payout Threshold ($)</label>
                <input
                  type="number"
                  name="minimumPayout"
                  value={settings.minimumPayout}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 🔹 Save Changes Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-save"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

    </div>
  );
};

export default Settings;