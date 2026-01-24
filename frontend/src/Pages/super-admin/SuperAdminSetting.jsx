import { useEffect, useState } from "react";
import {
  getSystemSettings,
  updateSystemSettings
} from "../../Services/AdminServices";
import "../../Page_styles/SuperAdminSetting.css"; 
const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState({
    allowRegistrations: false,
    maintenanceMode: false
  });

  /* ================= FETCH SETTINGS ================= */

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSystemSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
      setError(err.userMessage || "Failed to load system settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSystemSettings(settings);
      alert("System settings updated");
    } catch (err) {
      alert(err.userMessage || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI STATES ================= */

  if (loading) return <h2>Loading settings...</h2>;
  if (error) return <h2>{error}</h2>;

  return (
    <>
      <h1>Platform Settings</h1>

      <section className="sa-section">
        <div className="field checkbox">
          <input
            type="checkbox"
            name="allowRegistrations"
            checked={settings.allowRegistrations}
            onChange={handleChange}
          />
          <label>Allow new user registrations</label>
        </div>

        <div className="field checkbox">
          <input
            type="checkbox"
            name="maintenanceMode"
            checked={settings.maintenanceMode}
            onChange={handleChange}
          />
          <label>Enable maintenance mode</label>
        </div>
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </>
  );
};

export default Settings;
