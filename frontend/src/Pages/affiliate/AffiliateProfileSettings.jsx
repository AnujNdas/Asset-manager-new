import React, { useEffect, useState } from "react";
import Loader from "../../Components/Loader";
import ThemeSwal from "../../utils/SwalTheme";

import {
  getAffiliateProfileSettings,
  updateAffiliateProfileSettings,
} from "../../Services/AffiliateServices";

const AffiliateProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    website: "",
    audienceType: "",
    promotionMethod: "",
    affiliateCode: "",
    referralLink: "",
    status: "",
    notes: "",
  });

  const fetchProfile = async () => {
    try {
      const res =
        await getAffiliateProfileSettings();

      setFormData(res.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await updateAffiliateProfileSettings({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        audienceType:
          formData.audienceType,
        promotionMethod:
          formData.promotionMethod,
        notes: formData.notes,
      });

      ThemeSwal.fire({
        icon: "success",
        title: "Profile Updated",
      });
    } catch (err) {
      console.error(err);

      ThemeSwal.fire({
        icon: "error",
        title: "Update Failed",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="affiliate-settings-card">

      <div className="settings-header">
        <h2>Profile Settings</h2>
        <p>
          Manage your affiliate profile.
        </p>
      </div>

      <div className="settings-grid">

        <div className="form-group">
          <label>Full Name</label>

          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Phone</label>

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Website</label>

          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Audience Type</label>

          <select
            name="audienceType"
            value={formData.audienceType}
            onChange={handleChange}
          >
            <option value="">
              Select Audience
            </option>

            <option value="individual">
              Individual
            </option>

            <option value="agency">
              Agency
            </option>

            <option value="creator">
              Creator
            </option>

            <option value="business">
              Business
            </option>
          </select>
        </div>

        <div className="form-group">
          <label>Status</label>

          <input
            value={formData.status}
            readOnly
          />
        </div>

      </div>

      <div className="form-group">
        <label>Promotion Method</label>

        <textarea
          rows={5}
          name="promotionMethod"
          value={formData.promotionMethod}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Notes</label>

        <textarea
          rows={4}
          name="notes"
          value={formData.notes}
          onChange={handleChange}
        />
      </div>

      <div className="settings-readonly">

        <div>
          <label>Affiliate Code</label>

          <input
            value={formData.affiliateCode}
            readOnly
          />
        </div>

        <div>
          <label>Referral Link</label>

          <input
            value={formData.referralLink}
            readOnly
          />
        </div>

      </div>

      <button
        className="save-settings-btn"
        onClick={handleSave}
        disabled={saving}
      >
        {saving
          ? "Saving..."
          : "Save Changes"}
      </button>

    </div>
  );
};

export default AffiliateProfileSettings;