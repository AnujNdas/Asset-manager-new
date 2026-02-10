import { useEffect, useState } from "react";
import "../Page_styles/Ticket.css";
import {
  getAllSupportTickets,
  updateSupportTicket
} from "../Services/ApiServices";

const OrgAdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("Open");
  const [remark, setRemark] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await getAllSupportTickets();
      setTickets(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openTicket = (ticket) => {
    setSelected(ticket);
    setStatus(ticket.status);
    setRemark(ticket.adminRemark || "");
  };

  const handleUpdateTicket = async () => {
    try {
      await updateSupportTicket(selected._id, {
        status,
        adminRemark: remark
      });

      await fetchTickets();
      setSelected(null);
    } catch (err) {
      console.error("Update ticket failed:", err);
    }
  };

  if (loading) return <p className="loading">Loading tickets...</p>;

  return (
    <div className="ticket-admin-container">
      <h2>Organization Support Tickets</h2>

      <div className="ticket-grid">
        {tickets.map((t) => (
          <div
            key={t._id}
            className={`ticket-card ${t.status.toLowerCase()}`}
            onClick={() => openTicket(t)}
          >
            <h4>{t.subject}</h4>
            <p className="issue">{t.issueType}</p>
            <span className={`badge ${t.status.toLowerCase()}`}>
              {t.status}
            </span>
            <p className="date">
              {new Date(t.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {selected && (
        <div className="ticket-modal">
          <div className="modal-content">
            <h3>{selected.subject}</h3>

            <p>
              <strong>User:</strong>{" "}
              {selected.userId?.username || "Unknown"}
            </p>

            <p>{selected.description}</p>

            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>

            <label>Admin Remark</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />

            <div className="actions">
              <button
                onClick={handleUpdateTicket}
                className="btn-save"
              >
                Save
              </button>

              <button
                onClick={() => setSelected(null)}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgAdminTickets;
