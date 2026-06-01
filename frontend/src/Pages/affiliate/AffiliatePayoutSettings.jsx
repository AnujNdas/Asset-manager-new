import React, { useEffect, useState } from "react";
import ThemeSwal from "../../utils/SwalTheme";

import {
  getAffiliatePayoutSettings,
  updateAffiliatePayoutSettings,
} from "../../Services/AffiliateServices";

const AffiliatePayoutSettings = () => {

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [formData, setFormData] =
    useState({
      payoutMethod: "upi",
      payoutDetails: {},
    });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res =
        await getAffiliatePayoutSettings();

      setFormData(res.data);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      await updateAffiliatePayoutSettings(
        formData
      );

      ThemeSwal.fire({
        icon: "success",
        title: "Payout Updated",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="affiliate-settings-card">

      <h2>Payout Settings</h2>

      <div className="form-group">

        <label>Payout Method</label>

        <select
          value={formData.payoutMethod}
          onChange={(e) =>
            setFormData({
              ...formData,
              payoutMethod:
                e.target.value,
            })
          }
        >
          <option value="upi">
            UPI
          </option>

          <option value="bank">
            Bank
          </option>

          <option value="paypal">
            Paypal
          </option>
        </select>

      </div>

      {formData.payoutMethod ===
        "upi" && (
        <div className="form-group">
          <label>UPI ID</label>

          <input
            value={
              formData.payoutDetails
                ?.upiId || ""
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                payoutDetails: {
                  upiId:
                    e.target.value,
                },
              })
            }
          />
        </div>
      )}

      {formData.payoutMethod ===
        "bank" && (
        <>
          <input
            placeholder="Account Name"
          />

          <input
            placeholder="Account Number"
          />

          <input
            placeholder="IFSC Code"
          />
        </>
      )}

      {formData.payoutMethod ===
        "paypal" && (
        <input
          placeholder="Paypal Email"
        />
      )}

      <button
        className="save-settings-btn"
        onClick={saveSettings}
      >
        {saving
          ? "Saving..."
          : "Save Changes"}
      </button>

    </div>
  );
};

export default AffiliatePayoutSettings;