"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchAPI } from "@/lib/api";

interface Category { id: number; name: string; slug: string; }

interface Plan {
  id?: number;
  name: string;
  duration: string;
  duration_days: number;
  price: string;
  original_price: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  base_price: number;
  original_price: number;
  image: string;
  badge: string;
  delivery_time: string;
  is_featured: boolean;
  in_stock: boolean;
  is_active: boolean;
  avg_rating: number;
  review_count: number;
  sales_count: number;
  category_id: number;
  meta_title: string;
  meta_description: string;
  stock_quantity: number;
  warranty: string;
  tags: string;
  category?: Category;
  product_plans?: Plan[];
}

const EMPTY_PLAN: Plan = {
  name: "", duration: "", duration_days: 30,
  price: "", original_price: "",
  is_popular: false, is_active: true, sort_order: 0,
};

const EMPTY_FORM = {
  category_id: "", name: "", slug: "", short_description: "", description: "",
  base_price: "", original_price: "", image: "", badge: "",
  delivery_time: "Instant", is_featured: false, in_stock: true, is_active: true,
  meta_title: "", meta_description: "",
  stock_quantity: "", warranty: "", tags: "",
};

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("adminToken") ?? "";
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={onChange}
        className={`w-9 h-5 rounded-full relative transition-colors ${value ? "bg-violet-600" : "bg-slate-700"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
      <span className="text-slate-300 text-sm">{label}</span>
    </label>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">{title}</span>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}

export default function ManageProductsPage() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<Product | null>(null);
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState<number | null>(null);
  const [toast, setToast]           = useState("");
  const [toastType, setToastType]   = useState<"success" | "error">("success");
  const [form, setForm]             = useState(EMPTY_FORM);
  const [plans, setPlans]           = useState<Plan[]>([]);
  const [activeTab, setActiveTab]   = useState<"basic" | "details" | "seo" | "plans">("basic");
  const [imageMode, setImageMode]   = useState<"url" | "upload">("url");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 3500);
  };

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetchAPI("/products"),
      fetchAPI("/categories"),
    ])
      .then(([p, c]) => {
        setProducts(p.data ?? p.products ?? p);
        setCategories(c.data ?? c.categories ?? c);
      })
      .catch(() => showToast("Failed to load data.", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const slugify = (v: string) =>
    v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setPlans([]);
    setActiveTab("basic");
    setImageMode("url");
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      category_id:       String(p.category_id),
      name:              p.name,
      slug:              p.slug,
      short_description: p.short_description ?? "",
      description:       p.description ?? "",
      base_price:        String(p.base_price),
      original_price:    String(p.original_price ?? ""),
      image:             p.image ?? "",
      badge:             p.badge ?? "",
      delivery_time:     p.delivery_time ?? "Instant",
      is_featured:       p.is_featured,
      in_stock:          p.in_stock,
      is_active:         p.is_active,
      meta_title:        p.meta_title ?? "",
      meta_description:  p.meta_description ?? "",
      stock_quantity:    String(p.stock_quantity ?? ""),
      warranty:          p.warranty ?? "",
      tags:              p.tags ?? "",
    });
    setPlans(p.product_plans ?? []);
    setActiveTab("basic");
    setImageMode("url");
    setShowForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!form.name) { showToast("Product name is required.", "error"); return; }
    if (!form.category_id) { showToast("Please select a category.", "error"); return; }
    if (!form.base_price) { showToast("Base price is required.", "error"); return; }

    setSaving(true);
    const url    = editing ? `/products/${editing.id}` : "/products";
    const method = editing ? "PUT" : "POST";
    try {
      await fetchAPI(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ ...form, plans }),
      });
      showToast(editing ? "Product updated!" : "Product created!");
      setShowForm(false);
      fetchAll();
    } catch {
      showToast("Save failed. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!deleteId) return;
    try {
      await fetchAPI(`/products/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      showToast("Product deleted.");
    } catch {
      showToast("Delete failed.", "error");
    } finally {
      setDeleteId(null);
      fetchAll();
    }
  };

  const addPlan    = () => setPlans((p) => [...p, { ...EMPTY_PLAN }]);
  const removePlan = (i: number) => setPlans((p) => p.filter((_, idx) => idx !== i));
  const updatePlan = (i: number, field: keyof Plan, value: unknown) =>
    setPlans((p) => p.map((pl, idx) => (idx === i ? { ...pl, [field]: value } : pl)));

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition text-sm";
  const labelCls = "text-xs text-slate-400 uppercase tracking-wider block mb-1.5 font-medium";

  const tabs = [
    { key: "basic",   label: "Basic Info" },
    { key: "details", label: "Details" },
    { key: "seo",     label: "SEO" },
    { key: "plans",   label: `Plans (${plans.length})` },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
          toastType === "success" ? "bg-emerald-600" : "bg-red-600"
        }`}>
          {toastType === "success" ? "✓" : "✕"} {toast}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Admin</p>
          <h1 className="text-xl font-bold text-white">Manage Products</h1>
        </div>
        <button
          onClick={openCreate}
          className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Add Product
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* Search + Stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
          />
          <span className="text-xs text-slate-500">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">📦</div>
            <p>No products found.</p>
            <button onClick={openCreate} className="mt-4 text-violet-400 hover:text-violet-300 text-sm underline">
              Create your first product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition group"
              >
                <div className="h-36 bg-slate-800 relative overflow-hidden">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600">📦</div>
                  )}
                  {p.badge && (
                    <span className="absolute top-2 left-2 bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full">{p.badge}</span>
                  )}
                  {!p.is_active && (
                    <span className="absolute top-2 right-2 bg-red-600/80 text-white text-xs px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                  {p.is_featured && (
                    <span className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-xs px-2 py-0.5 rounded-full">⭐ Featured</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-200 truncate">{p.name}</h3>
                  <p className="text-xs text-slate-500 mb-2">{p.category?.name}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-emerald-400 font-bold">৳{Number(p.base_price).toLocaleString()}</span>
                      {p.original_price && Number(p.original_price) > Number(p.base_price) && (
                        <span className="text-slate-600 text-xs line-through ml-2">৳{Number(p.original_price).toLocaleString()}</span>
                      )}
                    </div>
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Product Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl my-8">

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{editing ? "Edit Product" : "New Product"}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{editing ? `Editing: ${editing.name}` : "Fill in the details to create a new product"}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition">×</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 px-6">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition border-b-2 -mb-px ${
                    activeTab === t.key
                      ? "border-violet-500 text-violet-400"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4 text-sm max-h-[70vh] overflow-y-auto">

              {/* ── TAB: Basic Info ── */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <SectionHeader title="Product Identity" />

                  {/* Category */}
                  <div>
                    <label className={labelCls}>Category <span className="text-red-400">*</span></label>
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                      className={inputCls}
                    >
                      <option value="">Select category…</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Name */}
                  <div>
                    <label className={labelCls}>Product Name <span className="text-red-400">*</span></label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
                      placeholder="e.g. Netflix Premium"
                      className={inputCls}
                    />
                  </div>

                  {/* Slug + Badge */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Slug</label>
                      <input
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Badge</label>
                      <input
                        value={form.badge}
                        onChange={(e) => setForm({ ...form, badge: e.target.value })}
                        placeholder="e.g. Hot, New, Sale"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <SectionHeader title="Pricing" />

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Base Price (৳) <span className="text-red-400">*</span></label>
                      <input
                        type="number"
                        min="0"
                        value={form.base_price}
                        onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                        placeholder="0"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Original Price (৳)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.original_price}
                        onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                        placeholder="0"
                        className={inputCls}
                      />
                      <p className="text-xs text-slate-600 mt-1">Used for showing strikethrough discount</p>
                    </div>
                  </div>

                  <SectionHeader title="Image" />

                  {/* Image toggle */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setImageMode("url")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${imageMode === "url" ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
                    >
                      URL
                    </button>
                    <button
                      onClick={() => setImageMode("upload")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${imageMode === "upload" ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
                    >
                      Upload File
                    </button>
                  </div>

                  {imageMode === "url" ? (
                    <div>
                      <label className={labelCls}>Image URL</label>
                      <input
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className={inputCls}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className={labelCls}>Upload Image</label>
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-700 hover:border-violet-500 rounded-xl cursor-pointer transition bg-slate-800/50 hover:bg-slate-800">
                        <span className="text-2xl mb-1">📁</span>
                        <span className="text-xs text-slate-400">Click to upload (JPG, PNG, WebP)</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  )}

                  {form.image && (
                    <div className="relative inline-block">
                      <img src={form.image} alt="Preview" className="h-28 w-auto rounded-xl object-cover border border-slate-700" />
                      <button
                        onClick={() => setForm({ ...form, image: "" })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-500 transition"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <SectionHeader title="Visibility" />

                  {/* Toggles */}
                  <div className="flex gap-6 flex-wrap">
                    <Toggle value={form.is_featured} onChange={() => setForm({ ...form, is_featured: !form.is_featured })} label="Featured" />
                    <Toggle value={form.in_stock}    onChange={() => setForm({ ...form, in_stock: !form.in_stock })}       label="In Stock" />
                    <Toggle value={form.is_active}   onChange={() => setForm({ ...form, is_active: !form.is_active })}     label="Active"   />
                  </div>
                </div>
              )}

              {/* ── TAB: Details ── */}
              {activeTab === "details" && (
                <div className="space-y-4">
                  <SectionHeader title="Descriptions" />

                  <div>
                    <label className={labelCls}>Short Description</label>
                    <textarea
                      value={form.short_description}
                      onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                      rows={2}
                      placeholder="Brief summary shown in product cards…"
                      className={`${inputCls} resize-none`}
                    />
                    <p className="text-xs text-slate-600 mt-1">{form.short_description.length} / 200 characters</p>
                  </div>

                  <div>
                    <label className={labelCls}>Full Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={6}
                      placeholder="Detailed product description. Supports plain text. You can include features, usage instructions, terms, etc."
                      className={`${inputCls} resize-y`}
                    />
                    <p className="text-xs text-slate-600 mt-1">{form.description.length} characters</p>
                  </div>

                  <SectionHeader title="Additional Info" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Delivery Time</label>
                      <select
                        value={form.delivery_time}
                        onChange={(e) => setForm({ ...form, delivery_time: e.target.value })}
                        className={inputCls}
                      >
                        <option value="Instant">Instant</option>
                        <option value="1-2 hours">1-2 hours</option>
                        <option value="2-4 hours">2-4 hours</option>
                        <option value="Same day">Same day</option>
                        <option value="1-2 days">1-2 days</option>
                        <option value="Custom">Custom</option>
                      </select>
                      {form.delivery_time === "Custom" && (
                        <input
                          value={form.delivery_time}
                          onChange={(e) => setForm({ ...form, delivery_time: e.target.value })}
                          placeholder="e.g. Within 6 hours"
                          className={`${inputCls} mt-2`}
                        />
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={form.stock_quantity}
                        onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                        placeholder="Leave empty for unlimited"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Warranty / Validity</label>
                      <input
                        value={form.warranty}
                        onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                        placeholder="e.g. 30 days replacement"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Tags</label>
                      <input
                        value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                        placeholder="e.g. streaming, hd, family (comma separated)"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: SEO ── */}
              {activeTab === "seo" && (
                <div className="space-y-4">
                  <SectionHeader title="Search Engine Optimization" />

                  <div>
                    <label className={labelCls}>Meta Title</label>
                    <input
                      value={form.meta_title}
                      onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                      placeholder="Page title shown in search results"
                      className={inputCls}
                    />
                    <p className="text-xs text-slate-600 mt-1">
                      {form.meta_title.length}/60 characters
                      {form.meta_title.length > 60 && <span className="text-amber-400 ml-2">⚠ Too long</span>}
                    </p>
                  </div>

                  <div>
                    <label className={labelCls}>Meta Description</label>
                    <textarea
                      value={form.meta_description}
                      onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                      rows={3}
                      placeholder="Brief description shown in search results"
                      className={`${inputCls} resize-none`}
                    />
                    <p className="text-xs text-slate-600 mt-1">
                      {form.meta_description.length}/160 characters
                      {form.meta_description.length > 160 && <span className="text-amber-400 ml-2">⚠ Too long</span>}
                    </p>
                  </div>

                  {/* SEO Preview */}
                  {(form.meta_title || form.meta_description) && (
                    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Search Preview</p>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">subscriptionsbd.com/products/{form.slug || "product-slug"}</p>
                        <p className="text-blue-400 text-sm font-medium">{form.meta_title || form.name || "Product Title"}</p>
                        <p className="text-slate-400 text-xs leading-relaxed">{form.meta_description || form.short_description || "No description provided."}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: Plans ── */}
              {activeTab === "plans" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <SectionHeader title="Pricing Plans" />
                    <button
                      onClick={addPlan}
                      className="text-xs bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 border border-violet-500/30 px-3 py-1.5 rounded-lg transition font-medium"
                    >
                      + Add Plan
                    </button>
                  </div>

                  {plans.length === 0 && (
                    <div className="text-center py-10 text-slate-600">
                      <div className="text-3xl mb-3">📋</div>
                      <p className="text-sm">No pricing plans yet.</p>
                      <button onClick={addPlan} className="mt-3 text-violet-400 hover:text-violet-300 text-xs underline">
                        Add your first plan
                      </button>
                    </div>
                  )}

                  {plans.map((pl, i) => (
                    <div key={i} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan #{i + 1}</span>
                        <button
                          onClick={() => removePlan(i)}
                          className="text-xs text-red-400 hover:text-red-300 transition px-2 py-1 rounded hover:bg-red-900/20"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Plan Name</label>
                          <input
                            value={pl.name}
                            onChange={(e) => updatePlan(i, "name", e.target.value)}
                            placeholder="e.g. 1 Month"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-violet-500 transition"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Duration Label</label>
                          <input
                            value={pl.duration}
                            onChange={(e) => updatePlan(i, "duration", e.target.value)}
                            placeholder="e.g. 30 Days"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-violet-500 transition"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Duration (days)</label>
                          <input
                            type="number"
                            value={pl.duration_days}
                            onChange={(e) => updatePlan(i, "duration_days", Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-violet-500 transition"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Sort Order</label>
                          <input
                            type="number"
                            value={pl.sort_order}
                            onChange={(e) => updatePlan(i, "sort_order", Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-violet-500 transition"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Price (৳)</label>
                          <input
                            type="number"
                            value={pl.price}
                            onChange={(e) => updatePlan(i, "price", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-violet-500 transition"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Original Price (৳)</label>
                          <input
                            type="number"
                            value={pl.original_price}
                            onChange={(e) => updatePlan(i, "original_price", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-violet-500 transition"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 pt-1">
                        <Toggle value={pl.is_popular} onChange={() => updatePlan(i, "is_popular", !pl.is_popular)} label="Popular" />
                        <Toggle value={pl.is_active}  onChange={() => updatePlan(i, "is_active", !pl.is_active)}  label="Active"  />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  editing ? "Update Product" : "Create Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm text-center space-y-4">
            <div className="text-4xl">🗑️</div>
            <p className="text-slate-200 font-semibold">Delete this product?</p>
            <p className="text-slate-400 text-sm">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm transition">Cancel</button>
              <button onClick={deleteProduct} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}