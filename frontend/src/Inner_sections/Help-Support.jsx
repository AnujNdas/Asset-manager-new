import React, { useEffect, useState } from "react";
import "../Page_styles/HelpSupport.css";
import {
  createSupportTicket,
  getMySupportTickets
} from "../Services/ApiServices";

const HelpSupport = () => {
  const [activeTab, setActiveTab] = useState("faqs");
  const [openIndex, setOpenIndex] = useState(null);

  const [formData, setFormData] = useState({
    subject: "",
    issueType: "",
    description: ""
  });

  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* FAQ DATA */
  const faqs = [
    {
      question: "How do I raise a support ticket?",
      answer: "Go to the 'Raise Ticket' tab, fill out the form and submit."
    },
    {
      question: "How long does support take to respond?",
      answer: "Our team usually responds within 24–48 hours."
    },
    {
      question: "Can I track my ticket status?",
      answer: "Yes, all submitted tickets appear under 'My Support Tickets'."
    }
  ];

  /* DOCUMENTATION DATA */
  const docs = [
    {
      title: "How to add a new asset",
      steps: [
        "Go to Assets page",    
        "Click Add Asset",
        "Fill asset details",
        "Navigated to the inventory"
      ]
    },
    {
      title: "How to assign assets",
      steps: [
        "Select an asset",
        "Click Assign",
        "Choose employee",
        "Confirm assignment"
      ]
    },
    {
      title: "How to add classifications",
      steps: [
        "Go to Classifications tab",
        "Select Add From Search Dropdown",
        "Type the Name",
        "Click Enter"
      ]
    },
    {
      title: "How to add a user (only Admin)",
      steps: [
        "Go to Team Invite Under Settings",
        "Click on Generate Invite Link",
        "Share it to the user",
        "Ask Them to signup Through the link"
      ]
    },
    {
      title: "How to import multiple assets via excel",
      steps: [
        "Go to Import Page under AssetCapture",
        "Select the asset type from Dropdown",
        "Read the Instructions Carefully",
        "Check the format of excel sheet",
        "click Import and upload the file"
      ]
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  /* SUBMIT TICKET */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.subject || !formData.issueType || !formData.description) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      await createSupportTicket(formData);
      setMessage("Support ticket submitted successfully.");
      setFormData({ subject: "", issueType: "", description: "" });
      loadMyTickets();
    } catch (err) {
      setError("Failed to submit ticket.");
    } finally {
      setLoading(false);
    }
  };

  /* LOAD TICKETS */
  const loadMyTickets = async () => {
    try {
      const res = await getMySupportTickets();
      setTickets(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMyTickets();
  }, []);

  return (
    <div className="help-container">
      <header className="help-header">
        <h1>Help & Support</h1>
        <p>Find answers, guides, and contact support.</p>
      </header>

      {/* NAV TABS */}
      <nav className="help-nav">
        <button onClick={() => setActiveTab("faqs")} className={activeTab === "faqs" ? "active" : ""}>FAQs</button>
        <button onClick={() => setActiveTab("docs")} className={activeTab === "docs" ? "active" : ""}>Documentation</button>
        <button onClick={() => setActiveTab("ticket")} className={activeTab === "ticket" ? "active" : ""}>Raise Ticket</button>
        <button onClick={() => setActiveTab("contact")} className={activeTab === "contact" ? "active" : ""}>Contact Support</button>
      </nav>

      {/* FAQ SECTION */}
      {activeTab === "faqs" && (
        <section className="accordion-section">
          {faqs.map((item, index) => (
            <div key={index} className="accordion-item">
              <div className="accordion-title" onClick={() => toggleAccordion(index)}>
                <h4>{item.question}</h4>
                <span>{openIndex === index ? "-" : "+"}</span>
              </div>
              {openIndex === index && <p className="accordion-content">{item.answer}</p>}
            </div>
          ))}
        </section>
      )}

      {/* DOCUMENTATION SECTION */}
     {activeTab === "docs" && (
  <section className="accordion-section">
    {docs.map((doc, index) => (
      <div key={index} className="accordion-item">
        <div
          className="accordion-title"
          onClick={() => toggleAccordion(index)}
        >
          <h4>{doc.title}</h4>
          <span>{openIndex === index ? "-" : "+"}</span>
        </div>

        {openIndex === index && (
          <div className="workflow">
            {doc.steps.map((step, i) => (
              <div key={i} className="workflow-step">
                <span className="step-text">{step}</span>

                {i !== doc.steps.length - 1 && (
                  <span className="step-arrow">→</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    ))}
  </section>
)}


      {/* RAISE TICKET */}
      {activeTab === "ticket" && (
        <section className="help-form-section">
          <h2>Submit a Support Request</h2>
          <form className="help-form" onSubmit={handleSubmit}>
            <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} />
            <select name="issueType" value={formData.issueType} onChange={handleChange}>
              <option value="">Issue Type</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Account">Account</option>
              <option value="Other">Other</option>
            </select>
            <textarea name="description" placeholder="Describe your issue" value={formData.description} onChange={handleChange} />
            {error && <p className="form-error">{error}</p>}
            {message && <p className="form-success">{message}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </section>
      )}

      {/* CONTACT SUPPORT */}
      {activeTab === "contact" && (
        <section className="help-form-section">
          <h2>Contact Support</h2>
          <form className="help-form">
            <input type="text" name="name" placeholder="Your Name" value={contactData.name} onChange={handleContactChange} />
            <input type="email" name="email" placeholder="Your Email" value={contactData.email} onChange={handleContactChange} />
            <textarea name="message" placeholder="Your Message" value={contactData.message} onChange={handleContactChange} />
            <button type="button">Send Message</button>
          </form>
        </section>
      )}

      {/* MY TICKETS */}
      <section className="my-tickets">
        <h2>My Support Tickets</h2>
        {tickets.length === 0 ? (
          <p className="empty-state">No support tickets submitted yet.</p>
        ) : (
          <ul className="ticket-list">
            {tickets.map((t) => (
              <li key={t._id} className={`ticket ${t.status.toLowerCase()}`}>
                <strong>{t.subject}</strong>
                <span>{t.issueType}</span>
                <p>{t.description}</p>
                <span className="ticket-status">{t.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default HelpSupport;
