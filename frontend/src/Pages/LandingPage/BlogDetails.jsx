import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { blogs } from "../../data/blogData";
import "../../Page_styles/LandingPage/BlogDetails.css"


const BlogDetails = () => {

  const { slug } = useParams();


  // Find the selected blog
  const blog = blogs.find(
    (item) => item.slug === slug
  );


  // Always open the blog from the top
  useEffect(() => {

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

  }, [slug]);


  // =========================
  // BLOG NOT FOUND
  // =========================

  if (!blog) {

    return (
      <section className="blog-not-found">

        <h1>
          Blog Not Found
        </h1>

        <p>
          The blog you are looking for does not exist.
        </p>

        <Link to="/blog">
          ← Back to Blogs
        </Link>

      </section>
    );

  }


  return (

    <main className="blog-details-page">


      {/* =====================================
          HERO
      ===================================== */}

      <section className="blog-details-hero">

        <div className="blog-details-hero-inner">


          {/* BREADCRUMB */}

          <div className="blog-breadcrumb">

            <Link to="/">
              Home
            </Link>

            <span>/</span>

            <Link to="/blog">
              Blog
            </Link>

            <span>/</span>

            <span>
              {blog.title}
            </span>

          </div>


          {/* TITLE */}

          <h1 className="blog-details-title">
            {blog.title}
          </h1>


        </div>

      </section>



      {/* =====================================
          FEATURED IMAGE + CONTENT
      ===================================== */}

      <section className="blog-details-main">

        <div className="blog-details-image-wrapper">

          <img
            src={blog.image}
            alt={blog.title}
            className="blog-details-featured-image"
          />

        </div>


        {/* CONTENT CARD */}

        <article className="blog-details-card">


          {/* META */}

          <div className="blog-details-meta">

            <span>
              By <strong>{blog.author}</strong>
            </span>

            <span className="blog-meta-dot">
              •
            </span>

            <span>
              {blog.date}
            </span>

          </div>


          {/* INTRODUCTION */}

          <p className="blog-details-description">
            {blog.description}
          </p>


          {/* ARTICLE CONTENT */}

          <div className="blog-details-body">

            {blog.content}

          </div>


          {/* BACK BUTTON */}

          <Link
            to="/blog"
            className="blog-back-button"
          >
            ← Back to Blogs
          </Link>


        </article>

      </section>

    </main>

  );
};


export default BlogDetails;