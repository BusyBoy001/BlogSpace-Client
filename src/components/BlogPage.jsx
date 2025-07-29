import { useState, useEffect } from "react";
import BlogCard from "./BlogCard";
import { SearchContext } from "../SearchContext";
import { useContext } from "react";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const { search, setSearch } = useContext(SearchContext);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();
        if (data.success) {
          setBlogs(data.blogs);
        } else {
          setBlogs([]);
        }
      } catch {
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(blogs.map((b) => b.category)))
  ];

  const filtered = blogs.filter(
    (b) =>
      (category === "All" || b.category === category) &&
      (b.title.toLowerCase().includes(search.toLowerCase()) ||
        (b.content?.blocks?.map(block => block.data?.text || "").join(" ").toLowerCase().includes(search.toLowerCase())))
  );

  // Show up to 3 compact cards from filtered blogs
  const compactBlogs = filtered.slice(0, 3);

  // Helper to get excerpt from content
  const getExcerpt = (content) => {
    if (!content?.blocks) return "";
    const para = content.blocks.find(block => block.type === "paragraph");
    return para ? para.data.text.slice(0, 120) : "";
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Helper to estimate read time
  const getReadTime = (content) => {
    if (!content?.blocks) return "1 min";
    const words = content.blocks.map(block => block.data?.text || "").join(" ").split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 200));
    return `${mins} min`;
  };

  return (
    <div className="min-h-screen bg-lightbg dark:bg-darkbg">
      <div className="max-w-5xl mx-auto py-6 sm:py-8 lg:py-12 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-lighttext dark:text-darktext mb-4 sm:mb-6">All Blogs</h1>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6 sm:mb-8 gap-4">
          {/* Search Box */}
          <div className="relative mb-2 md:mb-0 w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search posts..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-darkbg text-lighttext dark:text-darktext placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent focus:border-lightaccent dark:focus:border-darkaccent transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent w-full md:w-1/4 bg-white dark:bg-darkbg text-lighttext dark:text-darktext text-sm sm:text-base"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="text-center text-lightsecondary dark:text-darksecondary text-sm sm:text-base">Loading blogs...</div>
        ) : (
          <>
            {/* Compact cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {compactBlogs.map((blog, idx) => (
                <BlogCard
                  key={"compact-" + blog._id}
                  id={blog._id}
                  image={blog.featuredImage}
                  category={blog.category}
                  title={blog.title}
                  excerpt={getExcerpt(blog.content)}
                  date={formatDate(blog.createdAt)}
                  readTime={getReadTime(blog.content)}
                  compact
                />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filtered.length ? (
                filtered.map((blog) => (
                  <BlogCard
                    key={blog._id}
                    id={blog._id}
                    image={blog.featuredImage}
                    category={blog.category}
                    title={blog.title}
                    excerpt={getExcerpt(blog.content)}
                    date={formatDate(blog.createdAt)}
                    readTime={getReadTime(blog.content)}
                  />
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-lightsecondary dark:text-darksecondary text-sm sm:text-base py-8">No blogs found.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
