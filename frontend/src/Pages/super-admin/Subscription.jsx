import React, { useState , useEffect } from "react";
import "../../Page_styles/Super-Admin/Subscription.css";
import SubscriptionOrganizationCard from "../../Components/Super-admin/SubscriptionOrganizationCard";
import { getSubscription } from "../../Services/AdminServices";
import SubscriptionSummary from "../../Components/Super-admin/SubscriptionSummary";

const SubscriptionsPage = () => {
const [statusFilter, setStatusFilter] = useState("all");
const [planFilter, setPlanFilter] = useState("all");
const [billingFilter, setBillingFilter] = useState("all");
const [subscriptions, setSubscriptions] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [summary, setSummary] = useState({
  totalSubscriptions: 0,
  activeSubscriptions: 0,
  trialSubscriptions: 0,
  monthlySubscriptions: 0,
  yearlySubscriptions: 0,
  pausedSubscriptions: 0,
  cancelledSubscriptions: 0,
  expiredSubscriptions: 0,
  pastDueSubscriptions: 0,
});
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
  fetchSubscriptions();
}, []);
const fetchSubscriptions = async () => {
  try {
    setLoading(true);
    setError("");

    const data = await getSubscription();

    console.log(
      "SUBSCRIPTION API RESPONSE:",
      data
    );

    if (data?.success) {
      setSubscriptions(
        data.subscriptions || []
      );    
        setSummary(
            data.summary || {}
        );


    } else {
      setError(
        data?.message ||
        "Failed to load subscriptions."
      );
    }

  } catch (error) {
    console.error(
      "Error fetching subscriptions:",
      error
    );

    setError(
      error.response?.data?.message ||
      "Unable to load subscription data."
    );

  } finally {
    setLoading(false);
  }
};
  // Temporary values from your current API response.
  // We will replace these with live API data next.
//   const summary = {
//     totalSubscriptions: 18,
//     activeSubscriptions: 3,
//     trialSubscriptions: 15,
//     monthlySubscriptions: 3,
//     yearlySubscriptions: 0,
//     pastDueSubscriptions: 0,
//   };
const filteredSubscriptions = subscriptions.filter((record) => {

  const organization = record.organization;
  const subscription = record.subscription;

  // -----------------------------
  // SEARCH
  // -----------------------------

  const search = searchTerm
    .toLowerCase()
    .trim();

  const matchesSearch =
    !search ||
    organization?.name
      ?.toLowerCase()
      .includes(search) ||
    organization?.orgCode
      ?.toLowerCase()
      .includes(search);


  // -----------------------------
  // STATUS
  // -----------------------------

  const matchesStatus =
    statusFilter === "all" ||
    subscription?.status === statusFilter;


  // -----------------------------
  // PLAN
  // -----------------------------

  const matchesPlan =
    planFilter === "all" ||
    subscription?.tier === planFilter;


  // -----------------------------
  // BILLING
  // -----------------------------

  const matchesBilling =
    billingFilter === "all" ||
    subscription?.billingCycle === billingFilter;


  return (
    matchesSearch &&
    matchesStatus &&
    matchesPlan &&
    matchesBilling
  );
});
  return (
    <div className="subscriptions-page">
      {/* PAGE HEADER */}
      <div className="subscriptions-header">
        <div>
          <h2>Subscriptions</h2>

          <p>
            Monitor organization plans, billing cycles, subscription periods,
            payment information and subscription status.
          </p>
        </div>

        <div className="subscriptions-header-actions">
       <button
  className="subscriptions-secondary-btn"
  onClick={fetchSubscriptions}
  disabled={loading}
>
  {loading ? "Refreshing..." : "Refresh"}
</button>

          <button className="subscriptions-primary-btn">
            Export
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
<SubscriptionSummary summary={summary} />

      {/* FILTER BAR */}
      <div className="subscriptions-toolbar">
        <div className="subscriptions-search">
          <span className="subscriptions-search-icon">
            ⌕
          </span>

<input
  type="text"
  placeholder="Search organization or org code..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
        </div>

        <div className="subscriptions-filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past Due</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="all">All Plans</option>
            <option value="trial">Trial</option>
            <option value="base">Base</option>
            <option value="grow">Grow</option>
            <option value="omni">Omni</option>
          </select>

          <select
            value={billingFilter}
            onChange={(e) => setBillingFilter(e.target.value)}
          >
            <option value="all">All Billing</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* SUBSCRIPTION LIST AREA */}
      <div className="subscriptions-list-section">
        <div className="subscriptions-list-heading">
          <div>
            <h3>Organization Subscriptions</h3>

            <p>
              Current subscription status for each organization.
            </p>
          </div>

   <span>
  Showing {filteredSubscriptions.length} of{" "}
  {subscriptions.length} records
</span>
        </div>

        {/* We will add the horizontal organization cards here next */}
<div className="subscriptions-list">

  {loading && (
    <div className="subscriptions-state">
      Loading subscriptions...
    </div>
  )}

  {!loading && error && (
    <div className="subscriptions-state subscriptions-error">
      {error}
    </div>
  )}

  {!loading &&
    !error &&
    filteredSubscriptions.length === 0 && (
      <div className="subscriptions-state">
        No subscriptions found.
      </div>
    )}

  {!loading &&
    !error &&
    filteredSubscriptions.map((record) => (

      <SubscriptionOrganizationCard
        key={record.subscription?._id}
        data={record}
        onViewHistory={(record) => {
          console.log(
            "View subscription history:",
            record
          );
        }}
      />

    ))}

</div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;