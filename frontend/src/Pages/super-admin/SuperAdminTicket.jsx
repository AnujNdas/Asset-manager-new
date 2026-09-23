import React, {
  useEffect,
  useState,
} from "react";

import ThemeSwal from "../../utils/swalTheme";

import {
  getAffiliatePaymentTicketsForAdmin,
  getAffiliatePaymentTicketById,
  processAffiliatePaymentTicket,
  resolveAffiliatePaymentTicket,
  rejectAffiliatePaymentTicket,
} from "../../Services/AdminServices";

import "../../Page_styles/SuperAdminTicket.css";


const SuperAdminTickets = () => {

  const [activeTab, setActiveTab] =
    useState("support");

  /* ==========================================
     SUPPORT TICKETS
  ========================================== */

  const [tickets, setTickets] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedStatus, setSelectedStatus] =
    useState("All");

  const [search, setSearch] =
    useState("");


  /* ==========================================
     AFFILIATE PAYMENT TICKETS
  ========================================== */

  const [
    paymentTickets,
    setPaymentTickets
  ] = useState([]);

  const [
    paymentLoading,
    setPaymentLoading
  ] = useState(false);

  const [
    selectedPaymentStatus,
    setSelectedPaymentStatus
  ] = useState("All");

  const [
    paymentSearch,
    setPaymentSearch
  ] = useState("");

  const [
    selectedPaymentTicket,
    setSelectedPaymentTicket
  ] = useState(null);

  const [
    paymentDetailsLoading,
    setPaymentDetailsLoading
  ] = useState(false);

  const [
    processing,
    setProcessing
  ] = useState(false);

  const [
    adminNotes,
    setAdminNotes
  ] = useState("");

  const [
    transactionId,
    setTransactionId
  ] = useState("");


  /* ==========================================
     INITIAL LOAD
  ========================================== */

  useEffect(() => {

    if (activeTab === "support") {
      fetchTickets();
    }

    if (activeTab === "affiliate-payment") {
      fetchPaymentTickets();
    }

  }, [activeTab]);


  /* ==========================================
     EXISTING SUPPORT TICKETS
  ========================================== */

  const fetchTickets = async () => {

    try {

      setLoading(true);

      // Keep your existing API call here.
      // For now your existing mock data can remain.

      const mock = [
        {
          _id: "1",
          subject: "Laptop not working",
          issueType: "Hardware",
          description:
            "Device not powering on",
          status: "Open",
          priority: "High",
          user: "Anuj",
          createdAt: new Date(),
        },
        {
          _id: "2",
          subject: "Login issue",
          issueType: "Account",
          description:
            "Cannot login to dashboard",
          status: "Resolved",
          priority: "Medium",
          user: "Rahul",
          createdAt: new Date(),
        },
      ];

      setTickets(mock);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  };


  /* ==========================================
     AFFILIATE PAYMENT TICKETS
  ========================================== */

  const fetchPaymentTickets =
    async () => {

      try {

        setPaymentLoading(true);

        const response =
          await getAffiliatePaymentTicketsForAdmin();

        setPaymentTickets(
          response.data?.data || []
        );

      } catch (error) {

        console.error(
          "Failed to load payment tickets:",
          error
        );

        ThemeSwal.fire({
          icon: "error",
          title: "Failed to load payment tickets",
          text:
            error.response?.data?.message ||
            "Unable to fetch affiliate payment tickets.",
        });

      } finally {

        setPaymentLoading(false);

      }
    };


  /* ==========================================
     GET PAYMENT TICKET DETAILS
  ========================================== */

  const openPaymentTicket =
    async (ticketId) => {

      try {

        setPaymentDetailsLoading(true);

        const response =
          await getAffiliatePaymentTicketById(
            ticketId
          );

        setSelectedPaymentTicket(
          response.data?.data || null
        );

      } catch (error) {

        console.error(error);

        ThemeSwal.fire({
          icon: "error",
          title: "Failed to load ticket",
          text:
            error.response?.data?.message ||
            "Unable to load payment ticket details.",
        });

      } finally {

        setPaymentDetailsLoading(false);

      }
    };


  /* ==========================================
     PROCESS
  ========================================== */

  const handleProcess =
    async () => {

      if (!selectedPaymentTicket) {
        return;
      }

      try {

        setProcessing(true);

        const response =
          await processAffiliatePaymentTicket(
            selectedPaymentTicket._id,
            {
              adminNotes,
            }
          );

        ThemeSwal.fire({
          icon: "success",
          title: "Ticket Processing",
          text:
            response.data?.message ||
            "Payment ticket moved to processing.",
        });

        setAdminNotes("");

        await fetchPaymentTickets();

        await openPaymentTicket(
          selectedPaymentTicket._id
        );

      } catch (error) {

        console.error(error);

        ThemeSwal.fire({
          icon: "error",
          title: "Unable to process ticket",
          text:
            error.response?.data?.message ||
            "Something went wrong.",
        });

      } finally {

        setProcessing(false);

      }
    };


  /* ==========================================
     RESOLVE
  ========================================== */

  const handleResolve =
    async () => {

      if (!selectedPaymentTicket) {
        return;
      }

      if (!transactionId.trim()) {

        ThemeSwal.fire({
          icon: "warning",
          title: "Transaction ID required",
          text:
            "Enter the offline payment transaction ID before resolving the ticket.",
        });

        return;
      }

      const confirmation =
        await ThemeSwal.fire({
          icon: "question",
          title: "Resolve Payment Ticket?",
          text:
            "This will mark the affiliate payment request as paid.",
          showCancelButton: true,
          confirmButtonText: "Yes, Resolve",
          cancelButtonText: "Cancel",
        });

      if (!confirmation.isConfirmed) {
        return;
      }

      try {

        setProcessing(true);

        const response =
          await resolveAffiliatePaymentTicket(
            selectedPaymentTicket._id,
            {
              transactionId:
                transactionId.trim(),

              adminNotes,
            }
          );

        ThemeSwal.fire({
          icon: "success",
          title: "Payment Resolved",
          text:
            response.data?.message ||
            "Affiliate payment has been marked as paid.",
        });

        setTransactionId("");
        setAdminNotes("");

        await fetchPaymentTickets();

        setSelectedPaymentTicket(null);

      } catch (error) {

        console.error(error);

        ThemeSwal.fire({
          icon: "error",
          title: "Unable to resolve payment",
          text:
            error.response?.data?.message ||
            "Something went wrong.",
        });

      } finally {

        setProcessing(false);

      }
    };


  /* ==========================================
     REJECT
  ========================================== */

  const handleReject =
    async () => {

      if (!selectedPaymentTicket) {
        return;
      }

      if (!adminNotes.trim()) {

        ThemeSwal.fire({
          icon: "warning",
          title: "Reason required",
          text:
            "Please provide a reason before rejecting this payment request.",
        });

        return;
      }

      const confirmation =
        await ThemeSwal.fire({
          icon: "warning",
          title: "Reject Payment Ticket?",
          text:
            "The affiliate payment request will be rejected.",
          showCancelButton: true,
          confirmButtonText: "Reject Ticket",
          cancelButtonText: "Cancel",
        });

      if (!confirmation.isConfirmed) {
        return;
      }

      try {

        setProcessing(true);

        const response =
          await rejectAffiliatePaymentTicket(
            selectedPaymentTicket._id,
            {
              adminNotes,
            }
          );

        ThemeSwal.fire({
          icon: "success",
          title: "Ticket Rejected",
          text:
            response.data?.message ||
            "Payment ticket has been rejected.",
        });

        setAdminNotes("");

        await fetchPaymentTickets();

        setSelectedPaymentTicket(null);

      } catch (error) {

        console.error(error);

        ThemeSwal.fire({
          icon: "error",
          title: "Unable to reject ticket",
          text:
            error.response?.data?.message ||
            "Something went wrong.",
        });

      } finally {

        setProcessing(false);

      }
    };


  /* ==========================================
     SUPPORT FILTER
  ========================================== */

  const filteredTickets =
    tickets.filter((ticket) => {

      const statusMatch =
        selectedStatus === "All" ||
        ticket.status === selectedStatus;

      const searchText =
        search.toLowerCase();

      const searchMatch =
        ticket.subject
          .toLowerCase()
          .includes(searchText) ||
        ticket.issueType
          .toLowerCase()
          .includes(searchText);

      return (
        statusMatch &&
        searchMatch
      );

    });


  /* ==========================================
     PAYMENT FILTER
  ========================================== */

  const filteredPaymentTickets =
    paymentTickets.filter((ticket) => {

      const statusMatch =
        selectedPaymentStatus === "All" ||
        ticket.status === selectedPaymentStatus;

      const searchText =
        paymentSearch.toLowerCase();

      const affiliate =
        ticket.affiliateCode ||
        ticket.affiliateId?.affiliateCode ||
        "";

      const ticketNumber =
        ticket.ticketNumber || "";

      const searchMatch =
        affiliate
          .toLowerCase()
          .includes(searchText) ||
        ticketNumber
          .toLowerCase()
          .includes(searchText);

      return (
        statusMatch &&
        searchMatch
      );

    });


  /* ==========================================
     STATUS FORMAT
  ========================================== */

  const formatStatus =
    (status) => {

      if (!status) {
        return "";
      }

      return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        );
    };


  /* ==========================================
     RENDER
  ========================================== */

  return (
    <div className="sa-ticket-container">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="sa-ticket-header">

        <div>

          <h2>
            Ticket Management
          </h2>

          <p>
            Manage support requests and
            affiliate payment requests.
          </p>

        </div>

      </div>


      {/* ======================================
          TABS
      ====================================== */}

      <div className="sa-ticket-tabs">

        <button
          className={
            activeTab === "support"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("support")
          }
        >
          Support Tickets
        </button>

        <button
          className={
            activeTab ===
            "affiliate-payment"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "affiliate-payment"
            )
          }
        >
          Affiliate Payments

          {paymentTickets.filter(
            (ticket) =>
              ticket.status ===
                "pending" ||
              ticket.status ===
                "processing"
          ).length > 0 && (
            <span className="sa-ticket-count">
              {
                paymentTickets.filter(
                  (ticket) =>
                    ticket.status ===
                      "pending" ||
                    ticket.status ===
                      "processing"
                ).length
              }
            </span>
          )}

        </button>

      </div>


      {/* ======================================
          SUPPORT TAB
      ====================================== */}

      {activeTab === "support" && (

        <>

          <div className="sa-ticket-filters">

            <input
              type="text"
              placeholder="Search by subject or issue type..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Status
              </option>

              <option value="Open">
                Open
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Resolved">
                Resolved
              </option>

            </select>

          </div>


          {loading ? (

            <p className="sa-loading">
              Loading tickets...
            </p>

          ) : (

            <div className="sa-ticket-table-wrapper">

              <table className="sa-ticket-table">

                <thead>

                  <tr>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>User</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredTickets.length === 0 ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="sa-empty"
                      >
                        No tickets found
                      </td>

                    </tr>

                  ) : (

                    filteredTickets.map(
                      (ticket) => (

                        <tr key={ticket._id}>

                          <td>
                            {ticket.subject}
                          </td>

                          <td>
                            {ticket.issueType}
                          </td>

                          <td>
                            {ticket.user}
                          </td>

                          <td>

                            <span
                              className={`priority ${ticket.priority.toLowerCase()}`}
                            >
                              {ticket.priority}
                            </span>

                          </td>

                          <td>

                            <span
                              className={`status ${ticket.status
                                .toLowerCase()
                                .replace(
                                  " ",
                                  "-"
                                )}`}
                            >
                              {ticket.status}
                            </span>

                          </td>

                          <td>
                            {new Date(
                              ticket.createdAt
                            ).toLocaleDateString()}
                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          )}

        </>

      )}


      {/* ======================================
          AFFILIATE PAYMENT TAB
      ====================================== */}

      {activeTab ===
        "affiliate-payment" && (

        <>

          <div className="sa-payment-filters">

            <input
              type="text"
              placeholder="Search affiliate or ticket number..."
              value={paymentSearch}
              onChange={(e) =>
                setPaymentSearch(
                  e.target.value
                )
              }
            />

            <select
              value={
                selectedPaymentStatus
              }
              onChange={(e) =>
                setSelectedPaymentStatus(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="processing">
                Processing
              </option>

              <option value="paid">
                Paid
              </option>

              <option value="resolved">
                Resolved
              </option>

              <option value="rejected">
                Rejected
              </option>

            </select>

          </div>


          {paymentLoading ? (

            <p className="sa-loading">
              Loading affiliate payment tickets...
            </p>

          ) : (

            <div className="sa-payment-ticket-list">

              {filteredPaymentTickets.length === 0 ? (

                <div className="sa-empty-payment">

                  <h3>
                    No payment tickets found
                  </h3>

                  <p>
                    Affiliate payment requests
                    will appear here.
                  </p>

                </div>

              ) : (

                filteredPaymentTickets.map(
                  (ticket) => (

                    <div
                      key={ticket._id}
                      className="sa-payment-ticket-card"
                    >

                      <div className="sa-payment-ticket-main">

                        <div className="sa-payment-ticket-title">

                          <h3>
                            {ticket.ticketNumber}
                          </h3>

                          <span
                            className={`sa-payment-status ${ticket.status}`}
                          >
                            {formatStatus(
                              ticket.status
                            )}
                          </span>

                        </div>


                        <div className="sa-payment-ticket-meta">

                          <span>
                            Affiliate:{" "}
                            <strong>
                              {ticket.affiliateCode ||
                                ticket.affiliateId
                                  ?.affiliateCode ||
                                "N/A"}
                            </strong>
                          </span>

                          <span>
                            {
                              ticket.commissionIds
                                ?.length || 0
                            }{" "}
                            Commission
                            {
                              ticket.commissionIds
                                ?.length === 1
                                ? ""
                                : "s"
                            }
                          </span>

                          <span>
                            {ticket.payoutMethod?.toUpperCase()}
                          </span>

                          <span>
                            {new Date(
                              ticket.createdAt
                            ).toLocaleDateString()}
                          </span>

                        </div>

                        <button
                          className="sa-view-payment-btn"
                          onClick={() =>
                            openPaymentTicket(
                              ticket._id
                            )
                          }
                        >
                          View Details
                        </button>

                      </div>


                      <div className="sa-payment-ticket-amount">

                        <small>
                          Requested Amount
                        </small>

                        <strong>
                          {ticket.currency ||
                            "USD"}{" "}
                          {Number(
                            ticket.totalAmount ||
                              0
                          ).toFixed(2)}
                        </strong>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          )}

        </>

      )}


      {/* ======================================
          PAYMENT TICKET DETAILS
      ====================================== */}

      {selectedPaymentTicket && (

        <div className="sa-payment-modal-overlay">

          <div className="sa-payment-modal">

            <div className="sa-payment-modal-header">

              <div>

                <h2>
                  Payment Ticket
                </h2>

                <p>
                  {selectedPaymentTicket.ticketNumber}
                </p>

              </div>

              <button
                className="sa-payment-close"
                onClick={() =>
                  setSelectedPaymentTicket(
                    null
                  )
                }
              >
                ×
              </button>

            </div>


            {paymentDetailsLoading ? (

              <div className="sa-payment-modal-loading">
                Loading details...
              </div>

            ) : (

              <>

                {/* AFFILIATE */}

                <div className="sa-payment-detail-section">

                  <h3>
                    Affiliate Information
                  </h3>

                  <div className="sa-payment-detail-grid">

                    <div>
                      <small>
                        Affiliate
                      </small>

                      <strong>
                        {
                          selectedPaymentTicket
                            .affiliateId
                            ?.fullName ||
                          selectedPaymentTicket
                            .affiliateCode ||
                          "N/A"
                        }
                      </strong>
                    </div>

                    <div>
                      <small>
                        Code
                      </small>

                      <strong>
                        {
                          selectedPaymentTicket
                            .affiliateCode
                        }
                      </strong>
                    </div>

                    <div>
                      <small>
                        Email
                      </small>

                      <strong>
                        {
                          selectedPaymentTicket
                            .affiliateId
                            ?.email ||
                          "N/A"
                        }
                      </strong>
                    </div>

                    <div>
                      <small>
                        Payout Method
                      </small>

                      <strong>
                        {selectedPaymentTicket
                          .payoutMethod
                          ?.toUpperCase()}
                      </strong>
                    </div>

                  </div>

                </div>


                {/* PAYOUT DETAILS */}

                <div className="sa-payment-detail-section">

                  <h3>
                    Payout Details
                  </h3>

                  <div className="sa-payout-box">

                    {selectedPaymentTicket
                      .payoutMethod ===
                      "upi" && (

                      <div>
                        <small>
                          UPI ID
                        </small>

                        <strong>
                          {
                            selectedPaymentTicket
                              .payoutDetails
                              ?.upiId ||
                            "Not provided"
                          }
                        </strong>
                      </div>

                    )}

                    {selectedPaymentTicket
                      .payoutMethod ===
                      "bank" && (

                      <>

                        <div>
                          <small>
                            Account Name
                          </small>

                          <strong>
                            {
                              selectedPaymentTicket
                                .payoutDetails
                                ?.accountName ||
                              "Not provided"
                            }
                          </strong>
                        </div>

                        <div>
                          <small>
                            Account Number
                          </small>

                          <strong>
                            {
                              selectedPaymentTicket
                                .payoutDetails
                                ?.accountNumber ||
                              "Not provided"
                            }
                          </strong>
                        </div>

                        <div>
                          <small>
                            IFSC
                          </small>

                          <strong>
                            {
                              selectedPaymentTicket
                                .payoutDetails
                                ?.ifscCode ||
                              "Not provided"
                            }
                          </strong>
                        </div>

                      </>

                    )}

                    {selectedPaymentTicket
                      .payoutMethod ===
                      "paypal" && (

                      <div>
                        <small>
                          PayPal Email
                        </small>

                        <strong>
                          {
                            selectedPaymentTicket
                              .payoutDetails
                              ?.paypalEmail ||
                            "Not provided"
                          }
                        </strong>
                      </div>

                    )}

                  </div>

                </div>


                {/* COMMISSIONS */}

                <div className="sa-payment-detail-section">

                  <h3>
                    Commission Summary
                  </h3>

                  <div className="sa-commission-table">

                    {selectedPaymentTicket
                      .commissionIds
                      ?.map(
                        (commission) => (

                          <div
                            key={
                              commission._id
                            }
                            className="sa-commission-row"
                          >

                            <div>

                              <strong>
                                {
                                  commission
                                    .planName
                                }
                              </strong>

                              <span>
                                {
                                  commission
                                    .billingCycle
                                }{" "}
                                •{" "}
                                {
                                  commission
                                    .commissionType
                                }
                              </span>

                            </div>

                            <div>
                              {
                                commission
                                  .commissionRate
                              }%
                            </div>

                            <div>
                              {
                                commission
                                  .paymentCurrency
                              }{" "}
                              {Number(
                                commission
                                  .commissionAmount ||
                                  0
                              ).toFixed(2)}
                            </div>

                          </div>

                        )
                      )}

                  </div>

                  <div className="sa-payment-total">

                    <span>
                      Total Payment
                    </span>

                    <strong>
                      {
                        selectedPaymentTicket
                          .currency ||
                        "USD"
                      }{" "}
                      {Number(
                        selectedPaymentTicket
                          .totalAmount ||
                          0
                      ).toFixed(2)}
                    </strong>

                  </div>

                </div>


                {/* AFFILIATE MESSAGE */}

                {selectedPaymentTicket
                  .affiliateMessage && (

                  <div className="sa-payment-detail-section">

                    <h3>
                      Affiliate Message
                    </h3>

                    <p className="sa-affiliate-message">
                      {
                        selectedPaymentTicket
                          .affiliateMessage
                      }
                    </p>

                  </div>

                )}


                {/* ADMIN PROCESSING */}

                {selectedPaymentTicket.status !==
                  "paid" &&
                  selectedPaymentTicket.status !==
                    "resolved" &&
                  selectedPaymentTicket.status !==
                    "rejected" && (

                  <div className="sa-payment-detail-section">

                    <h3>
                      Admin Processing
                    </h3>

                    <textarea
                      value={adminNotes}
                      onChange={(e) =>
                        setAdminNotes(
                          e.target.value
                        )
                      }
                      placeholder="Add internal notes..."
                      rows={4}
                    />


                    {selectedPaymentTicket.status ===
                      "pending" && (

                      <button
                        className="sa-process-btn"
                        disabled={processing}
                        onClick={
                          handleProcess
                        }
                      >
                        {processing
                          ? "Processing..."
                          : "Mark as Processing"}
                      </button>

                    )}


                    <div className="sa-payment-action-row">

                      <div>

                        <label>
                          Transaction ID
                        </label>

                        <input
                          value={
                            transactionId
                          }
                          onChange={(e) =>
                            setTransactionId(
                              e.target.value
                            )
                          }
                          placeholder="Enter offline payment transaction ID"
                        />

                      </div>

                    </div>


                    <div className="sa-payment-action-buttons">

                      <button
                        className="sa-reject-btn"
                        disabled={processing}
                        onClick={
                          handleReject
                        }
                      >
                        Reject
                      </button>

                      <button
                        className="sa-resolve-btn"
                        disabled={processing}
                        onClick={
                          handleResolve
                        }
                      >
                        {processing
                          ? "Resolving..."
                          : "Mark as Paid & Resolve"}
                      </button>

                    </div>

                  </div>

                )}


                {/* COMPLETED PAYMENT */}

                {(selectedPaymentTicket.status ===
                  "paid" ||
                  selectedPaymentTicket.status ===
                    "resolved") && (

                  <div className="sa-payment-completed">

                    <h3>
                      Payment Completed
                    </h3>

                    <p>
                      Transaction ID:{" "}
                      <strong>
                        {
                          selectedPaymentTicket
                            .transactionId ||
                          "Not recorded"
                        }
                      </strong>
                    </p>

                    {selectedPaymentTicket.paidAt && (
                      <p>
                        Paid on:{" "}
                        {new Date(
                          selectedPaymentTicket
                            .paidAt
                        ).toLocaleString()}
                      </p>
                    )}

                  </div>

                )}

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
};

export default SuperAdminTickets;