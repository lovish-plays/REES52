'use client';

import { ExternalLink, PackagePlus, Plus, Trash2 } from 'lucide-react';
import type { LmsComponent } from '@/lib/lms/types';

type RequiredProductsEditorProps = {
  value: LmsComponent[];
  onChange: (products: LmsComponent[]) => void;
  noun?: 'course' | 'project';
};

export default function RequiredProductsEditor({
  value,
  onChange,
  noun = 'course',
}: RequiredProductsEditorProps) {
  const addProduct = () => {
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        name: '',
        quantity: 1,
        productUrl: '',
      },
    ]);
  };

  const updateProduct = (
    index: number,
    field: 'name' | 'quantity' | 'productUrl',
    nextValue: string | number,
  ) => {
    onChange(
      value.map((product, productIndex) =>
        productIndex === index ? { ...product, [field]: nextValue } : product,
      ),
    );
  };

  const removeProduct = (index: number) => {
    onChange(value.filter((_, productIndex) => productIndex !== index));
  };

  return (
    <section className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 md:col-span-2 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-700 text-white">
            <PackagePlus className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-950">
              Products / components required
            </h3>
            <p className="mt-1 max-w-2xl text-xs font-semibold leading-relaxed text-slate-600">
              Add one row for every product students need. Its name and quantity appear in the {noun}
              page, and its own purchase link opens when a student selects it.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={addProduct}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-cyan-600"
        >
          <Plus className="h-4 w-4" />
          Add product
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {value.map((product, index) => {
          const canTestLink = isValidHttpsUrl(product.productUrl);

          return (
            <div
              key={product.id || `product-${index}`}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-800">
                  Product {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  aria-label={`Remove product ${index + 1}`}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-700 transition hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_120px]">
                <label className="space-y-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Display name *
                  <input
                    value={product.name}
                    onChange={(event) => updateProduct(index, 'name', event.target.value)}
                    className={inputClass}
                    placeholder="Arduino Uno R3"
                    required
                    maxLength={120}
                  />
                </label>
                <label className="space-y-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Quantity *
                  <input
                    type="number"
                    min="1"
                    max="999"
                    step="1"
                    value={product.quantity}
                    onChange={(event) =>
                      updateProduct(index, 'quantity', Math.max(1, Number(event.target.value) || 1))
                    }
                    className={inputClass}
                    required
                  />
                </label>
                <label className="space-y-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 md:col-span-2">
                  Purchase link *
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="url"
                      inputMode="url"
                      value={product.productUrl}
                      onChange={(event) => updateProduct(index, 'productUrl', event.target.value)}
                      className={inputClass}
                      placeholder="https://rees52.com/products/..."
                      pattern="https://.*"
                      required
                    />
                    {canTestLink && (
                      <a
                        href={product.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-cyan-900 transition hover:bg-cyan-100"
                      >
                        Test link
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </label>
              </div>
            </div>
          );
        })}

        {value.length === 0 && (
          <button
            type="button"
            onClick={addProduct}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-300 bg-white/70 px-4 py-6 text-xs font-black uppercase tracking-widest text-cyan-800 transition hover:bg-white"
          >
            <Plus className="h-4 w-4" />
            Add the first product
          </button>
        )}
      </div>
    </section>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold normal-case tracking-normal text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100';

function isValidHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
