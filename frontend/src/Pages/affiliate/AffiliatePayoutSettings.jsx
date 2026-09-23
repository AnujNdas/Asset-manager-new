import React, { useEffect, useState } from "react";
import ThemeSwal from "../../utils/swalTheme";

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

      payoutDetails: {
        upiId: "",
        accountName: "",
        accountNumber: "",
        ifscCode: "",
        paypalEmail: "",
      },
    });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {

      const res =
        await getAffiliatePayoutSettings();

      setFormData({
        payoutMethod:
          res.data?.payoutMethod || "upi",

        payoutDetails: {
          upiId:
            res.data?.payoutDetails?.upiId || "",

          accountName:
            res.data?.payoutDetails?.accountName || "",

          accountNumber:
            res.data?.payoutDetails?.accountNumber || "",

          ifscCode:
            res.data?.payoutDetails?.ifscCode || "",

          paypalEmail:
            res.data?.payoutDetails?.paypalEmail || "",
        },
      });

    } catch (error) {

      console.error(
        "Failed to load payout settings:",
        error
      );

    } finally {
      setLoading(false);
    }
  };

  const handleDetailChange = (
    field,
    value
  ) => {

    setFormData((prev) => ({
      ...prev,

      payoutDetails: {
        ...prev.payoutDetails,
        [field]: value,
      },
    }));

  };

  const handleMethodChange = (method) => {

    setFormData((prev) => ({
      ...prev,
      payoutMethod: method,
    }));

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
        text: "Your payout details have been saved.",
      });

    } catch (error) {

      console.error(
        "Failed to save payout settings:",
        error
      );

      ThemeSwal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error?.response?.data?.message ||
          "Failed to update payout settings.",
      });

    } finally {

      setSaving(false);

    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="affiliate-settings-card">

      <h2>Payout Settings</h2>

      {/* ==========================================
          PAYOUT METHOD
      ========================================== */}

      <div className="form-group">

        <label>
          Payout Method
        </label>

        <select
          value={formData.payoutMethod}
          onChange={(e) =>
            handleMethodChange(
              e.target.value
            )
          }
        >

          <option value="upi">
            UPI
          </option>

          <option value="bank">
            Bank Transfer
          </option>

          <option value="paypal">
            PayPal
          </option>

        </select>

      </div>

      {/* ==========================================
          UPI
      ========================================== */}

      {formData.payoutMethod === "upi" && (

        <div className="form-group">

          <label>
            UPI ID
          </label>

          <input
            type="text"
            placeholder="example@upi"
            value={
              formData.payoutDetails?.upiId || ""
            }
            onChange={(e) =>
              handleDetailChange(
                "upiId",
                e.target.value
              )
            }
          />

        </div>

      )}

      {/* ==========================================
          BANK
      ========================================== */}

      {formData.payoutMethod === "bank" && (

        <>

          <div className="form-group">

            <label>
              Account Name
            </label>

            <input
              type="text"
              placeholder="Account holder name"
              value={
                formData.payoutDetails
                  ?.accountName || ""
              }
              onChange={(e) =>
                handleDetailChange(
                  "accountName",
                  e.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <label>
              Account Number
            </label>

            <input
              type="text"
              placeholder="Bank account number"
              value={
                formData.payoutDetails
                  ?.accountNumber || ""
              }
              onChange={(e) =>
                handleDetailChange(
                  "accountNumber",
                  e.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <label>
              IFSC Code
            </label>

            <input
              type="text"
              placeholder="Example: SBIN0001234"
              value={
                formData.payoutDetails
                  ?.ifscCode || ""
              }
              onChange={(e) =>
                handleDetailChange(
                  "ifscCode",
                  e.target.value.toUpperCase()
                )
              }
            />

          </div>

        </>

      )}

      {/* ==========================================
          PAYPAL
      ========================================== */}

      {formData.payoutMethod === "paypal" && (

        <div className="form-group">

          <label>
            PayPal Email
          </label>

          <input
            type="email"
            placeholder="example@email.com"
            value={
              formData.payoutDetails
                ?.paypalEmail || ""
            }
            onChange={(e) =>
              handleDetailChange(
                "paypalEmail",
                e.target.value
              )
            }
          />

        </div>

      )}

      {/* ==========================================
          SAVE
      ========================================== */}

      <button
        className="save-settings-btn"
        onClick={saveSettings}
        disabled={saving}
      >
        {saving
          ? "Saving..."
          : "Save Changes"}
      </button>

    </div>
  );
};

export default AffiliatePayoutSettings;