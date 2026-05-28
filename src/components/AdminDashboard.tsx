'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  addCategory, deleteCategory,
  addProduct, deleteProduct,
  addEbook, deleteEbook,
  addVideo, deleteVideo,
  addWebinar, deleteWebinar,
  addNotification, deleteNotification
} from '@/app/actions/admin';
import { getNotifications } from '@/app/actions/content';
import { Plus, Trash2, FolderPlus, Cpu, BookOpen, Video, Radio, Link as LinkIcon, ExternalLink, Bell } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  external_purchase_url: string;
  image_url: string;
  category_id: string;
}

interface Ebook {
  id: string;
  title: string;
  pdf_url: string;
  category_id: string;
  parent_product_id: string;
  created_at: string;
}

interface Video {
  id: string;
  title: string;
  youtube_url: string;
  category_id: string;
  parent_product_id: string;
  created_at: string;
}

interface Webinar {
  id: string;
  title: string;
  description: string;
  meeting_url: string;
  schedule_date: string;
  is_live: boolean;
}

interface AdminDashboardProps {
  categories: Category[];
  products: Product[];
  ebooks: Ebook[];
  videos: Video[];
  webinars: Webinar[];
}

export default function AdminDashboard({
  categories: initialCategories,
  products: initialProducts,
  ebooks: initialEbooks,
  videos: initialVideos,
  webinars: initialWebinars
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'ebooks' | 'videos' | 'webinars' | 'notifications'>('categories');

  // Local state for lists to render CRUD changes instantly
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [ebooks, setEbooks] = useState<Ebook[]>(initialEbooks);
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [webinars, setWebinars] = useState<Webinar[]>(initialWebinars);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Notifications Form States
  const [notifMessage, setNotifMessage] = useState('');
  const [notifLink, setNotifLink] = useState('');

  useEffect(() => {
    async function loadNotifications() {
      const list = await getNotifications();
      setNotifications(list);
    }
    loadNotifications();
  }, []);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- Form States ---
  // Categories
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');

  // Products
  const [prodName, setProdName] = useState('');
  const [prodUrl, setProdUrl] = useState('');
  const [prodCat, setProdCat] = useState('');

  // Ebooks
  const [ebkTitle, setEbkTitle] = useState('');
  const [ebkPdf, setEbkPdf] = useState('');
  const [ebkCat, setEbkCat] = useState('');
  const [ebkProd, setEbkProd] = useState('');

  // Videos
  const [vidTitle, setVidTitle] = useState('');
  const [vidUrl, setVidUrl] = useState('');
  const [vidCat, setVidCat] = useState('');
  const [vidProd, setVidProd] = useState('');

  // Webinars
  const [webTitle, setWebTitle] = useState('');
  const [webDesc, setWebDesc] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [webDate, setWebDate] = useState('');
  const [webLive, setWebLive] = useState(false);

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  // --- CRUD handlers ---

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catSlug) return;
    setLoading(true);
    const res = await addCategory(catName, catSlug);
    setLoading(false);
    if (res.success && res.category) {
      setCategories(prev => [...prev, res.category as Category]);
      setCatName('');
      setCatSlug('');
      showMsg('Category added successfully!', 'success');
      router.refresh();
    } else {
      showMsg(res.error || 'Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const res = await deleteCategory(id);
    if (res.success) {
      setCategories(prev => prev.filter(c => c.id !== id));
      showMsg('Category deleted.', 'success');
      router.refresh();
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodUrl || !prodCat) {
      showMsg('Please fill in all product fields', 'error');
      return;
    }
    setLoading(true);
    const res = await addProduct({
      name: prodName,
      external_purchase_url: prodUrl,
      image_url: '',
      category_id: prodCat
    });
    setLoading(false);
    if (res.success && res.product) {
      setProducts(prev => [...prev, res.product as Product]);
      setProdName('');
      setProdUrl('');
      setProdCat('');
      showMsg('Product added successfully!', 'success');
      router.refresh();
    } else {
      showMsg(res.error || 'Failed to add product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const res = await deleteProduct(id);
    if (res.success) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showMsg('Product deleted.', 'success');
      router.refresh();
    }
  };

  const handleAddEbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ebkTitle || !ebkPdf || !ebkCat || !ebkProd) {
      showMsg('Please fill in all Ebook fields', 'error');
      return;
    }
    setLoading(true);
    const res = await addEbook({
      title: ebkTitle,
      pdf_url: ebkPdf,
      category_id: ebkCat,
      parent_product_id: ebkProd
    });
    setLoading(false);
    if (res.success && res.ebook) {
      setEbooks(prev => [...prev, res.ebook as Ebook]);
      setEbkTitle('');
      setEbkPdf('');
      setEbkCat('');
      setEbkProd('');
      showMsg('Ebook added successfully!', 'success');
      router.refresh();
    } else {
      showMsg(res.error || 'Failed to add Ebook', 'error');
    }
  };

  const handleDeleteEbook = async (id: string) => {
    if (!confirm('Delete this Ebook?')) return;
    const res = await deleteEbook(id);
    if (res.success) {
      setEbooks(prev => prev.filter(e => e.id !== id));
      showMsg('Ebook deleted.', 'success');
      router.refresh();
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vidTitle || !vidUrl || !vidCat || !vidProd) {
      showMsg('Please fill in all video fields', 'error');
      return;
    }
    setLoading(true);
    const res = await addVideo({
      title: vidTitle,
      youtube_url: vidUrl,
      category_id: vidCat,
      parent_product_id: vidProd
    });
    setLoading(false);
    if (res.success && res.video) {
      setVideos(prev => [...prev, res.video as Video]);
      setVidTitle('');
      setVidUrl('');
      setVidCat('');
      setVidProd('');
      showMsg('Video added successfully!', 'success');
      router.refresh();
    } else {
      showMsg(res.error || 'Failed to add video', 'error');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    const res = await deleteVideo(id);
    if (res.success) {
      setVideos(prev => prev.filter(v => v.id !== id));
      showMsg('Video deleted.', 'success');
      router.refresh();
    }
  };

  const handleAddWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webTitle || !webDesc || !webUrl || !webDate) {
      showMsg('Please fill in all webinar fields', 'error');
      return;
    }
    setLoading(true);
    const res = await addWebinar({
      title: webTitle,
      description: webDesc,
      meeting_url: webUrl,
      schedule_date: webDate,
      is_live: webLive
    });
    setLoading(false);
    if (res.success && res.webinar) {
      setWebinars(prev => [...prev, res.webinar as Webinar]);
      setWebTitle('');
      setWebDesc('');
      setWebUrl('');
      setWebDate('');
      setWebLive(false);
      showMsg('Webinar scheduled successfully!', 'success');
      router.refresh();
    } else {
      showMsg(res.error || 'Failed to schedule webinar', 'error');
    }
  };

  const handleDeleteWebinar = async (id: string) => {
    if (!confirm('Cancel this webinar?')) return;
    const res = await deleteWebinar(id);
    if (res.success) {
      setWebinars(prev => prev.filter(w => w.id !== id));
      showMsg('Webinar deleted.', 'success');
      router.refresh();
    }
  };

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifMessage) return;
    setLoading(true);
    const res = await addNotification(notifMessage, notifLink);
    setLoading(false);
    if (res.success && res.notification) {
      setNotifications(prev => [res.notification, ...prev]);
      
      // Trigger real-time broadcast
      try {
        await supabase.channel('realtime-notifications').send({
          type: 'broadcast',
          event: 'new-notification',
          payload: {
            id: res.notification.id,
            message: notifMessage,
            link: notifLink || '',
            created_at: res.notification.created_at
          }
        });
      } catch (err) {
        console.error("Realtime broadcast failed:", err);
      }

      setNotifMessage('');
      setNotifLink('');
      showMsg('Notification posted successfully!', 'success');
    } else {
      showMsg(res.error || 'Failed to post notification. Make sure you ran the Supabase schema script to create the notifications table.', 'error');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    const res = await deleteNotification(id);
    if (res.success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      showMsg('Notification deleted.', 'success');
    } else {
      showMsg(res.error || 'Failed to delete notification', 'error');
    }
  };


  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6 text-slate-800">
      
      {/* Title */}
      <div className="border-b border-slate-200/50 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-amber-500 tracking-wider">
          SYSTEM ADMINISTRATOR CONSOLE
        </h1>
        <p className="text-xs text-slate-600 uppercase tracking-widest mt-1">
          Deploy categories, inventory kits, and curriculum modules.
        </p>
      </div>

      {/* Message Popup */}
      {msg && (
        <div className={`p-4 rounded-xl border text-xs font-bold uppercase tracking-wider ${
          msg.type === 'success'
            ? 'bg-cyan-50 border-cyan-300 text-slate-900 shadow-sm'
            : 'bg-red-50 border-red-200 text-red-800'
        } animate-fade-in`}>
          {msg.text}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200/55 pb-1 overflow-x-auto gap-2">
        {[
          { id: 'categories', label: 'Categories', icon: FolderPlus },
          { id: 'products', label: 'Products (Kits)', icon: Cpu },
          { id: 'ebooks', label: 'Ebooks (PDFs)', icon: BookOpen },
          { id: 'videos', label: 'Videos (YouTube)', icon: Video },
          { id: 'webinars', label: 'Live Webinars', icon: Radio },
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest transition-all rounded-lg flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'text-slate-900 border-b-2 border-cyan-600 font-black bg-cyan-50/55'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Input form (5 cols) */}
        <div className="lg:col-span-5">
          <div className="glassmorphism p-6 rounded-2xl border border-slate-200/50">
            
            {/* Category Form */}
            {activeTab === 'categories' && (
              <form onSubmit={handleAddCategory} className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-cyan-600 font-bold mb-4">Add Category</h3>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => {
                      setCatName(e.target.value);
                      setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }}
                    placeholder="Robotics & AI"
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-800 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Slug</label>
                  <input
                    type="text"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    placeholder="robotics-ai"
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-800 text-xs"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 glass-btn-cyan font-bold uppercase text-[10px] tracking-widest rounded-xl cursor-pointer"
                >
                  Create Category
                </button>
              </form>
            )}

            {/* Product Form */}
            {activeTab === 'products' && (
              <form onSubmit={handleAddProduct} className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-cyan-600 font-bold mb-4">Add Hardware Product</h3>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Uno Robot Car Kit"
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-800 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Infinity Purchase URL</label>
                  <input
                    type="url"
                    value={prodUrl}
                    onChange={(e) => setProdUrl(e.target.value)}
                    placeholder="https://rees52.com/..."
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-800 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Category Bind</label>
                  <select
                    value={prodCat}
                    onChange={(e) => setProdCat(e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-700 text-xs cursor-pointer"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 glass-btn-cyan font-bold uppercase text-[10px] tracking-widest rounded-xl cursor-pointer"
                >
                  Create Product
                </button>
              </form>
            )}

            {/* Ebooks Form */}
            {activeTab === 'ebooks' && (
              <form onSubmit={handleAddEbook} className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-cyan-600 font-bold mb-4">Upload local Ebook</h3>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={ebkTitle}
                    onChange={(e) => setEbkTitle(e.target.value)}
                    placeholder="Arduino Programming Guide"
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-800 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Category Bind</label>
                  <select
                    value={ebkCat}
                    onChange={(e) => setEbkCat(e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-700 text-xs"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Parent Hardware Bind</label>
                  <select
                    value={ebkProd}
                    onChange={(e) => setEbkProd(e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-700 text-xs"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* PDF URL input */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">PDF File URL</label>
                  <input
                    type="url"
                    value={ebkPdf}
                    onChange={(e) => setEbkPdf(e.target.value)}
                    placeholder="https://drive.google.com/... or https://yourcdn.com/guide.pdf"
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-800 text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 glass-btn-cyan font-bold uppercase text-[10px] tracking-widest rounded-xl cursor-pointer"
                >
                  Create Ebook Entry
                </button>
              </form>
            )}

            {/* Videos Form */}
            {activeTab === 'videos' && (
              <form onSubmit={handleAddVideo} className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-cyan-600 font-bold mb-4">Add Video Lecture</h3>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={vidTitle}
                    onChange={(e) => setVidTitle(e.target.value)}
                    placeholder="Blink LED Setup Guide"
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-800 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">YouTube URL</label>
                  <input
                    type="url"
                    value={vidUrl}
                    onChange={(e) => setVidUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-800 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Category Bind</label>
                  <select
                    value={vidCat}
                    onChange={(e) => setVidCat(e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-700 text-xs"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Parent Hardware Bind</label>
                  <select
                    value={vidProd}
                    onChange={(e) => setVidProd(e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-700 text-xs"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 glass-btn-cyan font-bold uppercase text-[10px] tracking-widest rounded-xl cursor-pointer"
                >
                  Create Video Module
                </button>
              </form>
            )}

            {/* Webinars Form */}
            {activeTab === 'webinars' && (
              <form onSubmit={handleAddWebinar} className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-cyan-600 font-bold mb-4">Schedule Live Webinar</h3>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={webTitle}
                    onChange={(e) => setWebTitle(e.target.value)}
                    placeholder="Drone Assembly Lab"
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-800 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Description</label>
                  <textarea
                    value={webDesc}
                    onChange={(e) => setWebDesc(e.target.value)}
                    placeholder="Live soldering workshop..."
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-800 text-xs h-20 resize-none"
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Zoom / Meet URL</label>
                  <input
                    type="url"
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-800 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Schedule Date / Time</label>
                  <input
                    type="datetime-local"
                    value={webDate}
                    onChange={(e) => setWebDate(e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-800 text-xs"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="webLive"
                    checked={webLive}
                    onChange={(e) => setWebLive(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 bg-white text-cyan-600 focus:ring-cyan-500"
                  />
                  <label htmlFor="webLive" className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold select-none">
                    Broadcast status as live now
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 glass-btn-cyan font-bold uppercase text-[10px] tracking-widest rounded-xl cursor-pointer"
                >
                  Schedule Stream
                </button>
              </form>
            )}

            {/* Notification Form */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleAddNotification} className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-cyan-600 font-bold mb-4">Post Broadcast Notification</h3>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Notification Message</label>
                  <textarea
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    placeholder="E.g., New Arduino video lecture has been released! Check it out."
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-800 text-xs h-24 resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Redirect Link (Optional)</label>
                  <input
                    type="url"
                    value={notifLink}
                    onChange={(e) => setNotifLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 glass-input rounded-xl text-slate-800 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 glass-btn-cyan font-bold uppercase text-[10px] tracking-widest rounded-xl cursor-pointer"
                >
                  Post & Broadcast
                </button>
              </form>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Table listings (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glassmorphism p-6 rounded-2xl border border-slate-200/50 overflow-x-auto">
            <h3 className="text-xs uppercase tracking-widest text-cyan-600 font-bold mb-4">
              Registered {activeTab}
            </h3>

            {/* Categories Table */}
            {activeTab === 'categories' && (
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200/50 text-slate-500 uppercase tracking-wider text-[9px]">
                    <th className="py-2">Name</th>
                    <th className="py-2">Slug</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">{c.name}</td>
                      <td className="py-3 font-mono text-slate-500">{c.slug}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Products Table */}
            {activeTab === 'products' && (
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200/50 text-slate-500 uppercase tracking-wider text-[9px]">
                    <th className="py-2">Product Name</th>
                    <th className="py-2">Bound Category</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const cat = categories.find(c => c.id === p.category_id);
                    return (
                      <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-2 font-bold text-slate-900 max-w-[150px] truncate">{p.name}</td>
                        <td className="py-2 text-slate-500">{cat?.name || 'Unbound'}</td>
                        <td className="py-2 text-right flex justify-end gap-1">
                          <a
                            href={p.external_purchase_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Ebooks Table */}
            {activeTab === 'ebooks' && (
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200/50 text-slate-500 uppercase tracking-wider text-[9px]">
                    <th className="py-2">Title</th>
                    <th className="py-2">Hardware Binding</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ebooks.map((e) => {
                    const prod = products.find(p => p.id === e.parent_product_id);
                    return (
                      <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-semibold text-slate-900 max-w-[160px] truncate">{e.title}</td>
                        <td className="py-3 text-slate-500 font-mono text-[10px] truncate max-w-[120px]">{prod?.name || 'None'}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteEbook(e.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Videos Table */}
            {activeTab === 'videos' && (
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200/50 text-slate-500 uppercase tracking-wider text-[9px]">
                    <th className="py-2">Title</th>
                    <th className="py-2">YouTube ID</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((v) => (
                    <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-semibold text-slate-900 max-w-[160px] truncate">{v.title}</td>
                      <td className="py-3 text-slate-500 font-mono text-[10px] truncate max-w-[120px]">{v.youtube_url.split('v=')[1] || 'URL'}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteVideo(v.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Webinars Table */}
            {activeTab === 'webinars' && (
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200/50 text-slate-500 uppercase tracking-wider text-[9px]">
                    <th className="py-2">Title</th>
                    <th className="py-2">Live Now</th>
                    <th className="py-2">Meet Link</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {webinars.map((w) => (
                    <tr key={w.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-semibold text-slate-900 max-w-[140px] truncate">{w.title}</td>
                      <td className="py-3">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${w.is_live ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-500'}`}>
                          {w.is_live ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[10px] text-cyan-600 max-w-[120px] truncate">{w.meeting_url}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteWebinar(w.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Notifications Table */}
            {activeTab === 'notifications' && (
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200/50 text-slate-500 uppercase tracking-wider text-[9px]">
                    <th className="py-2">Message</th>
                    <th className="py-2">Redirect Link</th>
                    <th className="py-2">Posted At</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((n) => (
                    <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-semibold text-slate-900 max-w-[200px] truncate">{n.message}</td>
                      <td className="py-3 font-mono text-[10px] text-cyan-600 max-w-[150px] truncate">
                        {n.link ? (
                          <a href={n.link} target="_blank" rel="noreferrer" className="underline hover:text-cyan-800">
                            {n.link}
                          </a>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-3 text-slate-500 text-[10px]">
                        {new Date(n.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteNotification(n.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {notifications.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        No notifications posted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
