
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
import { Helmet } from "react-helmet-async";
import "../../Page_styles/LandingPage/Contact.css"
export default function Contact() {
  return (
    <>
    <Helmet>
  <title>Contact AssetPegasus | IT Asset Management Software</title>

<meta
  name="description"
  content="Contact AssetPegasus for information about IT asset management, software license management, inventory tracking, warranties, and asset lifecycle management."
/>

  <meta property="og:type" content="website" />

  <meta
    property="og:title"
    content="Contact AssetPegasus"
  />

<meta
  property="og:description"
  content="Contact AssetPegasus to learn more about IT asset management, software licenses, inventory tracking, and asset lifecycle management."
/>

  <meta
    property="og:image"
    content="https://assetpegasus.com/images/Dashboard.webp"
  />

  <meta
    property="og:url"
    content="https://assetpegasus.com/contact"
  />

  <meta
    name="twitter:card"
    content="summary_large_image"
  />

  <meta
    name="twitter:title"
    content="Contact AssetPegasus"
  />

<meta
  name="twitter:description"
  content="Contact AssetPegasus to learn more about IT asset management, software licenses, inventory tracking, and asset lifecycle management."
/>

  <meta
    name="twitter:image"
    content="https://assetpegasus.com/images/Dashboard.webp"
  />

  <link
    rel="canonical"
    href="https://assetpegasus.com/contact"
  />
</Helmet>
    <section className="contact">

      <div className="contact-top">

        <h1 style={{ color : "#DFD0B8", fontSize : "2rem"}}>Contact</h1>

        <p>
          Whether you want to explore AssetPegasus features, learn how our platform can simplify asset management, or discuss your requirements, our team is ready to help.
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
            Have questions or need assistance?
          </h3>

          <p>
            Fill out the form below and our team will get back to you as soon as possible. We're here to help with any questions or requirements you may have.
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

            <a href="https://www.facebook.com/socialflylive/"><FaFacebookF /></a>
              <a href="https://www.instagram.com/socialflylive"><FaInstagram /></a>
            <a href="https://www.linkedin.com/company/socialflylive/"><FaLinkedinIn /></a>
            <a href="#"><FaAccusoft /></a>
            <a href="https://in.pinterest.com/socialflylive/"><FaPinterestP /></a>
            <a href="https://www.google.com/maps/place/SocialTechner+%26+Socialfly/@43.932,-32.6777608,3z/data=!3m1!4b1!4m6!3m5!1s0x3a0275e10d495555:0x5fe8c0d82a4a28f!8m2!3d43.932!4d-32.6777608!16s%2Fg%2F11s8_1300s"><FaGoogle /></a>

          </div>

        </div>

        <div className="feedback">

          <h2>
            Your feedback means a lot to us. <span>Share your thoughts with us.</span>
          </h2>

          <div className="chat-icons">

            <a
            href="https://api.whatsapp.com/send/?phone=9088665504&text&type=phone_number&app_absent=0" className="whatsapp">
              <FaWhatsapp />
            </a>

            <a
            href="https://t.me/Socialflylive" className="telegram">
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
