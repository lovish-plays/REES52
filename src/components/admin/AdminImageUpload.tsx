'use client';

import { useId, useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';

type ImageScope = 'courses' | 'projects' | 'project-diagrams' | 'ebook-covers' | 'products';

interface AdminImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  scope: ImageScope;
  className?: string;
}

export default function AdminImageUpload({
  label,
  value,
  onChange,
  scope,
  className = '',
}: AdminImageUploadProps) {
  const inputId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const uploadImage = async (file?: File) => {
    if (!file) return;

    setMessage(null);
    setIsUploading(true);
    const formData = new FormData();
    formData.set('file', file);
    formData.set('scope', scope);

    try {
      const response = await fetch('/api/admin/images', {
        method: 'POST',
        body: formData,
      });
      const result = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !result.url) {
        throw new Error(result.error || 'The image could not be uploaded.');
      }

      onChange(result.url);
      setMessage({ type: 'success', text: 'Uploaded. Save this content to publish the image.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'The image could not be uploaded.',
      });
    } finally {
      setIsUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={inputId} className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </label>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {/* Admin previews can include previously saved external image URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={`${label} preview`} className="h-44 w-full object-contain" />
          <button
            type="button"
            onClick={() => {
              onChange('');
              setMessage(null);
            }}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 text-white transition hover:bg-rose-600"
            aria-label={`Remove ${label.toLowerCase()}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={isUploading}
          className="flex min-h-44 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center transition hover:border-cyan-400 hover:bg-cyan-50 disabled:cursor-wait disabled:opacity-70"
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-cyan-700" />
          ) : (
            <div className="rounded-full bg-white p-3 text-cyan-700 shadow-sm">
              <ImageIcon className="h-7 w-7" />
            </div>
          )}
          <span className="mt-3 text-xs font-black uppercase tracking-widest text-slate-800">
            {isUploading ? 'Uploading image...' : 'Choose image'}
          </span>
          <span className="mt-1 text-xs font-semibold text-slate-500">JPG, PNG, WebP, or GIF · maximum 5 MB</span>
        </button>
      )}

      {value && (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:opacity-60"
        >
          {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {isUploading ? 'Uploading...' : 'Replace image'}
        </button>
      )}

      <input
        ref={fileInput}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => void uploadImage(event.target.files?.[0])}
      />

      {message && (
        <p
          className={`text-xs font-semibold ${message.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
