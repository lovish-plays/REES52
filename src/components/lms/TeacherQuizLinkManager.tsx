'use client';

import { useState, useTransition } from 'react';
import { ExternalLink, FileQuestion, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  createTeacherQuizLinkAction,
  deleteTeacherQuizLinkAction,
  updateTeacherQuizLinkAction,
  type TeacherQuizLink,
  type TeacherQuizLinkInput,
} from '@/app/actions/teacherQuizLinks';

const emptyForm: TeacherQuizLinkInput = {
  topic: '',
  description: '',
  quizUrl: '',
};

export default function TeacherQuizLinkManager({
  initialQuizLinks,
}: {
  initialQuizLinks: TeacherQuizLink[];
}) {
  const [quizLinks, setQuizLinks] = useState(initialQuizLinks);
  const [form, setForm] = useState<TeacherQuizLinkInput>(emptyForm);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(form.id);

  function updateForm(field: keyof TeacherQuizLinkInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setMessage('');
  }

  function saveQuizLink() {
    setMessage('');
    startTransition(async () => {
      const result = isEditing
        ? await updateTeacherQuizLinkAction(form)
        : await createTeacherQuizLinkAction(form);

      if (result.error || !result.quizLink) {
        setMessage(result.error || 'Unable to save this quiz link.');
        return;
      }

      setQuizLinks((current) =>
        isEditing
          ? current.map((item) => (item.id === result.quizLink!.id ? result.quizLink! : item))
          : [result.quizLink!, ...current],
      );
      setForm(emptyForm);
      setMessage(isEditing ? 'Quiz link updated.' : 'Quiz link published for students.');
    });
  }

  function editQuizLink(quizLink: TeacherQuizLink) {
    setForm(quizLink);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function removeQuizLink(id: string) {
    if (!window.confirm('Remove this quiz link from the student Quiz Library?')) return;
    setMessage('');
    startTransition(async () => {
      const result = await deleteTeacherQuizLinkAction(id);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setQuizLinks((current) => current.filter((item) => item.id !== id));
      if (form.id === id) setForm(emptyForm);
      setMessage('Quiz link removed.');
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 lg:px-8">
      <div className="border-b border-slate-200 pb-7">
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Teacher Studio</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Quiz Links</h1>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">
          Add a topic name, description and secure quiz link. Saved quizzes appear immediately in the student Quiz Library.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">
              {isEditing ? 'Edit quiz' : 'New quiz'}
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              {isEditing ? 'Update student quiz link' : 'Publish a student quiz link'}
            </h2>
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-5">
          <label className="grid gap-2 text-xs font-black text-slate-800">
            Topic name
            <input
              value={form.topic}
              onChange={(event) => updateForm('topic', event.target.value)}
              maxLength={140}
              placeholder="Example: Arduino Sensor Basics"
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </label>

          <label className="grid gap-2 text-xs font-black text-slate-800">
            Description
            <textarea
              value={form.description}
              onChange={(event) => updateForm('description', event.target.value)}
              maxLength={800}
              rows={4}
              placeholder="Tell students what knowledge this quiz checks."
              className="resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold leading-relaxed text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </label>

          <label className="grid gap-2 text-xs font-black text-slate-800">
            Quiz link
            <input
              type="url"
              value={form.quizUrl}
              onChange={(event) => updateForm('quizUrl', event.target.value)}
              placeholder="https://forms.google.com/..."
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
            <span className="font-medium text-slate-500">Use a secure https:// link. It will open in a new tab for students.</span>
          </label>
        </div>

        {message && (
          <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800" role="status">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={saveQuizLink}
          disabled={isPending || !form.topic.trim() || !form.description.trim() || !form.quizUrl.trim()}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isEditing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isPending ? 'Saving...' : isEditing ? 'Save changes' : 'Add quiz'}
        </button>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Student Quiz Library</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Published quiz links</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
            {quizLinks.length} {quizLinks.length === 1 ? 'quiz' : 'quizzes'}
          </span>
        </div>

        {quizLinks.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {quizLinks.map((quizLink) => (
              <article key={quizLink.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-lg bg-cyan-50 p-2 text-cyan-800">
                    <FileQuestion className="h-5 w-5" />
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => editQuizLink(quizLink)}
                      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      aria-label={`Edit ${quizLink.topic}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuizLink(quizLink.id)}
                      disabled={isPending}
                      className="rounded-lg p-2 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                      aria-label={`Delete ${quizLink.topic}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-950">{quizLink.topic}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{quizLink.description}</p>
                <a
                  href={quizLink.quizUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-black text-cyan-800 hover:text-cyan-950 hover:underline"
                >
                  Test quiz link
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <FileQuestion className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-black text-slate-800">No teacher quiz links have been added yet.</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Use the form above to publish the first one.</p>
          </div>
        )}
      </section>
    </div>
  );
}
