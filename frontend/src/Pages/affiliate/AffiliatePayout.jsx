import React, {
  useEffect,
  useState,
} from "react";

import ThemeSwal from "../../utils/swalTheme";

import {
  getAffiliatePaymentCommissions,
  createAffiliatePaymentTicket,
  getAffiliatePaymentTickets,
} from "../../Services/AffiliateServices";
import "../../Page_styles/AffiliatePayout.css";
const formatTicketStatus = (status) => {

  switch (status) {

    case "pending":
      return "Requested";

    case "processing":
      return "Processing";

    case "paid":
      return "Paid";

    case "resolved":
      return "Resolved";

    case "rejected":
      return "Rejected";

    default:
      return status;
  }
};
const AffiliatePaymentTickets = () => {

  const [commissions, setCommissions] =
    useState([]);

    const [expandedTicket, setExpandedTicket] =
  useState(null);

  const [selectedIds, setSelectedIds] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);
  const [tickets, setTickets] =
  useState([]); 

  useEffect(() => {
    loadData();
  }, []);


const loadData = async () => {
  try {

    setLoading(true);

    const [
      commissionsRes,
      ticketsRes,
    ] = await Promise.all([
      getAffiliatePaymentCommissions(),
      getAffiliatePaymentTickets(),
    ]);

    setCommissions(
      commissionsRes.data?.data || []
    );

    setTickets(
      ticketsRes.data?.data || []
    );

  } catch (error) {

    console.error(error);

    ThemeSwal.fire({
      icon: "error",
      title: "Failed to load payment data",
    });

  } finally {

    setLoading(false);

  }
};


  const toggleCommission = (
    commissionId
  ) => {

    setSelectedIds((prev) => {

      if (
        prev.includes(commissionId)
      ) {
        return prev.filter(
          (id) =>
            id !== commissionId
        );
      }

      return [
        ...prev,
        commissionId,
      ];
    });
  };


  const selectedCommissions =
    commissions.filter(
      (commission) =>
        selectedIds.includes(
          commission._id
        )
    );


  const totalAmount =
    selectedCommissions.reduce(
      (total, commission) =>
        total +
        Number(
          commission.commissionAmount || 0
        ),
      0
    );


  const submitTicket = async () => {

    if (
      selectedIds.length === 0
    ) {
      ThemeSwal.fire({
        icon: "warning",
        title:
          "Select at least one commission",
      });

      return;
    }


    try {

      setSubmitting(true);

      await createAffiliatePaymentTicket({
        commissionIds:
          selectedIds,

        message,
      });
      


      ThemeSwal.fire({
        icon: "success",
        title:
          "Payment Ticket Raised",
        text:
          "Your payment request has been sent to the Super Admin.",
      });


      setSelectedIds([]);

      setMessage("");

      await loadData();

    } catch (error) {

      console.error(error);

      ThemeSwal.fire({
        icon: "error",
        title:
          "Unable to raise ticket",
        text:
          error.response?.data?.message ||
          "Something went wrong.",
      });

    } finally {

      setSubmitting(false);

    }
  };


  if (loading) {
    return (
      <div className="affiliate-payment-loading">
        Loading commissions...
      </div>
    );
  }


  return (
    <div className="affiliate-payment-page">

      <div className="affiliate-payment-header">

        <div>
          <h1>
            Affiliate Payments
          </h1>

          <p>
            Request payment for your
            earned affiliate commissions.
          </p>
        </div>

      </div>


      {/* =====================================
          SUMMARY
      ===================================== */}

      <div className="affiliate-payment-summary">

        <div className="payment-summary-card">

          <span>
            Available Commissions
          </span>

          <strong>
            {commissions.length}
          </strong>

        </div>


        <div className="payment-summary-card">

          <span>
            Selected Commissions
          </span>

          <strong>
            {selectedIds.length}
          </strong>

        </div>


        <div className="payment-summary-card">

          <span>
            Selected Amount
          </span>

          <strong>
            ${totalAmount.toFixed(2)}
          </strong>

        </div>

      </div>


      {/* =====================================
          COMMISSIONS
      ===================================== */}

      <div className="affiliate-payment-section">

        <div className="section-heading">

          <div>
            <h2>
              Available Commissions
            </h2>

            <p>
              Select the commissions you
              want to include in your
              payment request.
            </p>
          </div>

        </div>


        {commissions.length === 0 ? (

          <div className="empty-payment-state">
            <h3>
              No commissions available
            </h3>

            <p>
              There are currently no
              unpaid commissions available
              for payment.
            </p>
          </div>

        ) : (

          <div className="commission-list">

            {commissions.map(
              (commission) => {

                const selected =
                  selectedIds.includes(
                    commission._id
                  );

                return (

                  <div
                    key={commission._id}
                    className={`commission-card ${
                      selected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      toggleCommission(
                        commission._id
                      )
                    }
                  >

                    <div className="commission-check">

                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleCommission(
                            commission._id
                          )
                        }
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      />

                    </div>


                    <div className="commission-main">

                      <div className="commission-title">

                        <h3>
                          {commission
                            .organizationId
                            ?.name ||
                            "Organization"}
                        </h3>

                        <span>
                          {commission
                            .organizationId
                            ?.orgCode}
                        </span>

                      </div>


                      <div className="commission-meta">

                        <span>
                          {commission.planName}
                        </span>

                        <span>
                          {commission.billingCycle}
                        </span>

                        <span>
                          {commission
                            .commissionType ||
                            "Initial"}
                        </span>

                        <span>
                          {new Date(
                            commission.createdAt
                          ).toLocaleDateString()}
                        </span>

                      </div>

                    </div>


                    <div className="commission-payment">

                      <div>
                        <small>
                          Payment
                        </small>

                        <strong>
                          {commission
                            .paymentCurrency ||
                            "USD"}{" "}
                          {Number(
                            commission.paymentAmount ||
                            0
                          ).toFixed(2)}
                        </strong>
                      </div>


                      <div>
                        <small>
                          Rate
                        </small>

                        <strong>
                          {
                            commission
                              .commissionRate
                          }%
                        </strong>
                      </div>


                      <div className="commission-earned">

                        <small>
                          Commission
                        </small>

                        <strong>
                          {commission
                            .paymentCurrency ||
                            "USD"}{" "}
                          {Number(
                            commission.commissionAmount ||
                            0
                          ).toFixed(2)}
                        </strong>

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>


      {/* =====================================
          PAYMENT REQUEST
      ===================================== */}

      {selectedIds.length > 0 && (

        <div className="payment-request-section">

          <div className="request-header">

            <div>
              <h2>
                Payment Request
              </h2>

              <p>
                Review your selected
                commissions before raising
                the payment ticket.
              </p>
            </div>

            <div className="request-total">

              <span>
                Total
              </span>

              <strong>
                ${totalAmount.toFixed(2)}
              </strong>

            </div>

          </div>


          <div className="payout-method-display">

            <span>
              Payout Method
            </span>

            <strong>
              Your saved payout method
            </strong>

          </div>


          <div className="form-group">

            <label>
              Message
            </label>

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              placeholder="Add an optional message for the Super Admin..."
              rows={4}
            />

          </div>


          <button
            className="raise-ticket-btn"
            onClick={submitTicket}
            disabled={submitting}
          >
            {submitting
              ? "Raising Ticket..."
              : "Raise Payment Ticket"}
          </button>

        </div>

      )}

      {/* =====================================
    PAYMENT HISTORY
===================================== */}

<div className="affiliate-payment-section">

  <div className="section-heading">
    <div>
      <h2>Payment Request History</h2>

      <p>
        Track your previous affiliate
        payment requests.
      </p>
    </div>
  </div>

  {tickets.length === 0 ? (

    <div className="empty-payment-state">

      <h3>
        No payment requests yet
      </h3>

      <p>
        Your payment requests will
        appear here after you raise
        your first ticket.
      </p>

    </div>

  ) : (

    <div className="payment-ticket-list">

      {tickets.map((ticket) => (

        <React.Fragment key={ticket._id}>

          {/* ===============================
              TICKET CARD
          =============================== */}

          <div className="payment-ticket-card">

            <div className="ticket-main">

              <div className="ticket-title">

                <h3>
                  {ticket.ticketNumber}
                </h3>

                <span
                  className={`ticket-status ${ticket.status}`}
                >
                  {formatTicketStatus(ticket.status)}
                </span>

              </div>


              <div className="ticket-meta">

                <span>
                  {ticket.commissionIds?.length || 0}
                  {" "}
                  Commission
                  {ticket.commissionIds?.length === 1
                    ? ""
                    : "s"}
                </span>

                <span>
                  {new Date(
                    ticket.createdAt
                  ).toLocaleDateString()}
                </span>

                <span>
                  {ticket.payoutMethod
                    ? ticket.payoutMethod.toUpperCase()
                    : "N/A"}
                </span>

              </div>


              <button
                type="button"
                className="ticket-view-btn"
                onClick={() =>
                  setExpandedTicket(
                    expandedTicket === ticket._id
                      ? null
                      : ticket._id
                  )
                }
              >
                {expandedTicket === ticket._id
                  ? "Hide Details"
                  : "View Details"}
              </button>

            </div>


            <div className="ticket-amount">

              <small>
                Requested Amount
              </small>

              <strong>
                {ticket.currency || "USD"}{" "}
                {Number(
                  ticket.totalAmount || 0
                ).toFixed(2)}
              </strong>

            </div>

          </div>


          {/* ===============================
              EXPANDED COMMISSION DETAILS
          =============================== */}

          {expandedTicket === ticket._id && (

            <div className="ticket-commission-details">

              <div className="ticket-details-header">
                <h4>
                  Commission Details
                </h4>

                <span>
                  {ticket.commissionIds?.length || 0}{" "}
                  commission
                  {ticket.commissionIds?.length === 1
                    ? ""
                    : "s"}
                </span>
              </div>


              {ticket.commissionIds?.map(
                (commission) => (

                  <div
                    key={commission._id}
                    className="ticket-commission-row"
                  >

                    <div className="ticket-commission-plan">

                      <strong>
                        {commission.planName || "N/A"}
                      </strong>

                      <span>
                        {commission.billingCycle
                          ? commission.billingCycle
                              .charAt(0)
                              .toUpperCase() +
                            commission.billingCycle.slice(1)
                          : "N/A"}

                        {" • "}

                        {commission.commissionType
                          ? commission.commissionType
                              .replace("_", " ")
                              .replace(
                                /\b\w/g,
                                (char) =>
                                  char.toUpperCase()
                              )
                          : "Initial"}
                      </span>

                    </div>


                    <div className="ticket-detail-item">

                      <small>
                        Payment
                      </small>

                      <strong>
                        {commission.paymentCurrency || "USD"}{" "}
                        {Number(
                          commission.paymentAmount || 0
                        ).toFixed(2)}
                      </strong>

                    </div>


                    <div className="ticket-detail-item">

                      <small>
                        Rate
                      </small>

                      <strong>
                        {Number(
                          commission.commissionRate || 0
                        ).toFixed(2)}
                        %
                      </strong>

                    </div>


                    <div className="ticket-detail-item commission-value">

                      <small>
                        Commission
                      </small>

                      <strong>
                        {commission.paymentCurrency || "USD"}{" "}
                        {Number(
                          commission.commissionAmount || 0
                        ).toFixed(2)}
                      </strong>

                    </div>

                  </div>

                )
              )}


              {/* ===============================
                  TICKET MESSAGE
              =============================== */}

              {ticket.affiliateMessage && (

                <div className="ticket-message">

                  <small>
                    Your Message
                  </small>

                  <p>
                    {ticket.affiliateMessage}
                  </p>

                </div>

              )}


              {/* ===============================
                  ADMIN RESPONSE
              =============================== */}

              {ticket.adminNotes && (

                <div className="ticket-admin-notes">

                  <small>
                    Admin Notes
                  </small>

                  <p>
                    {ticket.adminNotes}
                  </p>

                </div>

              )}


              {/* ===============================
                  PAYMENT INFORMATION
              =============================== */}

              {ticket.status === "paid" ||
              ticket.status === "resolved" ? (

                <div className="ticket-payment-info">

                  {ticket.transactionId && (
                    <div>
                      <small>
                        Transaction ID
                      </small>

                      <strong>
                        {ticket.transactionId}
                      </strong>
                    </div>
                  )}

                  {ticket.paidAt && (
                    <div>
                      <small>
                        Paid On
                      </small>

                      <strong>
                        {new Date(
                          ticket.paidAt
                        ).toLocaleDateString()}
                      </strong>
                    </div>
                  )}

                </div>

              ) : null}

            </div>

          )}

        </React.Fragment>

      ))}

    </div>

  )}

</div>

    </div>
  );
};

export default AffiliatePaymentTickets;