"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchAPI } from "@/lib/api";

type BlogCategory = "Guide" | "Comparison" | "Review" | "List" | "News" | "Tutorial";
const BLOG_CATEGORIES: BlogCategory[] = ["Guide", "Comparison", "Review", "List", "News", "Tutorial"];

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: BlogCategory;
  author: string;
  tags: string[];
  read_time: string;
  view_count: number;
  is_published: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  title: "", slug: "", excerpt: "", content: "", cover_image: "",
  category: "Guide" as BlogCategory, author: "Subscriptions BD",
  tags: "", read_time: "", is_published: false,
  meta_title: "", meta_description: "",
};

const CAT_COLORS: Record<string, string> = {
  Guide:      "bg-blue-400/10 text-blue-400 border-blue-400/30",
  Comparison: "bg-purple-400/10 text-purple-400 border-purple-400/30",
  Review:     "bg-amber-400/10 text-amber-400 border-amber-400/30",
  List:       "bg-teal-400/10 text-teal-400 border-teal-400/30",
  News:       "bg-rose-400/10 text-rose-400 border-rose-400/30",
  Tutorial:   "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
};

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("adminToken") ?? "";
}

export default function ManageBlogsPage() {
  const [posts, setPosts]         = useState<BlogPost[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<BlogPost | null>(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState<number | null>(null);
  const [toast, setToast]         = useState("");
  const [preview, setPreview]     = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchPosts = useCallback(() => {
    setLoading(true);
    fetchAPI("/blog", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((d) => setPosts(d.data ?? d.posts ?? d))
      .catch(() => showToast("Failed to load posts."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const slugify = (v: string) =>
    v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setPreview(false);
    setShowForm(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditing(p);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt ?? "",
      content: p.content,
      cover_image: p.cover_image ?? "",
      category: p.category,
      author: p.author,
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
      read_time: p.read_time ?? "",
      is_published: p.is_published,
      meta_title: "",
      meta_description: "",
    });
    setPreview(false);
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    const url    = editing ? `/blog/${editing.id}` : "/blog";
    const method = editing ? "PUT" : "POST";
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      await fetchAPI(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload),
      });
      showToast(editing ? "Post updated!" : "Post created!");
      setShowForm(false);
      fetchPosts();
    } catch {
      showToast("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async () => {
    if (!deleteId) return;
    try {
      await fetchAPI(`/blog/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      showToast("Post deleted.");
    } catch {
      showToast("Delete failed.");
    } finally {
      setDeleteId(null);
      fetchPosts();
    }
  };

  const filtered = posts.filter((p) => {
    const matchCat    = filterCat === "all" || p.category === filterCat;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Admin</p>
          <h1 className="text-xl font-bold text-white">Manage Blogs</h1>
        </div>
        <button
          onClick={openCreate}
          className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-xl font-semibold transition"
        >
          + New Post
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
          />
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-violet-500 transition"
          >
            <option value="all">All Categories</option>
            {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap">
          {["all", ...BLOG_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                filterCat === c
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-slate-400">
          <span>{posts.length} total</span>
          <span>·</span>
          <span className="text-emerald-400">{posts.filter((p) => p.is_published).length} published</span>
          <span>·</span>
          <span className="text-amber-400">{posts.filter((p) => !p.is_published).length} drafts</span>
        </div>

        {/* Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-500 animate-pulse">Loading posts…</div>
          ) : !filtered.length ? (
            <div className="p-10 text-center text-slate-500">No posts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Title</th>
                    <th className="px-5 py-3 text-left">Category</th>
                    <th className="px-5 py-3 text-left">Author</th>
                    <th className="px-5 py-3 text-left">Views</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3 max-w-xs">
                        <div className="flex items-center gap-3">
                          {p.cover_image && (
                            <img src={p.cover_image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-slate-200 font-medium line-clamp-1">{p.title}</p>
                            <p className="text-slate-500 text-xs font-mono">/{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${CAT_COLORS[p.category] ?? ""}`}>
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{p.author}</td>
                      <td className="px-5 py-3 text-slate-400">👁 {p.view_count ?? 0}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          p.is_published
                            ? "bg-green-400/10 text-green-400 border-green-400/30"
                            : "bg-amber-400/10 text-amber-400 border-amber-400/30"
                        }`}>
                          {p.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="text-xs bg-red-900/40 hover:bg-red-900/70 text-red-400 px-3 py-1 rounded-lg transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Blog Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl my-8">

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editing ? "Edit Post" : "New Blog Post"}</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreview(!preview)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    preview
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "border-slate-600 text-slate-400 hover:border-slate-400"
                  }`}
                >
                  {preview ? "✏️ Edit" : "👁 Preview"}
                </button>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
              </div>
            </div>

            {/* Preview Mode */}
            {preview ? (
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {form.cover_image && (
                  <img src={form.cover_image} alt="" className="w-full h-52 object-cover rounded-xl" />
                )}
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${CAT_COLORS[form.category] ?? ""}`}>
                    {form.category}
                  </span>
                  {form.tags.split(",").filter(Boolean).map((t) => (
                    <span key={t} className="px-2.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400 border border-slate-700">
                      {t.trim()}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl font-bold text-white">{form.title || "Untitled Post"}</h2>
                <p className="text-slate-400 text-sm">{form.excerpt}</p>
                <div className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {form.content || <span className="text-slate-600">No content yet…</span>}
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <div className="p-6 space-y-4 text-sm max-h-[75vh] overflow-y-auto">

                {/* Title */}
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })}
                    placeholder="Post title…"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Slug */}
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Slug</label>
                    <input
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 transition"
                    />
                  </div>
                  {/* Category */}
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as BlogCategory })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 transition"
                    >
                      {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {/* Author */}
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Author</label>
                    <input
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 transition"
                    />
                  </div>
                  {/* Read Time */}
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Read Time</label>
                    <input
                      value={form.read_time}
                      onChange={(e) => setForm({ ...form, read_time: e.target.value })}
                      placeholder="e.g. 5 min read"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
                    />
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Cover Image URL</label>
                  <input
                    value={form.cover_image}
                    onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                    placeholder="https://…"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
                  />
                  {form.cover_image && (
                    <img src={form.cover_image} alt="" className="mt-2 w-full h-32 object-cover rounded-xl" />
                  )}
                </div>

                {/* Excerpt */}
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Excerpt</label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    rows={2}
                    placeholder="Short summary shown in listing…"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition resize-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Content</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={10}
                    placeholder="Write your post content here… (Markdown supported)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition resize-y font-mono text-xs leading-relaxed"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Tags (comma separated)</label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="netflix, streaming, guide"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>

                {/* SEO */}
                <div className="border border-slate-800 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">SEO</p>
                  <input
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    placeholder="Meta title"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
                  />
                  <input
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder="Meta description"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>

                {/* Publish Toggle */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    className={`w-10 h-6 rounded-full transition-colors relative ${form.is_published ? "bg-emerald-600" : "bg-slate-700"}`}
                    onClick={() => setForm({ ...form, is_published: !form.is_published })}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_published ? "translate-x-5" : "translate-x-1"}`} />
                  </div>
                  <span className="text-slate-300">{form.is_published ? "Published" : "Draft"}</span>
                </label>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition"
                  >
                    {saving ? "Saving…" : editing ? "Update Post" : "Create Post"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm text-center space-y-4">
            <div className="text-4xl">🗑️</div>
            <p className="text-slate-200 font-semibold">Delete this blog post?</p>
            <p className="text-slate-400 text-sm">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm transition">Cancel</button>
              <button onClick={deletePost} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}