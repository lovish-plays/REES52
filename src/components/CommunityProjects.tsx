"use client";

import { useState, useEffect } from "react";
import { Sparkles, Image as ImageIcon, Send, X, Cpu, Heart, CheckCircle2, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface CommunityProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  author: string;
  imageUrl: string;
  likes: number;
  created_at: string;
}

const SEED_PROJECTS: CommunityProject[] = [];

const PRESETS = [
  "https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=60"
];

export default function CommunityProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [likedProjects, setLikedProjects] = useState<string[]>([]);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("rees_community_projects");
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProjects(JSON.parse(stored));
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProjects(SEED_PROJECTS);
        localStorage.setItem("rees_community_projects", JSON.stringify(SEED_PROJECTS));
      }

      const storedLikes = localStorage.getItem("rees_community_likes");
      if (storedLikes) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLikedProjects(JSON.parse(storedLikes));
      }
    }
  }, []);

  const handleLike = (id: string) => {
    let updatedLikes = [...likedProjects];
    const updatedProjects = projects.map(p => {
      if (p.id === id) {
        if (likedProjects.includes(id)) {
          updatedLikes = updatedLikes.filter(item => item !== id);
          return { ...p, likes: p.likes - 1 };
        } else {
          updatedLikes.push(id);
          return { ...p, likes: p.likes + 1 };
        }
      }
      return p;
    });

    setProjects(updatedProjects);
    setLikedProjects(updatedLikes);
    localStorage.setItem("rees_community_projects", JSON.stringify(updatedProjects));
    localStorage.setItem("rees_community_likes", JSON.stringify(updatedLikes));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!title.trim() || !description.trim() || !techInput.trim()) {
      setFormError("Please fill out all fields.");
      return;
    }

    const techArray = techInput
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);

    const newProject: CommunityProject = {
      id: "proj-" + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      description: description.trim(),
      technologies: techArray,
      author: user?.name || "Anonymous Maker",
      imageUrl: selectedPreset,
      likes: 0,
      created_at: new Date().toISOString()
    };

    const nextProjects = [newProject, ...projects];
    setProjects(nextProjects);
    localStorage.setItem("rees_community_projects", JSON.stringify(nextProjects));

    // Reset Form
    setTitle("");
    setDescription("");
    setTechInput("");
    setSuccessMsg("Project shared successfully!");
    
    setTimeout(() => {
      setModalOpen(false);
      setSuccessMsg("");
    }, 1500);
  };

  return (
    <div className="space-y-6 my-8" id="community-projects-section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-600 animate-pulse" /> Community Projects
          </h2>
          <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest mt-1">
            See what other students are building and share your own creations!
          </p>
        </div>
        
        <button
          onClick={() => {
            if (!user) {
              alert("Please sign in to share a project!");
              return;
            }
            setModalOpen(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all cursor-pointer shadow-md hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <span>Share Your Project</span>
        </button>
      </div>

      {/* Grid of Projects */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-10 text-center shadow-sm">
          <p className="text-sm font-black text-slate-800 uppercase">No community projects shared yet.</p>
          <p className="mt-2 text-[11px] text-slate-500 font-medium">Be the first to share your awesome hardware build with the academy!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const isLiked = likedProjects.includes(proj.id);
            return (
              <div
                key={proj.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:border-cyan-500/35 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                <div>
                  {/* Visual Cover Frame */}
                  {proj.imageUrl && (
                    <div className="relative w-full h-40 bg-slate-100 overflow-hidden">
                      <img
                        src={proj.imageUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                      />
                      
                      {/* Authorship tag */}
                      <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md text-[8.5px] font-black uppercase tracking-wider bg-slate-900/80 border border-white/10 text-white flex items-center gap-1.5 backdrop-blur-sm">
                        <User className="w-3 h-3 text-cyan-400" />
                        <span>By {proj.author}</span>
                      </span>
                    </div>
                  )}

                  <div className="p-5 space-y-2">
                    <h3 className="text-sm font-black text-slate-900 tracking-wide uppercase leading-tight truncate">
                      {proj.title}
                    </h3>
                    <p className="text-[11px] text-slate-605 leading-relaxed font-medium line-clamp-3">
                      {proj.description}
                    </p>

                    {/* Technologies tags */}
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {proj.technologies.map(t => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md border border-slate-100 bg-slate-50 text-[8.5px] font-black uppercase tracking-wider text-slate-600"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Like button */}
                <div className="mx-5 mb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-400">
                    {new Date(proj.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>

                  <button
                    onClick={() => handleLike(proj.id)}
                    className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isLiked
                        ? "border-rose-200 bg-rose-50 text-rose-600"
                        : "border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-600 text-rose-600" : ""}`} />
                    <span>{proj.likes} Likes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#F7F4EB] text-slate-800 border border-slate-200 shadow-2xl rounded-3xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 z-20 rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 hover:rotate-90 hover:scale-110 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Form scrollable container */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-cyan-700 bg-cyan-100/50 px-2.5 py-1 rounded-md border border-cyan-200 w-fit block">
                  Share Your Project
                </span>
                <h3 className="text-slate-900 text-lg font-black uppercase tracking-wide mt-2">
                  Post to Project Showcase
                </h3>
              </div>

              {formError && (
                <div className="p-3 bg-rose-55 border border-rose-200 rounded-xl text-rose-950 text-[10px] font-black uppercase tracking-wider">
                  {formError}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-55 border border-emerald-200 rounded-xl text-emerald-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Smart Gardening Rover"
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-xs font-semibold outline-none hover:border-slate-350 focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Project Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what your project does, how you built it, and what components were used..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-xs font-semibold outline-none hover:border-slate-350 focus:border-cyan-500 transition-colors resize-none"
                />
              </div>

              {/* Technologies */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Technologies (Comma separated)</label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="e.g. Arduino, ESP32, OpenCV"
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-xs font-semibold outline-none hover:border-slate-350 focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Cover Preset selection */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Select Cover Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSelectedPreset(preset)}
                      className={`relative aspect-video rounded-lg overflow-hidden border cursor-pointer ${
                        selectedPreset === preset
                          ? "border-cyan-500 ring-2 ring-cyan-500/20"
                          : "border-slate-200"
                      }`}
                    >
                      <img src={preset} className="w-full h-full object-cover" />
                      {selectedPreset === preset && (
                        <div className="absolute inset-0 bg-cyan-600/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white fill-cyan-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={Boolean(successMsg)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[9.5px] tracking-widest rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Publish Project</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
