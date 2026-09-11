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

              {[...blogs]
                .reverse()
                .map((blog) => (

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


      <button
  className="blog-page-read-more"
  onClick={() => navigate(`/blog/${blog.slug}`)}
>
  {blog.cta}

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

      <Link
        to="https://www.facebook.com/socialflylive/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
      >
        <FaFacebook />
      </Link>

      <Link
        to="https://www.instagram.com/socialflylive"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <FaInstagram />
      </Link>

      <Link
        to="https://www.linkedin.com/company/socialflylive/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <FaLinkedin />
      </Link>

      <Link
        to="https://www.threads.com/@socialflylive"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Threads"
      >
        <FaThreads />
      </Link>

      <Link
        to="https://in.pinterest.com/socialflylive/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Pinterest"
      >
        <FaPinterest />
      </Link>

      <Link
        to="https://www.google.com/maps/place/SocialTechner+%26+Socialfly/@43.932,-32.6777608,3z/data=!3m1!4b1!4m6!3m5!1s0x3a0275e10d495555:0x5fe8c0d82a4a28f!8m2!3d43.932!4d-32.6777608!16s%2Fg%2F11s8_1300s"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Google"
      >
        <FaGoogle />
      </Link>

    </div>

  </div>

</section>

    </div>
  );
};

export default BlogPage;