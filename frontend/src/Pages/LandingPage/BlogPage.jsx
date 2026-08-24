import React from "react";
import { blogs } from "../../data/blogData";
import "../../Page_styles/LandingPage/BlogPage.css";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaThreads,
  FaPinterest,
  FaGoogle,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
const BlogPage = () => {
    const navigate = useNavigate();
  return (
    <div className="blog-page">

      {/* =========================
          HERO
      ========================= */}
      <section className="blog-page-hero">

        <h1>Blog</h1>

        <p>
          Insights, ideas and practical knowledge about asset management,
          technology, security and business operations.
        </p>

      </section>


      {/* =========================
          BLOG LIST
      ========================= */}
      <section className="blog-page-content">

        <div className="blog-page-container">

          <div className="blog-page-grid">

            {blogs.map((blog) => (

              <article
                className="blog-page-card"
                key={blog.id}
              >

                {/* IMAGE */}
                <div className="blog-page-image-wrapper">

                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="blog-page-image"
                  />

                </div>


                {/* CONTENT */}
                <div className="blog-page-card-content">

                  <div className="blog-page-meta">

                    <span>
                      By {blog.author}
                    </span>

                    <span className="blog-page-dot">
                      •
                    </span>

                    <span>
                      {blog.date}
                    </span>

                  </div>


                  <h2>
                    {blog.title}
                  </h2>


                  <a
                    href={blog.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="blog-page-read-more"
                  >
                    {blog.cta}

                    <span>
                      →
                    </span>
                  </a>

                </div>

              </article>

            ))}

          </div>

        </div>

      </section>

      <section className="blog-section-2">

  <h2>
    Modern Solutions for Agile Teams, Financial Insights & Resource Optimization
  </h2>

  <div className="blog-section-2-content">

    {/* LEFT - SUPPORT */}
    <div className="blog-support-card">

      <h3>Technical Support</h3>

      <p>
        Email- info@socialflylive.com
      </p>

      <button
        onClick={() => navigate("/contact")}
        className="blog-contact-btn"
      >
        Contact Us
      </button>

    </div>


    {/* RIGHT - SOCIAL MEDIA */}
    <div className="blog-social-card">

      <a
        href="https://facebook.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
      >
        <FaFacebook />
      </a>

      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <FaInstagram />
      </a>

      <a
        href="https://linkedin.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <FaLinkedin />
      </a>

      <a
        href="https://threads.net"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Threads"
      >
        <FaThreads />
      </a>

      <a
        href="https://pinterest.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Pinterest"
      >
        <FaPinterest />
      </a>

      <a
        href="https://google.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Google"
      >
        <FaGoogle />
      </a>

    </div>

  </div>

</section>

    </div>
  );
};

export default BlogPage;