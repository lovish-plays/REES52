'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, Eye, EyeOff, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import {
  createCourseAction,
  deleteCourseAction,
  updateCourseAction,
  type TeacherCourse,
  type TeacherCourseInput,
} from '@/app/actions/teacherContent';
import AdminImageUpload from '@/components/admin/AdminImageUpload';
import { schoolClassOptions } from '@/lib/lms/class-categories';

const emptyCourse: TeacherCourseInput = {
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  category: 'Robotics',
  classLevel: 'Class 6',
  level: 'Beginner',
  duration: 'Self-paced',
  thumbnailUrl: '',
  pricing: 'Free',
  price: 0,
  isPublished: false,
};

export default function TeacherCourseManager({ initialCourses }: { initialCourses: TeacherCourse[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [form, setForm] = useState<TeacherCourseInput>(emptyCourse);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const heading = editingId ? 'Edit course' : 'Add a new course';
  const publishedCount = useMemo(() => courses.filter((course) => course.isPublished).length, [courses]);

  const updateField = <Key extends keyof TeacherCourseInput>(key: Key, value: TeacherCourseInput[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyCourse);
    setEditingId(null);
  };

  const editCourse = (course: TeacherCourse) => {
    setEditingId(course.id);
    setForm(course);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitCourse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = editingId
        ? await updateCourseAction({ ...form, id: editingId })
        : await createCourseAction(form);

      if (result.error || !result.course) {
        setMessage({ type: 'error', text: result.error || 'Unable to save this course.' });
        return;
      }

      const saved = result.course;
      setCourses((current) =>
        editingId
          ? current.map((course) => (course.id === editingId ? saved : course))
          : [saved, ...current]
      );
      setMessage({ type: 'success', text: editingId ? 'Course updated.' : 'Course created.' });
      resetForm();
    });
  };

  const removeCourse = (course: TeacherCourse) => {
    if (!window.confirm(`Delete “${course.title}”? This also removes its modules and lessons.`)) return;

    startTransition(async () => {
      const result = await deleteCourseAction(course.id);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
        return;
      }
      setCourses((current) => current.filter((item) => item.id !== course.id));
      if (editingId === course.id) resetForm();
      setMessage({ type: 'success', text: 'Course deleted.' });
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-700">Teacher Studio</p>
          <h1 className="mt-2 text-3xl font-black tracking-wide text-slate-950 md:text-5xl">Course Content</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-slate-600">
            Create, edit, publish, or remove courses. Published courses are available to students in the learning library.
          </p>
        </div>
        <div className="flex gap-3 text-xs font-black uppercase tracking-widest text-slate-600">
          <span className="rounded-xl border border-slate-200 bg-white px-4 py-3">{courses.length} total</span>
          <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">{publishedCount} published</span>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`} role="status">
          {message.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">{editingId ? 'Update content' : 'Create content'}</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{heading}</h2>
          </div>
          {editingId && (
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50">
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>

        <form onSubmit={submitCourse} className="grid gap-4 md:grid-cols-2">
          <Field label="Course title" required>
            <input
              value={form.title}
              onChange={(event) => {
                const title = event.target.value;
                setForm((current) => ({
                  ...current,
                  title,
                  slug: !editingId && (!current.slug || current.slug === slugify(current.title))
                    ? slugify(title)
                    : current.slug,
                }));
              }}
              className={inputClass}
              placeholder="Arduino foundations"
              required
            />
          </Field>
          <Field label="URL slug" required>
            <input value={form.slug} onChange={(event) => updateField('slug', slugify(event.target.value))} className={inputClass} placeholder="arduino-foundations" required />
          </Field>
          <Field label="Category" required>
            <input value={form.category} onChange={(event) => updateField('category', event.target.value)} className={inputClass} placeholder="Robotics" required />
          </Field>
          <Field label="School class" required>
            <select value={form.classLevel} onChange={(event) => updateField('classLevel', event.target.value as TeacherCourseInput['classLevel'])} className={inputClass}>
              {schoolClassOptions.map((schoolClass) => <option key={schoolClass}>{schoolClass}</option>)}
            </select>
          </Field>
          <Field label="Level">
            <select value={form.level} onChange={(event) => updateField('level', event.target.value as TeacherCourseInput['level'])} className={inputClass}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </Field>
          <Field label="Duration">
            <input value={form.duration} onChange={(event) => updateField('duration', event.target.value)} className={inputClass} placeholder="4 weeks" />
          </Field>
          <AdminImageUpload
            label="Course thumbnail"
            value={form.thumbnailUrl}
            onChange={(url) => updateField('thumbnailUrl', url)}
            scope="courses"
          />
          <Field label="Pricing">
            <select value={form.pricing} onChange={(event) => updateField('pricing', event.target.value as TeacherCourseInput['pricing'])} className={inputClass}>
              <option>Free</option>
              <option>Paid</option>
            </select>
          </Field>
          <Field label="Price">
            <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateField('price', Number(event.target.value))} className={inputClass} disabled={form.pricing === 'Free'} />
          </Field>
          <Field label="Short description" className="md:col-span-2">
            <input value={form.shortDescription} onChange={(event) => updateField('shortDescription', event.target.value)} className={inputClass} placeholder="A one-line summary shown on course cards" />
          </Field>
          <Field label="Full course content" className="md:col-span-2">
            <textarea rows={5} value={form.description} onChange={(event) => updateField('description', event.target.value)} className={inputClass} placeholder="Describe what students will learn…" />
          </Field>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 md:col-span-2">
            <input type="checkbox" checked={form.isPublished} onChange={(event) => updateField('isPublished', event.target.checked)} className="h-4 w-4 accent-cyan-700" />
            Publish now so students can access this course
          </label>

          <button disabled={isPending} type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-60 md:col-span-2">
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isPending ? 'Saving…' : editingId ? 'Save changes' : 'Add course'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-black text-slate-950">Your courses</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {courses.map((course) => (
            <article key={course.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${course.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {course.isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{course.level}</span>
                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-violet-800">{course.classLevel}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-slate-950">{course.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">/{course.slug}</p>
                </div>
              </div>
              <p className="mt-4 line-clamp-2 text-sm font-medium leading-relaxed text-slate-600">{course.shortDescription || course.description || 'No description yet.'}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={() => editCourse(course)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-cyan-300 hover:bg-cyan-50">
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                {course.isPublished && (
                  <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50">
                    <Eye className="h-4 w-4" /> View
                  </Link>
                )}
                <button disabled={isPending} type="button" onClick={() => removeCourse(course)} className="ml-auto inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </article>
          ))}

          {courses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center lg:col-span-2">
              <p className="text-sm font-bold text-slate-600">No courses yet. Use the form above to create the first one.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, required, className = '', children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <label className={`space-y-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 ${className}`}>
      {label}{required ? ' *' : ''}
      {children}
    </label>
  );
}

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold normal-case tracking-normal text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100 disabled:text-slate-400';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
