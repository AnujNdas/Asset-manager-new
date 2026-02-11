// SuperAdminTickets.jsx
import React, { useEffect, useState } from "react";
import "../../Page_styles/SuperAdminTicket.css";

const SuperAdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [search, setSearch] = useState("");

  // TODO: Replace with real API call
  const fetchTickets = async () => {
    try {
      setLoading(true);

      // Mock Data (Replace with API)
      const mock = [
        {
          _id: "1",
          subject: "Laptop not working",
          issueType: "Hardware",
          description: "Device not powering on",
          status: "Open",
          priority: "High",
          user: "Anuj",
          createdAt: new Date()
        },
        {
          _id: "2",
          subject: "Login issue",
          issueType: "Account",
          description: "Cannot login to dashboard",
          status: "Resolved",
          priority: "Medium",
          user: "Rahul",
          createdAt: new Date()
        }
      ];

      setTickets(mock);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    const statusMatch =
      selectedStatus === "All" || t.status === selectedStatus;

    const searchMatch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.issueType.toLowerCase().includes(search.toLowerCase());

    return statusMatch && searchMatch;
  });

  return (
    <div className="sa-ticket-container">
      <div className="sa-ticket-header">
        <h2>Support Tickets Management</h2>
      </div>

      {/* Filters */}
      <div className="sa-ticket-filters">
        <input
          type="text"
          placeholder="Search by subject or issue type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="sa-loading">Loading tickets...</p>
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
                  <td colSpan="6" className="sa-empty">
                    No tickets found
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t._id}>
                    <td>{t.subject}</td>
                    <td>{t.issueType}</td>
                    <td>{t.user}</td>
                    <td>
                      <span className={`priority ${t.priority.toLowerCase()}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${t.status.toLowerCase().replace(" ", "-")}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SuperAdminTickets;


