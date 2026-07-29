
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaAccusoft,
  FaPinterestP,
  FaGoogle,
  FaWhatsapp,
  FaTelegramPlane,
} from "react-icons/fa";
import "../../Page_styles/LandingPage/Contact.css"
export default function Contact() {
  return (
    <>
    <section className="contact">

      <div className="contact-top">

        <h2>Contact</h2>

        <p>
          We'd love to hear from you. Whether you're curious about
          Socialfly features or our other services, contact us.
          Our team is here to help.
        </p>

      </div>

      <div className="contact-wrapper">

        <div className="contact-form">

          <form>

            <input
              type="text"
              placeholder="Full Name"
            />

            <input
              type="email"
              placeholder="Email"
            />

            <label>
              Message <span>*</span>
            </label>

            <textarea
              rows="7"
            ></textarea>

            <button>
              Send Message
            </button>

          </form>

        </div>

        <div className="contact-info">

          <h3>
            Have questions or need help?
          </h3>

          <p>
            Use the form to reach out and we will be
            in touch with you as quickly as possible.
          </p>

        </div>

      </div>

    </section>

    <section className="contactInfo">

      <div className="container">

        <div className="top">

          {/* Left Card */}

          <div className="support-card">

            <h3>Technical Support</h3>

            <p>Email- info@socialflylive.com</p>

            <p>MON – FRI (Office Hours. IST)</p>

            <button>Contact Us</button>

          </div>

          {/* Right Card */}

          <div className="social-card">

            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaLinkedinIn /></a>
            <a href="#"><FaAccusoft /></a>
            <a href="#"><FaPinterestP /></a>
            <a href="#"><FaGoogle /></a>

          </div>

        </div>

        <div className="feedback">

          <h2>
            Your Feedback is extremely valuable for us.
            <span> Drop us a Text.</span>
          </h2>

          <div className="chat-icons">

            <a href="#" className="whatsapp">
              <FaWhatsapp />
            </a>

            <a href="#" className="telegram">
              <FaTelegramPlane />
            </a>

          </div>

        </div>

        <h4 className="bottom-text">
          Innovating Business Management Secure,
          Scalable, Reliable
        </h4>

      </div>

    </section>
    </>
  )
}
