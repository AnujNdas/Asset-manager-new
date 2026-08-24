import React from "react";
import { blogs } from "../../data/blogData";
import "../../Page_styles/LandingPage/BlogPage.css";

const BlogPage = () => {
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

    </div>
  );
};

export default BlogPage;