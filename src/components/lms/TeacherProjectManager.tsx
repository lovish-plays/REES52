'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, Eye, EyeOff, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { createProjectAction, deleteProjectAction, updateProjectAction, type TeacherProject, type TeacherProjectInput } from '@/app/actions/teacherProjects';
import AdminImageUpload from '@/components/admin/AdminImageUpload';
import RequiredProductsEditor from '@/components/lms/RequiredProductsEditor';
import { schoolClassOptions } from '@/lib/lms/class-categories';

const emptyProject: TeacherProjectInput = {
  title: '', slug: '', shortDescription: '', description: '', category: 'Robotics Projects', classLevel: 'Class 6', level: 'Beginner', estimatedTime: 'Self-paced', thumbnailUrl: '', videoUrl: '', circuitDiagramUrl: '', sourceCode: '', steps: [], troubleshooting: [], products: [], isPublished: false,
};

export default function TeacherProjectManager({ initialProjects }: { initialProjects: TeacherProject[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [form, setForm] = useState<TeacherProjectInput>(emptyProject);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const update = <Key extends keyof TeacherProjectInput>(key: Key, value: TeacherProjectInput[Key]) => setForm((current) => ({ ...current, [key]: value }));
  const reset = () => { setForm(emptyProject); setEditingId(null); };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = editingId ? await updateProjectAction({ ...form, id: editingId }) : await createProjectAction(form);
      if (result.error || !result.project) { setMessage({ type: 'error', text: result.error || 'Unable to save this project.' }); return; }
      setProjects((current) => editingId ? current.map((project) => project.id === editingId ? result.project! : project) : [result.project!, ...current]);
      setMessage({ type: 'success', text: editingId ? 'Project updated.' : 'Project created.' });
      reset();
    });
  };

  const remove = (project: TeacherProject) => {
    if (!window.confirm(`Delete "${project.title}"?`)) return;
    startTransition(async () => {
      const result = await deleteProjectAction(project.id);
      if (result.error) { setMessage({ type: 'error', text: result.error }); return; }
      setProjects((current) => current.filter((item) => item.id !== project.id));
      setMessage({ type: 'success', text: 'Project deleted.' });
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-7 md:flex-row md:items-end md:justify-between">
        <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-700">Teacher Studio</p><h1 className="mt-2 text-3xl font-black tracking-wide text-slate-950 md:text-5xl">Project Library</h1><p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-slate-600">Create and publish build guides with class categories, code, steps, and troubleshooting.</p></div>
        <span className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600">{projects.length} total</span>
      </div>

      {message && <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`} role="status">{message.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}{message.text}</div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-6 flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">{editingId ? 'Update content' : 'Create content'}</p><h2 className="mt-1 text-xl font-black text-slate-950">{editingId ? 'Edit project' : 'Add a new project'}</h2></div>{editingId && <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50"><X className="h-4 w-4" /> Cancel</button>}</div>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Field label="Project title" required><input value={form.title} onChange={(event) => { const title = event.target.value; setForm((current) => ({ ...current, title, slug: !editingId && (!current.slug || current.slug === slugify(current.title)) ? slugify(title) : current.slug })); }} className={inputClass} required /></Field>
          <Field label="URL slug" required><input value={form.slug} onChange={(event) => update('slug', slugify(event.target.value))} className={inputClass} required /></Field>
          <Field label="Category" required><input value={form.category} onChange={(event) => update('category', event.target.value)} className={inputClass} required /></Field>
          <Field label="School class" required><select value={form.classLevel} onChange={(event) => update('classLevel', event.target.value as TeacherProjectInput['classLevel'])} className={inputClass}>{schoolClassOptions.map((schoolClass) => <option key={schoolClass}>{schoolClass}</option>)}</select></Field>
          <Field label="Level"><select value={form.level} onChange={(event) => update('level', event.target.value as TeacherProjectInput['level'])} className={inputClass}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></Field>
          <Field label="Estimated time"><input value={form.estimatedTime} onChange={(event) => update('estimatedTime', event.target.value)} className={inputClass} placeholder="3 hours" /></Field>
          <AdminImageUpload label="Project thumbnail" value={form.thumbnailUrl} onChange={(url) => update('thumbnailUrl', url)} scope="projects" />
          <Field label="Video URL"><input type="url" value={form.videoUrl} onChange={(event) => update('videoUrl', event.target.value)} className={inputClass} /></Field>
          <AdminImageUpload label="Circuit diagram" value={form.circuitDiagramUrl} onChange={(url) => update('circuitDiagramUrl', url)} scope="project-diagrams" />
          <Field label="Short description" className="md:col-span-2"><input value={form.shortDescription} onChange={(event) => update('shortDescription', event.target.value)} className={inputClass} /></Field>
          <Field label="Full description" className="md:col-span-2"><textarea rows={4} value={form.description} onChange={(event) => update('description', event.target.value)} className={inputClass} /></Field>
          <Field label="Source code" className="md:col-span-2"><textarea rows={7} value={form.sourceCode} onChange={(event) => update('sourceCode', event.target.value)} className={`${inputClass} font-mono`} /></Field>
          <Field label="Build steps (one per line)"><textarea rows={5} value={form.steps.join('\n')} onChange={(event) => update('steps', splitLines(event.target.value))} className={inputClass} /></Field>
          <Field label="Troubleshooting (one per line)"><textarea rows={5} value={form.troubleshooting.join('\n')} onChange={(event) => update('troubleshooting', splitLines(event.target.value))} className={inputClass} /></Field>
          <RequiredProductsEditor value={form.products} onChange={(products) => update('products', products)} noun="project" />
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 md:col-span-2"><input type="checkbox" checked={form.isPublished} onChange={(event) => update('isPublished', event.target.checked)} className="h-4 w-4 accent-cyan-700" /> Publish now so students can access this project</label>
          <button disabled={isPending} type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-cyan-800 disabled:opacity-60 md:col-span-2">{editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{isPending ? 'Saving...' : editingId ? 'Save changes' : 'Add project'}</button>
        </form>
      </section>

      <section><h2 className="text-xl font-black text-slate-950">Your projects</h2><div className="mt-4 grid gap-4 lg:grid-cols-2">{projects.map((project) => <article key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${project.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{project.isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{project.isPublished ? 'Published' : 'Draft'}</span><span className="rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-violet-800">{project.classLevel}</span><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{project.level}</span></div><h3 className="mt-3 text-lg font-black text-slate-950">{project.title}</h3><p className="mt-1 text-xs font-semibold text-slate-500">/{project.slug}</p><p className="mt-2 text-xs font-bold text-cyan-800">{project.products.length} linked {project.products.length === 1 ? 'product' : 'products'}</p></div></div><p className="mt-4 line-clamp-2 text-sm font-medium leading-relaxed text-slate-600">{project.shortDescription || project.description || 'No description yet.'}</p><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => { setEditingId(project.id); setForm(project); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"><Pencil className="h-4 w-4" /> Edit</button>{project.isPublished && <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50"><Eye className="h-4 w-4" /> View</Link>}<button disabled={isPending} type="button" onClick={() => remove(project)} className="ml-auto inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-rose-700 hover:bg-rose-50 disabled:opacity-50"><Trash2 className="h-4 w-4" /> Delete</button></div></article>)}</div></section>
    </div>
  );
}

function Field({ label, required, className = '', children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) { return <label className={`space-y-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 ${className}`}>{label}{required ? ' *' : ''}{children}</label>; }
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold normal-case tracking-normal text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100';
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function splitLines(value: string) { return value.split(/\n+/).map((line) => line.trim()).filter(Boolean); }
