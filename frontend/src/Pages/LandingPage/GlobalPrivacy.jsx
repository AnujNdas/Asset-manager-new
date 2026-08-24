import React from 'react'
import { useNavigate } from 'react-router-dom'
import "../../Page_styles/LandingPage/GlobalPrivacy.css"
const GlobalPrivacy = () => {
    const navigate = useNavigate();
  return (
    <>
    <section className="privacy-hero-section">
  <h1>Privacy Policy</h1>

  <div className="privacy-hero-clip">
    <div className="privacy-hero-content">
      <p>
        At <strong>SocialFly</strong>, we operate on a
        “Privacy by Design” architecture.
      </p>
    </div>
  </div>
</section>

<section className="privacy-compliance-section">

  <div className="privacy-compliance-container">

    <p className="privacy-compliance-intro">
      This means our software is built from the ground up to minimize
      data footprint. This Global Privacy Policy explains how we handle
      the limited information processed through our business management
      platform.
    </p>


    <h2>Global Compliance Standards</h2>


    <p className="privacy-compliance-description">
      We have designed this policy to be transparent and compliant with
      major global regulations:
    </p>


    <ul className="privacy-compliance-list">

      <li>
        <strong>GDPR &amp; UK GDPR:</strong>{" "}
        General Data Protection Regulation (European Union &amp; United Kingdom).
      </li>

      <li>
        <strong>CCPA / CPRA:</strong>{" "}
        California Consumer Privacy Act (United States).
      </li>

      <li>
        <strong>DPDP Act:</strong>{" "}
        Digital Personal Data Protection Act (India).
      </li>

      <li>
        <strong>LGPD:</strong>{" "}
        Lei Geral de Proteção de Dados (Brazil).
      </li>

      <li>
        <strong>PIPL:</strong>{" "}
        Personal Information Protection Law (China).
      </li>

      <li>
        <strong>PIPEDA:</strong>{" "}
        Personal Information Protection and Electronic Documents Act (Canada).
      </li>

      <li>
        <strong>POPIA:</strong>{" "}
        Protection of Personal Information Act (South Africa).
      </li>

      <li>
        <strong>Privacy Act 1988:</strong>{" "}
        Including the Australian Privacy Principles (Australia).
      </li>

      <li>
        <strong>PDPA:</strong>{" "}
        Personal Data Protection Act (Singapore).
      </li>

      <li>
        <strong>APPI:</strong>{" "}
        Act on the Protection of Personal Information (Japan).
      </li>

    </ul>

  </div>

</section>

<section className="privacy-section-3">

  {/* ZERO TRACKING */}
  <div className="privacy-zero-tracking">

    <h2>Our “Zero-Tracking” Commitment</h2>

    <p className="privacy-section-intro">
      Unlike traditional SaaS platforms, SocialFly Live does not engage
      in surveillance or behavioral tracking.
    </p>

    <ul className="privacy-zero-list">

      <li>
        <strong>No Cookies:</strong>{" "}
        We do not use tracking cookies, advertising cookies, or
        third-party analytics cookies on our software.
      </li>

      <li>
        <strong>No Profiling:</strong>{" "}
        We do not build “user profiles” or monitor your browsing
        behavior to sell to advertisers.
      </li>

      <li>
        <strong>Data Minimalism:</strong>{" "}
        We only process the absolute minimum data required to execute
        the functions of the software as requested by you.
      </li>

    </ul>

  </div>


  {/* CAMERA ACCESS */}
  <div className="privacy-camera-access">

    <h2>
      Camera Access (for scanning provided Barcode)
    </h2>

    <p>
      Our app requests camera access solely to scan asset QR codes
      for quick identification, check-in/check-out, and inventory updates.
    </p>

    <p>
      Camera data is processed in real time on your device; we do not
      record, store, or share any images or video footage.
    </p>

    <p>
      You may deny or revoke camera access at any time via your browser
      or device settings, though barcode scanning functionality will be limited.
    </p>

  </div>

</section>

<section className="privacy-section-4">

  {/* EMAIL ACCESS */}
  <div className="privacy-email-access">

    <h2>
      Email Access (Just to send notifications &amp; user role access)
    </h2>

    <p>
      We collect your email address only to send system notifications
      (e.g., asset alerts, assignment updates) and to assign role-based
      access (Admin, Tech, Viewer).
    </p>

    <p>
      Your email is not used for marketing, sold to third parties, or
      shared beyond the necessary operation of your organization’s asset
      management.
    </p>

    <p>
      You can unsubscribe from non-critical notifications while still
      maintaining your account role and access.
    </p>

  </div>


  {/* NO PASSWORD BACKUP */}
  <div className="privacy-password-section">

    <h2>
      No Password Backup (We don’t store any information from our end)
    </h2>

    <p>
      For security, we do not store your password on our servers.
      Authentication is handled via encrypted, zero knowledge methods.
    </p>

    <p>
      We cannot retrieve or reset your password for you — lost credentials
      require account recovery through your verified email.
    </p>

    <p>
      No password data is backed up, logged, or accessible by any staff
      member at <strong>SocialFly</strong>.
    </p>

  </div>

</section>

<section className="privacy-section-5">

  {/* 2-MONTH DATA DELETION */}
  <div className="privacy-data-deletion">

    <h2>
      2-Month No-Use Data Deletion
      (Without subscription, only 2 months we will keep account)
    </h2>

    <p>
      If your account remains inactive (no logins, scans, or updates)
      for two consecutive months and you do not have an active
      subscription, we will permanently delete your account and all
      associated asset data.
    </p>

    <p>
      You will receive a warning email 7 days before deletion.
      After deletion, data cannot be restored.
    </p>

    <p>
      Active subscribers are exempt from this policy; inactivity limits
      reset upon subscription renewal.
    </p>

  </div>


  {/* NO REFUND */}
  <div className="privacy-no-refund">

    <h2>
      No Refund (Free 7-day trial)
    </h2>

    <p>
      We offer a 7 day free trial with full features.
      No payment is required during the trial period.
    </p>

    <p>
      If you subscribe and then cancel, we do not provide refunds for
      partial months or unused time. You retain access until the end
      of your paid billing cycle.
    </p>

    <p>
      By subscribing, you acknowledge that you have tested the service
      during the free trial and accept the no refund terms.
    </p>

  </div>

</section>

<section className="privacy-section-6">

  <h2>Data Ownership &amp; Storage</h2>

  <p className="privacy-intro">
    All data you input into <strong>SocialFly</strong> remains your exclusive
    property. We act as a <strong>Data Processor</strong>, while you remain
    the <strong>Data Controller</strong>.
  </p>


  <ul className="privacy-storage-list">

    <li>
      <strong>Storage Limitation &amp; Efficiency</strong>

      <div>
        To maintain high-performance software and manage global server
        resources efficiently, we follow a strict
        <strong> Storage Limitation Principle.</strong> We do not retain
        unnecessary historical logs or “ghost” copies of your data.
      </div>
    </li>


    <li>
      <strong>Immediate &amp; Permanent Deletion (No Recovery)</strong>

      <div>
        <strong>This is a critical notice for all users:</strong> In accordance
        with the “Right to Erasure” (GDPR Art. 17), when you delete a record,
        a file, or your account, the deletion is executed permanently and
        immediately across our primary production servers.
      </div>
    </li>

  </ul>


  <p className="privacy-numbered">
    <strong>1. Non-Recoverability:</strong> Because we do not maintain
    secondary archival backups of deleted content (to ensure your privacy
    and optimize storage), there is no way to recover data once it is deleted.
  </p>


  <p className="privacy-numbered">
    <strong>2. User Liability:</strong> Users are solely responsible for
    ensuring they have exported any necessary business data before performing
    a deletion action.
  </p>

</section>

<section className="privacy-section-7">

  {/* LEGAL BASIS */}
  <div className="privacy-block">

    <h2>Legal Basis for Processing</h2>

    <p className="privacy-intro">
      For users in jurisdictions requiring a “Legal Basis” (such as the EU),
      we process your data based on:
    </p>

    <ul>
      <li>
        <strong>Contractual Necessity:</strong> We process data only as needed
        to provide the business management services you have signed up for.
      </li>

      <li>
        <strong>Legal Obligation:</strong> We may retain minimal transactional
        data if required by global tax or accounting laws.
      </li>
    </ul>

  </div>


  {/* GLOBAL PRIVACY RIGHTS */}
  <div className="privacy-block privacy-rights-block">

    <h2>Your Global Privacy Rights</h2>

    <p className="privacy-intro">
      Regardless of where you are in the world, SocialFly honors the following
      rights:
    </p>

    <ul>
      <li>
        <strong>Right to Know</strong> — You have the right to know exactly
        what data we process (which is minimal).
      </li>

      <li>
        <strong>Right to Erasure</strong> — You can delete your data at any
        time via your dashboard.
      </li>

      <li>
        <strong>Right to Portability</strong> — You can export your data into
        standard formats before closing your account.
      </li>

      <li>
        <strong>Non-Discrimination</strong> — We will never charge you a
        different price or provide different service levels for exercising
        your privacy rights.
      </li>
    </ul>

  </div>

</section>

<section className="privacy-section-8">

  {/* INTERNATIONAL DATA TRANSFERS */}
  <div className="privacy-block">

    <h2>International Data Transfers</h2>

    <p>
      To provide a global service, your data may be processed on secure servers
      located in various regions (e.g., USA, EU, or Singapore).
      <br />
      We utilize <strong>Standard Contractual Clauses (SCCs)</strong> and
      high-level encryption to ensure that your data receives the same level of
      protection regardless of where the server is located.
    </p>

  </div>


  {/* DATA SECURITY */}
  <div className="privacy-block privacy-security-block">

    <h2>Data Security</h2>

    <p>
      We implement <strong>“Zero-Knowledge”</strong> inspired protocols where
      possible. All data is protected by <strong>AES-256 bit encryption</strong>
      at rest and <strong>TLS 1.3</strong> in transit. Access to your business
      environment is restricted via encrypted authentication tokens.
    </p>

  </div>

</section>

<section className="privacy-section-9">

  {/* Terms & Condition */}
  <div className="privacy-terms-wrapper">
    <button
      className="privacy-terms-btn"
      onClick={() => navigate("/terms-and-condition")}
    >
      Terms & Condition
    </button>
  </div>

  <hr className="privacy-divider" />

  {/* Contact Privacy Team */}
  <div className="privacy-contact-content">

    <h2>Contact Our Privacy Team</h2>

    <p>
      If you have questions regarding this policy or wish to submit a formal
      Data Subject Access Request (DSAR), please contact us:
    </p>

    <button
      className="privacy-contact-btn"
      onClick={() => navigate("/contact")}
    >
      Contact Us
    </button>

    {/* Contact Information */}
    <div className="privacy-contact-info">

      <p>
        <strong>Mailing Address:</strong>{" "}
        info@socialflylive.com
      </p>

      <p>
        <strong>Support Email:</strong>{" "}
        Support@socialflylive.com
      </p>

    </div>

  </div>

</section>
    </>
  )
}

export default GlobalPrivacy