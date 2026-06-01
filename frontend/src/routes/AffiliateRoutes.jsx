import { Route } from "react-router-dom";

import AffiliateLayout from "../layout/AffiliateLayout";

import AffiliateDashboard from "../Pages/affiliate/AffiliateDashboard";
import AffiliateReferrals from "../Pages/affiliate/AffiliateReferrals";
import AffiliateEarnings from "../Pages/affiliate/AffiliateEarnings";
import AffiliatePayouts from "../Pages/affiliate/AffiliatePayout";
import AffiliateProfile from "../Pages/affiliate/AffiliateProfile";
import AffiliateSettingsLayout from "../Pages/Affiliate/AffiliateSettingsLayout";
import AffiliateProfileSettings from "../Pages/Affiliate/AffiliateProfileSettings";
import AffiliatePayoutSettings from "../Pages/Affiliate/AffiliatePayoutSettings";
import AffiliatePreferenceSettings from "../Pages/Affiliate/AffiliatePreferenceSettings";
const AffiliateRoutes = () => {
  return (
    <>
      <Route
        path="/affiliate"
        element={<AffiliateLayout />}
      >
        <Route
          path="dashboard"
          element={<AffiliateDashboard />}
        />

        <Route
          path="referrals"
          element={<AffiliateReferrals />}
        />

        <Route
          path="earnings"
          element={<AffiliateEarnings />}
        />

        <Route
          path="payouts"
          element={<AffiliatePayouts />}
        />

        <Route
          path="profile"
          element={<AffiliateProfile />}
        />
          <Route
  path="/affiliate/settings"
  element={<AffiliateSettingsLayout />}
>
  <Route
    path="profile"
    element={<AffiliateProfileSettings />}
  />

  <Route
    path="payout"
    element={<AffiliatePayoutSettings />}
  />

  <Route
    path="preferences"
    element={<AffiliatePreferenceSettings />}
  />
</Route>
      </Route>
    </>
  );
};

export default AffiliateRoutes;