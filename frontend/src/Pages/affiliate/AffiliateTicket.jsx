import React, {
  useEffect,
  useState,
} from "react";

import ThemeSwal from "../../utils/SwalTheme";

import {
  getAffiliateTickets,
  createAffiliateTicket,
} from "../../Services/AffiliateServices";

const AffiliateTicketPage = () => {

  const [tickets, setTickets] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [formData, setFormData] =
    useState({
      subject: "",
      category: "other",
      priority: "medium",
      description: "",
    });

  const loadTickets = async () => {
    try {
      const res =
        await getAffiliateTickets();

      setTickets(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket =
    async () => {

      try {

        await createAffiliateTicket(
          formData
        );

        ThemeSwal.fire({
          icon: "success",
          title:
            "Ticket Created Successfully",
        });

        setShowModal(false);

        setFormData({
          subject: "",
          category: "other",
          priority: "medium",
          description: "",
        });

        loadTickets();

      } catch (err) {

        ThemeSwal.fire({
          icon: "error",
          title:
            "Failed to Create Ticket",
        });

      }
    };

  return (
    <div className="affiliate-settings-card">

      <div className="ticket-header">

        <div>

          <h2>Support Tickets</h2>

          <p>
            Contact support regarding
            commissions, payouts,
            referrals or technical issues.
          </p>

        </div>

        <button
          className="save-settings-btn"
          onClick={() =>
            setShowModal(true)
          }
        >
          + Create Ticket
        </button>

      </div>

      <div className="ticket-table-wrapper">

        <table className="ticket-table">

          <thead>

            <tr>
              <th>Ticket</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
            </tr>

          </thead>

          <tbody>

            {tickets.length > 0 ? (

              tickets.map((ticket) => (

                <tr key={ticket._id}>

                  <td>
                    {ticket.ticketNumber}
                  </td>

                  <td>
                    {ticket.subject}
                  </td>

                  <td>
                    {ticket.category}
                  </td>

                  <td>
                    <span
                      className={`priority-badge ${ticket.priority}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${ticket.status}`}
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

              ))

            ) : (

              <tr>

                <td colSpan="6">

                  <div className="empty-state">
                    No support tickets found
                  </div>

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* CREATE MODAL */}

      {showModal && (

        <div className="ticket-modal-overlay">

          <div className="ticket-modal">

            <h3>Create Ticket</h3>

            <input
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  subject:
                    e.target.value,
                })
              }
            />

            <select
              value={
                formData.category
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category:
                    e.target.value,
                })
              }
            >
              <option value="commission">
                Commission
              </option>

              <option value="payout">
                Payout
              </option>

              <option value="technical">
                Technical
              </option>

              <option value="account">
                Account
              </option>

              <option value="referral">
                Referral
              </option>

              <option value="other">
                Other
              </option>
            </select>

            <select
              value={
                formData.priority
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority:
                    e.target.value,
                })
              }
            >
              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>

              <option value="urgent">
                Urgent
              </option>
            </select>

            <textarea
              rows={6}
              placeholder="Describe your issue..."
              value={
                formData.description
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description:
                    e.target.value,
                })
              }
            />

            <div className="ticket-modal-actions">

              <button
                onClick={() =>
                  setShowModal(false)
                }
              >
                Cancel
              </button>

              <button
                className="save-settings-btn"
                onClick={
                  handleCreateTicket
                }
              >
                Submit Ticket
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default AffiliateTicketPage;