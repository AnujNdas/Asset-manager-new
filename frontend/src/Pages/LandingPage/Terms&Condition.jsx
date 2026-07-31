import React from 'react'
import "../../Page_styles/LandingPage/Terms.css"
const Terms = () => {
  return (
    <>
    <section className="terms-section">
      <div className="terms-container">

        <div className="terms-title">
          <h1>Terms and Conditions</h1>
        </div>

      </div>
    </section>
    <section className="terms-section">
      <div className="terms-container">

        <div className="terms-card">

          <h2>Welcome to <span>SocialFly</span>.</h2>

          <p>
            These Terms and Conditions ("Terms") govern your access to and use
            of our business management software services.
          </p>

          <p>
            By creating an account or using our services, you agree to be bound
            by these Terms. If you do not agree, please do not use our platform.
          </p>

          <h2>Services and Account Security</h2>

          <p>
            SocialFly provides cloud-based business management tools.
          </p>

          <ul>
            <li>
              <strong>Eligibility:</strong> You must be at least 18 years old or
              the legal age of majority in your jurisdiction.
            </li>

            <li>
              <strong>Account Responsibility:</strong> You are responsible for
              maintaining your login credentials and all activity under your
              account.
            </li>
          </ul>

          <h2>Data Management & Permanent Deletion</h2>

          <p>
            SocialFly prioritizes user privacy and system efficiency.
          </p>

          <ul>
            <li>
              <strong>No Recovery:</strong> Deleted data is permanently removed.
            </li>

            <li>
              <strong>Storage Optimization:</strong> We do not maintain archived
              backups of deleted data.
            </li>

            <li>
              <strong>User Backups:</strong> Export important data before
              deletion.
            </li>
          </ul>

          <h2>Prohibited Use</h2>

          <p>You agree not to:</p>

          <ul>
            <li>Use the service for illegal purposes.</li>
            <li>Attempt to hack or reverse engineer the software.</li>
            <li>Spread malware, spam or offensive content.</li>
          </ul>

          <h2>Payments, Subscriptions and Fees</h2>

          <p>
            Paid subscriptions may be required for certain premium features.
          </p>

          <ul>
            <li>
              <strong>Billing:</strong> Fees are charged according to your
              selected plan.
            </li>

            <li>
              <strong>Auto Renewal:</strong> Subscriptions renew automatically
              unless cancelled.
            </li>
          </ul>

          <h2>Refund Policy</h2>

          <p>
            We want you to be satisfied with SocialFly while maintaining fair
            operational standards.
          </p>

          <ul>
            <li>Free trials are available where applicable.</li>
            <li>Refunds are generally not provided after billing.</li>
            <li>Exceptions may apply for verified technical issues.</li>
            <li>Subscriptions may be cancelled anytime.</li>
          </ul>

          <h2>Limitation of Liability</h2>

          <p>
            To the maximum extent permitted by law, SocialFly shall not be
            liable for:
          </p>

          <ul>
            <li>Indirect or consequential damages.</li>
            <li>Loss of profits, revenue or business data.</li>
            <li>Unauthorized access due to insecure credentials.</li>
          </ul>

          <p className="highlight">
            Our service is provided on an <strong>"As Is"</strong> and
            <strong> "As Available"</strong> basis.
          </p>

          <h2>Global Governing Law</h2>

          <p>
            These Terms shall be governed by the laws of West Bengal, India.
          </p>

          <h2>Modifications to Terms</h2>

          <p>
            We reserve the right to update these Terms at any time. Continued
            use of the platform constitutes acceptance of the revised Terms.
          </p>

        </div>
      </div>
    </section>
    <section className="contactInfo">
      <div className="contactInfo-container">

        <button className="privacy-btn">
          Privacy Policy
        </button>

        <h2>Contact Information</h2>

        <p className="contact-desc">
          For questions regarding these Terms or to request a refund evaluation,
          please contact us at:
        </p>

        <button className="contact-btn">
          Contact Us
        </button>

        <div className="contact-details">

          <ul>
            <li>
              <strong>Support Email:</strong>
              <span> support@assetpegasus.com</span>
            </li>

            <li>
              <strong>Mailing Address:</strong>
              <span> info@assetpegasus.com</span>
            </li>
          </ul>

        </div>

      </div>
    </section>
    </>
  )
}

export default Terms;