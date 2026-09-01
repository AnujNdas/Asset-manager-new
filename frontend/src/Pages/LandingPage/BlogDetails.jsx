import React, { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { blogs } from "../../data/blogData";

import {
  FaFacebook,
  FaLinkedin,
  FaTwitter,
  FaLink,
  FaChevronDown,
} from "react-icons/fa6";

import "../../Page_styles/LandingPage/BlogDetails.css";


const BlogDetails = () => {

  const { slug } = useParams();

  const navigate = useNavigate();

  const [openFaq, setOpenFaq] = useState(null);


  // =========================================================
  // FIND BLOG USING SLUG
  // =========================================================

  const blog = blogs.find(
    (item) => item.slug === slug
  );


  // =========================================================
  // BLOG NOT FOUND
  // =========================================================

  if (!blog) {
    return <Navigate to="/blog" replace />;
  }


  // =========================================================
  // FAQ TOGGLE
  // =========================================================

  const toggleFaq = (index) => {

    setOpenFaq(
      openFaq === index
        ? null
        : index
    );

  };


  // =========================================================
  // SHARE
  // =========================================================

  const currentUrl = window.location.href;


  const shareFacebook = () => {

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl
      )}`,
      "_blank",
      "width=600,height=500"
    );

  };


  const shareLinkedIn = () => {

    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        currentUrl
      )}`,
      "_blank",
      "width=600,height=500"
    );

  };


  const shareTwitter = () => {

    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        currentUrl
      )}&text=${encodeURIComponent(
        blog.title
      )}`,
      "_blank",
      "width=600,height=500"
    );

  };


  const copyLink = async () => {

    try {

      await navigator.clipboard.writeText(
        currentUrl
      );

      alert("Blog link copied!");

    } catch (error) {

      console.error(
        "Failed to copy link:",
        error
      );

    }

  };


  // =========================================================
  // RENDER PARAGRAPH
  // =========================================================

  const renderParagraph = (paragraph, index) => {

    if (!paragraph) {
      return null;
    }

    return (
      <p key={index}>
        {paragraph}
      </p>
    );

  };


  return (
    <>

      {/* =====================================================
          SEO
      ===================================================== */}

      <Helmet>

        <title>
          {blog.metaTitle || blog.title}
        </title>

        <meta
          name="description"
          content={
            blog.metaDescription ||
            blog.excerpt ||
            ""
          }
        />

        {blog.keywords?.length > 0 && (
          <meta
            name="keywords"
            content={blog.keywords.join(", ")}
          />
        )}

        <meta
          property="og:title"
          content={
            blog.metaTitle ||
            blog.title
          }
        />

        <meta
          property="og:description"
          content={
            blog.metaDescription ||
            blog.excerpt ||
            ""
          }
        />

        <meta
          property="og:image"
          content={blog.image}
        />

        <meta
          property="og:type"
          content="article"
        />

        <meta
          property="og:url"
          content={currentUrl}
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={
            blog.metaTitle ||
            blog.title
          }
        />

        <meta
          name="twitter:description"
          content={
            blog.metaDescription ||
            blog.excerpt ||
            ""
          }
        />

        <meta
          name="twitter:image"
          content={blog.image}
        />

        <link
          rel="canonical"
          href={currentUrl}
        />

      </Helmet>


      {/* =====================================================
          PAGE
      ===================================================== */}

      <main className="blog-details-page">


        {/* ===================================================
            HERO
        =================================================== */}

        <section className="blog-details-hero">

          <div className="blog-details-hero-container">

            <div className="blog-details-category">

              {blog.category}

            </div>


            <h1>
              {blog.title}
            </h1>


            <div className="blog-details-meta">

              <span>
                By {blog.author}
              </span>

              <span className="blog-details-dot">
                •
              </span>

              <span>
                {blog.date}
              </span>

            </div>

          </div>

        </section>


        {/* ===================================================
            ARTICLE
        =================================================== */}

        <section className="blog-details-content">

          <div className="blog-details-container">


            {/* ===============================================
                HERO IMAGE
            =============================================== */}

            {blog.image && (

              <div className="blog-details-main-image">

                <img
                  src={blog.image}
                  alt={blog.title}
                />

              </div>

            )}


            {/* ===============================================
                QUICK ANSWER
            =============================================== */}

            {blog.quickAnswer && (

              <div className="blog-details-quick-answer">

                <h2>
                  Quick Answer
                </h2>

                <p>
                  {blog.quickAnswer}
                </p>

              </div>

            )}


            {/* ===============================================
                INTRODUCTION
            =============================================== */}
{(blog.introduction || blog.content?.introduction) && (

  <div className="blog-details-introduction">

    <p>
      {blog.introduction || blog.content?.introduction}
    </p>

  </div>

)}


            {/* ===============================================
                CONTENT SECTIONS
            =============================================== */}

  {blog.sections?.map((section, sectionIndex) => (
    <article
      className="blog-details-section"
      key={section.id || sectionIndex}
    >

      {/* SECTION NUMBER */}
      {section.number && (
        <div className="blog-section-number">
          {section.number}
        </div>
      )}

      {/* HEADING */}
{(section.heading || section.title) && (
  <h2>
    {section.heading || section.title}
  </h2>
)}

      {/* IMAGE */}
      {section.image && (
        <div className="blog-section-image">
          <img
            src={section.image}
            alt={
              section.imageAlt ||
              section.heading ||
              blog.title
            }
          />
        </div>
      )}

      {/* PARAGRAPHS */}
      {section.paragraphs?.map((paragraph, index) => (
        <p key={index}>
          {paragraph}
        </p>
      ))}

      {/* POINTS */}
      {section.points?.length > 0 && (
        <div className="blog-section-points">

          {section.points.map((point, pointIndex) => (
            <div
              className="blog-section-point"
              key={pointIndex}
            >

              {point.title && (
                <h3>
                  {point.title}
                </h3>
              )}

              {(point.description || point.text) && (
                <p>
                  {point.description || point.text}
                </p>
              )}

            </div>
          ))}

        </div>
      )}

      {/* LIST */}
      {section.list?.length > 0 && (
        <ul className="blog-section-list">

          {section.list.map((item, itemIndex) => (
            <li
  key={itemIndex}
  className={item.description ? "has-description" : "simple-item"}
>

              {item.title && (
                <strong>
                  {item.title}
                </strong>
              )}

              {item.description && (
                <span>
                  {" — "}
                  {item.description}
                </span>
              )}

            </li>
          ))}

        </ul>
      )}

      {/* TABLE */}
      {section.table && (
        <div className="blog-table-wrapper">

          <table className="blog-details-table">

            <thead>
              <tr>
                {section.table.headers?.map(
                  (header, headerIndex) => (
                    <th key={headerIndex}>
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {section.table.rows?.map(
                (row, rowIndex) => (
                  <tr key={rowIndex}>

                    {row.map(
                      (cell, cellIndex) => (
                        <td key={cellIndex}>
                          {cell}
                        </td>
                      )
                    )}

                  </tr>
                )
              )}
            </tbody>

          </table>

        </div>
      )}

      {/* TAKEAWAY */}
      {section.takeaway && (
        <div className="blog-takeaway">

          <strong>
            Key Takeaway
          </strong>

          <p>
            {section.takeaway}
          </p>

        </div>
      )}

    </article>
  ))}


            {/* =================================================
                COMPARISON TABLE
            ================================================= */}

            {blog.comparison && (

              <section className="blog-comparison-section">

                <h2>
                  {blog.comparison.heading}
                </h2>


                <div className="blog-table-wrapper">

                  <table className="blog-details-table">

                    <thead>

                      <tr>

                        <th>
                          #
                        </th>

                        <th>
                          {blog.comparison.columns[0]}
                        </th>

                        <th>
                          {blog.comparison.columns[1]}
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {blog.comparison.rows.map(
                        (row, index) => (

                          <tr key={index}>

                            <td>
                              {row.label}
                            </td>

                            <td>
                              {row.reactive}
                            </td>

                            <td>
                              {row.tracked}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </section>

            )}


            {/* =================================================
                CONCLUSION
            ================================================= */}
{(blog.conclusion || blog.content?.conclusion) && (

  <section className="blog-conclusion">

    <h2>
      Conclusion
    </h2>

    <p>
      {blog.conclusion || blog.content?.conclusion}
    </p>

  </section>

)}


            {/* =================================================
                FAQ
            ================================================= */}

            {blog.faq?.length > 0 && (

              <section className="blog-faq">

                <h2>
                  Frequently Asked Questions
                </h2>


                <div className="blog-faq-list">

                  {blog.faq.map(
                    (item, index) => (

                      <div
                        className={`blog-faq-item ${
                          openFaq === index
                            ? "active"
                            : ""
                        }`}
                        key={index}
                      >

                        <button
                          className="blog-faq-question"
                          onClick={() =>
                            toggleFaq(index)
                          }
                        >

                          <span>
                            {item.question}
                          </span>

                          <FaChevronDown />

                        </button>


                        {openFaq === index && (

                          <div className="blog-faq-answer">

                            <p>
                              {item.answer}
                            </p>

                          </div>

                        )}

                      </div>

                    )
                  )}

                </div>

              </section>

            )}


            {/* =================================================
                FINAL CTA
            ================================================= */}

{(blog.finalCta || blog.ctaSection) && (

  <section className="blog-final-cta">

    <h2>
      {blog.finalCta?.heading || blog.ctaSection?.title}
    </h2>

    <p>
      {blog.finalCta?.text || blog.ctaSection?.description}
    </p>

    <button
      onClick={() =>
        navigate(
          blog.finalCta?.buttonLink ||
          blog.ctaSection?.buttonLink
        )
      }
    >
      {blog.finalCta?.buttonText ||
       blog.ctaSection?.buttonText}

      <span>
        →
      </span>

    </button>

  </section>

)}


            {/* =================================================
                SHARE
            ================================================= */}

            <section className="blog-share">

              <span>
                Share this article
              </span>


              <div className="blog-share-buttons">

                <button
                  onClick={shareFacebook}
                  aria-label="Share on Facebook"
                >
                  <FaFacebook />
                </button>


                <button
                  onClick={shareLinkedIn}
                  aria-label="Share on LinkedIn"
                >
                  <FaLinkedin />
                </button>


                <button
                  onClick={shareTwitter}
                  aria-label="Share on Twitter"
                >
                  <FaTwitter />
                </button>


                <button
                  onClick={copyLink}
                  aria-label="Copy link"
                >
                  <FaLink />
                </button>

              </div>

            </section>

            {/* =================================================
    MORE BLOGS
================================================= */}

<section className="blog-more-section">

  <div className="blog-more-container">

    <h2 className="blog-more-title">
      More from our Blog
    </h2>

    <div className="blog-more-grid">

      {blogs
        .filter((item) => item.slug !== blog.slug)
        .map((item) => (

          <article
            className="blog-more-card"
            key={item.id}
          >

            {/* IMAGE */}
            <div className="blog-more-image">

              <img
                src={item.image}
                alt={item.title}
              />

            </div>


            {/* CONTENT */}
            <div className="blog-more-content">

              <h3>
                {item.title}
              </h3>


              <p className="blog-more-meta">

                <span>
                  By {item.author}
                </span>

                <span className="blog-more-dot">
                  •
                </span>

                <span>
                  {item.date}
                </span>

              </p>


<button
  className="blog-more-button"
  onClick={() => {
    const newTab = window.open(
      `/blog/${item.slug}`,
      "_blank"
    );

    if (newTab) {
      newTab.focus();
    }
  }}
>
  {item.cta}

  <span>
    →
  </span>
</button>

            </div>

          </article>

        ))}

    </div>

  </div>

</section>


            {/* =================================================
                BACK TO BLOG
            ================================================= */}

            {/* <button
              className="blog-back-button"
              onClick={() =>
                navigate("/blog")
              }
            >
              ← Back to Blog
            </button> */}


          </div>

        </section>

      </main>

    </>
  );
};

export default BlogDetails;