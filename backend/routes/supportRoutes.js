import React, { useEffect, useState } from "react";
import "../Page_styles/HelpSupport.css";
import {
  createSupportTicket,
  getMySupportTickets
} from "../Services/ApiServices";

/* ---------- MODAL ---------- */
const Modal = ({ title, onClose, children }) => (
  <div className="modal-backdrop">
    <div className="modal-box">
      <div className="modal-header">
        <h3>{title}</h3>
        <button onClick={onClose}>✕</button>
      </div>
      <div className="modal-content">{children}</div>
    </div>
  </div>
);

/* ---------- MODAL CONTENT ---------- */
const FAQContent = () => (
  <ul className="faq-list">
    <li><strong>Add Asset:</strong> Assets → Add Asset</li>
    <li><strong>Edit Asset:</strong> Open asset → Edit</li>
    <li><strong>Raise Ticket:</strong> Help → Raise Ticket</li>
  </ul>
);

const DocsContent = () => (
  <ol className="docs-list">
    <li>Create hardware/software assets</li>
    <li>Assign assets to users or units</li>
    <li>Track asset lifecycle</li>
    <li>Raise tickets for issues</li>
  </ol>
);

const ContactSupportForm = () => (
  <form className="help-form">
    <input placeholder="Your Email" />
    <textarea placeholder="Message to support team" />
    <button>Send Message</button>
  </form>
);

/* ---------- MAIN COMPONENT ---------- */
const HelpSupport = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    subject: "",
    issueType: "",
    description: "",
  });

  const loadMyTickets = async () => {
    const res = await getMySupportTickets();
    setTickets(res.data || []);
  };

  useEffect(() => {
    loadMyTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createSupportTicket(formData);
    setActiveModal(null);
    loadMyTickets();
  };

  return (
    <div className="help-container">
      <header className="help-header">
        <h1>Help & Support</h1>
        <p>Centralized support for asset management</p>
      </header>

      {/* ACTION CARDS */}
      <section className="help-cards">
        <div className="help-card" onClick={() => setActiveModal("faq")}>FAQs</div>
        <div className="help-card" onClick={() => setActiveModal("docs")}>Documentation</div>
        <div className="help-card" onClick={() => setActiveModal("ticket")}>Raise Ticket</div>
        <div className="help-card" onClick={() => setActiveModal("contact")}>Contact Support</div>
      </section>

      {/* MY TICKETS */}
      <section className="my-tickets">
        <h2>My Tickets</h2>
        {tickets.length === 0 ? (
          <p>No tickets found</p>
        ) : (
          <ul className="ticket-list">
            {tickets.map(t => (
              <li key={t._id}>
                <strong>{t.subject}</strong> — {t.status}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* MODALS */}
      {activeModal && (
        <Modal
          title={
            activeModal === "faq" ? "FAQs" :
            activeModal === "docs" ? "Documentation" :
            activeModal === "ticket" ? "Raise Ticket" :
            "Contact Support"
          }
          onClose={() => setActiveModal(null)}
        >
          {activeModal === "faq" && <FAQContent />}
          {activeModal === "docs" && <DocsContent />}
          {activeModal === "contact" && <ContactSupportForm />}

          {activeModal === "ticket" && (
            <form className="help-form" onSubmit={handleSubmit}>
              <input
                placeholder="Subject"
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
              />
              <select
                onChange={e => setFormData({ ...formData, issueType: e.target.value })}
              >
                <option value="">Issue Type</option>
                <option>Hardware</option>
                <option>Software</option>
                <option>Account</option>
              </select>
              <textarea
                placeholder="Describe issue"
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
              <button>Submit Ticket</button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default HelpSupport;
