const fs = require("fs");
const path = require("path");

const hostname = "https://assetpegasus.com";

// Update this path if your blogdata.js is located elsewhere
const blogDataPath = path.join(
  __dirname,
  "src",
  "data",
  "blogData.js"
);

const sitemapPath = path.join(
  __dirname,
  "public",
  "sitemap.xml"
);

// Your public static pages
const staticPages = [
  {
    url: "/",
    priority: "1.0",
    changefreq: "weekly"
  },
  {
    url: "/about/",
    priority: "0.8",
    changefreq: "monthly"
  },
  {
    url: "/contact/",
    priority: "0.7",
    changefreq: "monthly"
  },
  {
    url: "/terms/",
    priority: "0.5",
    changefreq: "yearly"
  },
  {
    url: "/global-privacy-policy/",
    priority: "0.5",
    changefreq: "yearly"
  },
  {
    url: "/pricing/",
    priority: "0.9",
    changefreq: "weekly"
  },
  {
    url: "/machinery-management-software/",
    priority: "0.9",
    changefreq: "monthly"
  },
  {
    url: "/it-asset-management/",
    priority: "0.9",
    changefreq: "monthly"
  },
  {
    url: "/manufacturing-asset-management-software/",
    priority: "0.8",
    changefreq: "monthly"
  },
  {
    url: "/restaurant-hospitality-asset-management/",
    priority: "0.8",
    changefreq: "monthly"
  },
  {
    url: "/healthcare-asset-tracking/",
    priority: "0.8",
    changefreq: "monthly"
  },
  {
    url: "/construction-equipment-tracking/",
    priority: "0.8",
    changefreq: "monthly"
  },
  {
    url: "/education-asset-management/",
    priority: "0.8",
    changefreq: "monthly"
  },
  {
    url: "/travel-transportation-asset-management/",
    priority: "0.8",
    changefreq: "monthly"
  },
  {
    url: "/blog/",
    priority: "0.8",
    changefreq: "weekly"
  }
];

// Read blogdata.js as plain text
const blogData = fs.readFileSync(blogDataPath, "utf8");

// Extract blog objects using slug and date
const blogEntries = [];

const blogRegex =
  /slug\s*:\s*["']([^"']+)["'][\s\S]*?date\s*:\s*["']([^"']+)["']/g;

let match;

while ((match = blogRegex.exec(blogData)) !== null) {
  const slug = match[1];
  const date = match[2];

  blogEntries.push({
    url: `/blog/${slug}/`,
    lastmod: convertDateToISO(date),
    priority: "0.7",
    changefreq: "monthly"
  });
}

// Convert "September 11, 2026" to "2026-09-11"
function convertDateToISO(dateString) {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().split("T")[0];
}

// Escape XML special characters
function escapeXML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Generate XML
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;

xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n`;

// Static pages
staticPages.forEach((page) => {
  xml += `  <url>\n`;
  xml += `    <loc>${hostname}${page.url}</loc>\n`;
  xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
  xml += `    <priority>${page.priority}</priority>\n`;
  xml += `  </url>\n\n`;
});

// Blog pages
blogEntries.forEach((blog) => {
  xml += `  <url>\n`;
  xml += `    <loc>${hostname}${escapeXML(blog.url)}</loc>\n`;

  if (blog.lastmod) {
    xml += `    <lastmod>${blog.lastmod}</lastmod>\n`;
  }

  xml += `    <changefreq>${blog.changefreq}</changefreq>\n`;
  xml += `    <priority>${blog.priority}</priority>\n`;
  xml += `  </url>\n\n`;
});

xml += `</urlset>\n`;

// Save sitemap
fs.writeFileSync(sitemapPath, xml, "utf8");

console.log("Sitemap generated successfully!");
console.log(`Static pages: ${staticPages.length}`);
console.log(`Blog pages: ${blogEntries.length}`);
console.log(`Total URLs: ${staticPages.length + blogEntries.length}`);
console.log(`Saved to: ${sitemapPath}`);