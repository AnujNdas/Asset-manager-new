import React, {
  useEffect,
  useState,
} from "react";

import ThemeSwal from "../../utils/SwalTheme";

import {
  getAffiliatePreferences,
  updateAffiliatePreferences,
} from "../../Services/AffiliateServices";

const AffiliatePreferenceSettings = () => {

  const [isActive, setIsActive] =
    useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res =
      await getAffiliatePreferences();

    setIsActive(
      res.data?.isActive ?? true
    );
  };

  const saveSettings = async () => {

    await updateAffiliatePreferences({
      isActive,
    });

    ThemeSwal.fire({
      icon: "success",
      title: "Preferences Updated",
    });
  };

  return (
    <div className="affiliate-settings-card">

      <h2>Preferences</h2>

      <div className="toggle-row">

        <span>
          Affiliate Account Active
        </span>

        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) =>
            setIsActive(
              e.target.checked
            )
          }
        />

      </div>

      <button
        className="save-settings-btn"
        onClick={saveSettings}
      >
        Save Changes
      </button>

    </div>
  );
};

export default AffiliatePreferenceSettings;