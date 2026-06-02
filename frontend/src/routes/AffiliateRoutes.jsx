import { Route } from "react-router-dom";

import AffiliateLayout from "../layout/AffiliateLayout";

import AffiliateDashboard from "../Pages/affiliate/AffiliateDashboard";
import AffiliateReferrals from "../Pages/affiliate/AffiliateReferrals";
import AffiliateEarnings from "../Pages/affiliate/AffiliateEarnings";
import AffiliatePayouts from "../Pages/affiliate/AffiliatePayout";
import AffiliateSettingsLayout from "../Pages/affiliate/AffiliateSettingsLayout";
import AffiliateProfileSettings from "../Pages/affiliate/AffiliateProfileSettings";
import AffiliatePayoutSettings from "../Pages/affiliate/AffiliatePayoutSettings";
import AffiliatePreferenceSettings from "../Pages/affiliate/AffiliatePreferencesSettings";
import AffiliateTickets from "../Pages/affiliate/AffiliateTickets";
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
  <Route
    path="tickets"
    element={<AffiliateTickets />}
  />
</Route>
      </Route>
    </>
  );
};

export default AffiliateRoutes;