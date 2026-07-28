import "../../Page_styles/LandingPage/About.css"
import { FiBox, FiMonitor , FiArrowRight  } from "react-icons/fi";
import {
  FaFacebookF,
  FaGoogle,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
  FaThermometer,
  FaTwitter,
  FaWhatsapp,
  FaTelegramPlane,
} from "react-icons/fa";
const values = [
  {
    title: "Innovation First",
    desc: "We embrace new technologies like AI and automation to stay ahead.",
  },
  {
    title: "Customer-Centric",
    desc: "Every product and service is designed with business growth in mind.",
  },
  {
    title: "Transparency",
    desc: "Clear communication and ethical practices define how we work.",
  },
  {
    title: "Scalability",
    desc: "We build solutions that grow as your business grows.",
  },
  {
    title: "Excellence",
    desc: "Delivering not just software, but real results that matter.",
  },
];

export default function About() {
  return (
    <>
    <section className="about">

      <div className="about-wave"></div>

      <div className="about-container">

        <h2 className="about-title">
          About Socialfly
        </h2>

        <div className="about-card">

          <p>
            Socialfly is a Software Company in Kolkata. Founded in 2020.
            We've spent the last <strong>8+ years creating custom software,
            websites, mobile apps, and complete digital marketing solutions</strong>
            for businesses across industries.
          </p>

          <p>
            Our very first SaaS is simple
            <strong> Asset Management System</strong>
            (Hardware &amp; Software)
          </p>

          <div className="product-title">
            <h3>AssetPegasus</h3>
            <h4>Machine + IT Asset Hybrid Nature</h4>
          </div>

          <ul>
            <li>
              <strong>No Tracking</strong> — Privacy Policy.
            </li>

            <li>
              Track <strong>Renewals, Maintenance, Warranty & Insurance.</strong>
            </li>

            <li>
              Track <strong>Complete Assets History.</strong>
            </li>

            <li>
              Instant <strong>Asset Insights/Reports</strong> that scale with
              business.
            </li>
          </ul>

          <p className="bottom-text">
            We believe businesses shouldn't juggle multiple tools.
            <strong> AssetPegasus unites your assets into one smart platform</strong>
            designed for growth.
          </p>

        </div>

      </div>

    </section>

     <section className="values-section">
      <div className="container">

        <h2 className="section-title">
          Our Values
        </h2>

        <div className="values-grid">

          {values.map((item, index) => (
            <div className="value-card" key={index}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}

        </div>

      </div>
    </section>

    <section className="product-features">

      <div className="container">

        <h2 className="section-title">
          Product Features
        </h2>

        <div className="feature-grid">

          <div className="feature-card">

            <div className="feature-icon">
              <FiBox />
            </div>

            <h3>IT Asset Management</h3>

            <p>
              Manage all types of
              <strong> Digital Assets </strong>
              from
              <strong> one place </strong>
              — Software, Servers, Domains &
              Cloud assets etc.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              <FiMonitor />
            </div>

            <h3>Equipment Asset Management</h3>

            <p>
              Manage all types of
              <strong> Physical Assets </strong>
              from
              <strong> one place </strong>
              — Machines, Equipment,
              Electronics & Transport assets.
            </p>

          </div>

        </div>

      </div>

    </section>
     <section className="founder-story">

      <div className="story-container">

        <h5 className="story-small-title">
          Founder Story
        </h5>

        <h2 className="story-title">
          I Lost Almost Everything. I Chose to Keep Building.
        </h2>

        <div className="story-content">

          <p>
            On the night of <strong>14 August 2024</strong>, I went to
            Shyambazar, Kolkata, to participate in the Raat Dakhol protest.
            I arrived at around <strong>10:00 PM.</strong>
          </p>

          <p>
            I was there as a citizen, participating in a public protest and
            documenting what was happening around me.
          </p>

          <p>
            As the night progressed, the situation became increasingly tense.
            I witnessed police action against people at the frontline of the
            protest while recording videos.
          </p>

          <p>I was asked to delete the videos.</p>

          <p><strong>I refused.</strong></p>

          <p>
            My phone was taken and I was taken into police custody.
            I was later informed that I was under arrest.
          </p>

          <p>What followed changed my life.</p>

          <p>
            I was subsequently accused in criminal cases involving serious
            allegations. I maintain that I had no involvement in any
            vandalism and was not present at the alleged locations.
          </p>

          <p>
            The legal proceedings remain ongoing and I continue to seek
            justice through the appropriate legal process.
          </p>

          <p>
            <strong>I spent 53 days in judicial custody.</strong>
          </p>

          <p>
            During that period my life outside prison changed as well.
          </p>

          <p>
            Before this happened I had built a digital marketing business.
            During my arrest I lost approximately
            <strong> 90% of my clients.</strong>
          </p>

          <p>The business I spent years building was almost gone.</p>

          <p>
            My career was disrupted.<br />
            My income was disrupted.<br />
            My reputation was affected.
          </p>

          <p>
            And I had to start again.<br />
            <strong>But I decided not to give up.</strong>
          </p>

          <p>
            I still have the videos I recorded that night. They remain a
            reminder of the events that changed my life.
          </p>

          <p>
            I am not sharing this story to ask for sympathy. I am sharing it
            because it is part of the journey that brought me here.
          </p>

          <p>
            After losing most of what I had built,
            <strong> I chose to build again.</strong>
          </p>

          <p>
            I returned to technology and entrepreneurship with a different
            perspective—building products that solve real business problems.
          </p>

          <p>
            That journey eventually led me to build
            <strong> AssetPegasus.</strong>
          </p>

        </div>

        <blockquote className="quote">
          "You cannot always control what happens to you.
          But you can decide what you build after it happens."
        </blockquote>

        <h4 className="author">
          Poll Ghosh
        </h4>

        <div className="social-links">

          <a href="#">
            <FaLinkedinIn />
          </a>

          <a href="#">
            <FaTwitter />
          </a>

        </div>

      </div>

    </section>
    <section className="social-section">

      <div className="social-container">

        <h2 className="social-title">
          Our Social Media
        </h2>

        {/* Top Icons */}

        <div className="social-icons">

          <a href="#"><FaFacebookF /></a>

          <a href="#"><FaGoogle /></a>

          <a href="#"><FaInstagram /></a>

          <a href="#"><FaLinkedinIn /></a>

          <a href="#"><FaPinterestP /></a>

          <a href="#"><FaThermometer /></a>

        </div>

        {/* Button */}

        <button className="contact-btn">
          Contact Us
        </button>

        {/* Bottom Icons */}

        <div className="chat-icons">

          <a href="#">
            <FaWhatsapp />
          </a>

          <a href="#">
            <FaTelegramPlane />
          </a>

        </div>

      </div>

    </section>

    <section className="cta-section">
      <div className="cta-container">

        <h2 className="cta-title">
          Asset Management System
        </h2>

        <button className="cta-btn">
          <span>Sign Up</span>
          <FiArrowRight />
        </button>

      </div>
    </section>
    </>
  );
}
