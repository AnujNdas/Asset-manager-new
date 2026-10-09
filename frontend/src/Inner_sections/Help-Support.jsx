import React, { useEffect, useState } from "react";
import "../Page_styles/HelpSupport.css";
import {
  FiHelpCircle,
  FiBookOpen,
  FiClipboard,
  FiPlusCircle,
  FiMail,
  FiChevronDown,
  FiFileText,
  FiArrowDown,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiLoader,
  FiSend,
  FiInbox,
  FiTag,
} from "react-icons/fi";
import {
  createSupportTicket,
  getMySupportTickets,
  contactSupport 
} from "../Services/ApiServices";
import Tickets from "./Ticket";
import { jwtDecode } from "jwt-decode";
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
  const [userData, setUserData] = useState(null);
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
useEffect(() => {
  const storedAuth = localStorage.getItem("auth");

  if (storedAuth) {
    const parsed = JSON.parse(storedAuth);

    if (parsed.token) {
      const decoded = jwtDecode(parsed.token);
      setUserData(decoded); // contains role
    }
  }
}, []);

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
    console.log("My tickets:", res);
    setTickets(res || []);
  } catch (err) {
    console.error(err);
  }
};
  

  useEffect(() => {
    loadMyTickets();
  }, []);
  const handleContactSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setMessage("");

  if (!contactData.name || !contactData.email || !contactData.message) {
    setError("All fields are required.");
    return;
  }

  try {
    setLoading(true);
    await contactSupport(contactData);
    setMessage("Message sent successfully. Our team will contact you.");
    setContactData({ name: "", email: "", message: "" });
  } catch (err) {
    console.error(err);
    setError("Failed to send message.");
  } finally {
    setLoading(false);
  }
};

  return (

<div className="help-container">

  {/* ==========================================
      PAGE HEADER
  ========================================== */}

  <header className="help-header">

    <div className="help-header-heading">

      <span className="help-header-icon">
        <FiHelpCircle />
      </span>

      <div>
        <h1>Help & Support</h1>
        <p>
          Find answers, explore guides, and get assistance.
        </p>
      </div>

    </div>

  </header>


  {/* ==========================================
      NAVIGATION TABS
  ========================================== */}

  <nav className="help-nav" aria-label="Help sections">

    <button
      type="button"
      onClick={() => setActiveTab("faqs")}
      className={activeTab === "faqs" ? "active" : ""}
      aria-current={activeTab === "faqs" ? "page" : undefined}
    >
      <FiHelpCircle />
      <span>FAQs</span>
    </button>

    <button
      type="button"
      onClick={() => setActiveTab("docs")}
      className={activeTab === "docs" ? "active" : ""}
      aria-current={activeTab === "docs" ? "page" : undefined}
    >
      <FiBookOpen />
      <span>Documentation</span>
    </button>

    {userData?.role === "admin" ? (

      <button
        type="button"
        onClick={() => setActiveTab("adminTickets")}
        className={activeTab === "adminTickets" ? "active" : ""}
        aria-current={activeTab === "adminTickets" ? "page" : undefined}
      >
        <FiClipboard />
        <span>Tickets</span>
      </button>

    ) : (

      <button
        type="button"
        onClick={() => setActiveTab("ticket")}
        className={activeTab === "ticket" ? "active" : ""}
        aria-current={activeTab === "ticket" ? "page" : undefined}
      >
        <FiPlusCircle />
        <span>Raise Ticket</span>
      </button>

    )}

    <button
      type="button"
      onClick={() => setActiveTab("contact")}
      className={activeTab === "contact" ? "active" : ""}
      aria-current={activeTab === "contact" ? "page" : undefined}
    >
      <FiMail />
      <span>Contact Support</span>
    </button>

  </nav>


  {/* ==========================================
      FAQ SECTION
  ========================================== */}

  {activeTab === "faqs" && (

    <section className="accordion-section">

      <div className="help-section-header">

        <div className="help-section-heading">
          <span className="help-section-icon">
            <FiHelpCircle />
          </span>

          <div>
            <h2>Frequently Asked Questions</h2>
            <p>
              Find quick answers to common questions.
            </p>
          </div>
        </div>

        <span className="help-section-count">
          {faqs.length} Questions
        </span>

      </div>


      <div className="help-accordion-list">

        {faqs.map((item, index) => (

          <div
            key={index}
            className={`accordion-item ${
              openIndex === index ? "is-open" : ""
            }`}
          >

            <button
              type="button"
              className="accordion-title"
              onClick={() => toggleAccordion(index)}
              aria-expanded={openIndex === index}
            >

              <span className="accordion-question">
                <FiHelpCircle />
                <span>{item.question}</span>
              </span>

              <FiChevronDown className="accordion-chevron" />

            </button>


            {openIndex === index && (

              <div className="accordion-content">
                <p>{item.answer}</p>
              </div>

            )}

          </div>

        ))}

      </div>

    </section>

  )}


  {/* ==========================================
      DOCUMENTATION SECTION
  ========================================== */}

  {activeTab === "docs" && (

    <section className="accordion-section">

      <div className="help-section-header">

        <div className="help-section-heading">

          <span className="help-section-icon">
            <FiBookOpen />
          </span>

          <div>
            <h2>Documentation</h2>
            <p>
              Step-by-step guides for using AssetPegasus.
            </p>
          </div>

        </div>

        <span className="help-section-count">
          {docs.length} Guides
        </span>

      </div>


      <div className="help-accordion-list">

        {docs.map((doc, index) => (

          <div
            key={index}
            className={`accordion-item ${
              openIndex === index ? "is-open" : ""
            }`}
          >

            <button
              type="button"
              className="accordion-title"
              onClick={() => toggleAccordion(index)}
              aria-expanded={openIndex === index}
            >

              <span className="accordion-question">
                <FiFileText />
                <span>{doc.title}</span>
              </span>

              <FiChevronDown className="accordion-chevron" />

            </button>


            {openIndex === index && (

              <div className="workflow">

                {doc.steps.map((step, i) => (

                  <div key={i} className="workflow-step">

                    <span className="workflow-step-number">
                      {i + 1}
                    </span>

                    <span className="step-text">
                      {step}
                    </span>

                    {i !== doc.steps.length - 1 && (
                      <span className="step-arrow">
                        <FiArrowDown />
                      </span>
                    )}

                  </div>

                ))}

              </div>

            )}

          </div>

        ))}

      </div>

    </section>

  )}


  {/* ==========================================
      RAISE SUPPORT TICKET
  ========================================== */}

  {userData?.role !== "admin" &&
    activeTab === "ticket" && (

    <section className="help-form-section">

      <div className="help-section-header">

        <div className="help-section-heading">

          <span className="help-section-icon">
            <FiPlusCircle />
          </span>

          <div>
            <h2>Submit a Support Request</h2>
            <p>
              Describe your issue and our support team
              will review your request.
            </p>
          </div>

        </div>

      </div>


      <form
        className="help-form"
        onSubmit={handleSubmit}
      >

        <div className="help-form-grid">

          <div className="help-form-field">

            <label htmlFor="help-ticket-subject">
              Subject
            </label>

            <input
              id="help-ticket-subject"
              type="text"
              name="subject"
              placeholder="Enter ticket subject"
              value={formData.subject}
              onChange={handleChange}
            />

          </div>


          <div className="help-form-field">

            <label htmlFor="help-ticket-type">
              Issue Type
            </label>

            <select
              id="help-ticket-type"
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
            >
              <option value="">Select issue type</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Account">Account</option>
              <option value="Other">Other</option>
            </select>

          </div>


          <div className="help-form-field help-field-full">

            <label htmlFor="help-ticket-description">
              Description
            </label>

            <textarea
              id="help-ticket-description"
              name="description"
              placeholder="Describe your issue in detail..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
            />

          </div>

        </div>


        {error && (
          <p className="form-error" role="alert">
            <FiAlertCircle />
            {error}
          </p>
        )}

        {message && (
          <p className="form-success" role="status">
            <FiCheckCircle />
            {message}
          </p>
        )}


        <div className="help-form-footer">

          <span className="help-form-hint">
            <FiInfo />
            Provide enough details to help us investigate.
          </span>

          <button type="submit" disabled={loading}>

            {loading ? (
              <>
                <FiLoader className="help-loading-icon" />
                Submitting...
              </>
            ) : (
              <>
                <FiSend />
                Submit Ticket
              </>
            )}

          </button>

        </div>

      </form>

    </section>

  )}


  {/* ==========================================
      ADMIN TICKETS
  ========================================== */}

  {userData?.role === "admin" &&
    activeTab === "adminTickets" && (

    <div className="help-admin-tickets">
      <Tickets />
    </div>

  )}


  {/* ==========================================
      CONTACT SUPPORT
  ========================================== */}

  {activeTab === "contact" && (

    <section className="help-form-section">

      <div className="help-section-header">

        <div className="help-section-heading">

          <span className="help-section-icon">
            <FiMail />
          </span>

          <div>
            <h2>Contact Support</h2>
            <p>
              Send a message directly to our support team.
            </p>
          </div>

        </div>

      </div>


      <form
        className="help-form"
        onSubmit={handleContactSubmit}
      >

        <div className="help-form-grid">

          <div className="help-form-field">

            <label htmlFor="help-contact-name">
              Name
            </label>

            <input
              id="help-contact-name"
              type="text"
              name="name"
              placeholder="Enter your name"
              value={contactData.name}
              onChange={handleContactChange}
            />

          </div>


          <div className="help-form-field">

            <label htmlFor="help-contact-email">
              Email
            </label>

            <input
              id="help-contact-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={contactData.email}
              onChange={handleContactChange}
            />

          </div>


          <div className="help-form-field help-field-full">

            <label htmlFor="help-contact-message">
              Message
            </label>

            <textarea
              id="help-contact-message"
              name="message"
              placeholder="How can we help you?"
              value={contactData.message}
              onChange={handleContactChange}
              rows={5}
            />

          </div>

        </div>


        {error && (
          <p className="form-error" role="alert">
            <FiAlertCircle />
            {error}
          </p>
        )}

        {message && (
          <p className="form-success" role="status">
            <FiCheckCircle />
            {message}
          </p>
        )}


        <div className="help-form-footer">

          <span className="help-form-hint">
            <FiInfo />
            Our support team will review your message.
          </span>

          <button type="submit" disabled={loading}>

            {loading ? (
              <>
                <FiLoader className="help-loading-icon" />
                Sending...
              </>
            ) : (
              <>
                <FiSend />
                Send Message
              </>
            )}

          </button>

        </div>

      </form>

    </section>

  )}


  {/* ==========================================
      MY SUPPORT TICKETS
  ========================================== */}

  <section className="my-tickets">

    <div className="help-section-header">

      <div className="help-section-heading">

        <span className="help-section-icon">
          <FiClipboard />
        </span>

        <div>
          <h2>My Support Tickets</h2>
          <p>
            Track previously submitted support requests.
          </p>
        </div>

      </div>

      <span className="help-section-count">
        {tickets.length} Tickets
      </span>

    </div>


    {tickets.length === 0 ? (

      <div className="help-empty-tickets">

        <span className="help-empty-icon">
          <FiInbox />
        </span>

        <h4>No support tickets submitted yet</h4>

        <p>
          Your support requests will appear here.
        </p>

      </div>

    ) : (

      <ul className="ticket-list">

        {tickets.map((t) => (

          <li
            key={t._id}
            className={`ticket ${
              String(t.status || "").toLowerCase()
            }`}
          >

            <div className="ticket-top">

              <div className="ticket-heading">

                <span className="ticket-icon">
                  <FiFileText />
                </span>

                <strong>{t.subject}</strong>

              </div>

              <span className="ticket-status">
                {t.status}
              </span>

            </div>


            <span className="ticket-issue-type">
              <FiTag />
              {t.issueType}
            </span>


            <p className="ticket-description">
              {t.description}
            </p>

          </li>

        ))}

      </ul>

    )}

  </section>

</div>

  );
};

export default HelpSupport;
