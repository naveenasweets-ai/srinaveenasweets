import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import AppCustomApi from '../../api/app-customize';
import type { CategoryConfig } from '../../types/contextTypes';

export default function Categories() {
  const { siteContent, setSiteContent } = useStore();
  const { saveCategory, updateCategory, deleteCategory, fetchSiteContent } =
    AppCustomApi();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'category' as 'category' | 'subcategory',
    parentId: '',
  });

  const parentCategories = siteContent.categories.filter(
    (item) => item.type !== 'subcategory',
  );
  const activeParentCategoryCount = parentCategories.filter(
    (item) => item.isActive !== false,
  ).length;

  const refresh = async () => {
    const data = await fetchSiteContent();
    setSiteContent((prev) => ({ ...prev, categories: data.categories }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      await updateCategory(editingId, {
        name: form.name,
        description: form.description,
        type: form.type,
        parentId: form.parentId || null,
      });
    } else {
      await saveCategory({
        name: form.name,
        description: form.description,
        type: form.type,
        parentId: form.parentId || null,
        isActive:
          form.type === 'subcategory' || activeParentCategoryCount < 6
            ? true
            : false,
      });
    }

    setForm({
      name: '',
      description: '',
      type: 'category',
      parentId: '',
    });
    setEditingId(null);
    refresh();
  };

  const startEdit = (item: CategoryConfig) => {
    setEditingId(item._id || null);
    setForm({
      name: item.name,
      description: item.description || '',
      type: item.type || 'category',
      parentId: item.parentId || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category and its subcategories?')) return;
    const ok = await deleteCategory(id);
    if (ok) refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[28px] border border-[#f3d48a]/70 bg-[linear-gradient(135deg,#fffdf7_0%,#fff8ef_100%)] p-5 shadow-[0_18px_45px_rgba(95,16,33,0.08)] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d4a017]">
              Menu Builder
            </p>
            <h4 className="text-lg font-semibold text-[#5f1021]">
              {editingId ? 'Edit Menu Item' : 'Create Menu Item'}
            </h4>
          </div>
          <div className="rounded-full border border-[#f3d48a]/70 bg-[#f3d48a]/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#7a440d]">
            {activeParentCategoryCount}/6 active
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-[#5f1021]">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as 'category' | 'subcategory',
                })
              }
              className="w-full rounded-2xl border border-[#f3d48a]/70 bg-[#fffdf7] px-3 py-2.5 text-[#4d2b1f] shadow-sm outline-none transition focus:border-[#d4a017] focus:ring-2 focus:ring-[#f3d48a]/50"
            >
              <option value="category">Category</option>
              <option value="subcategory">Subcategory</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-[#5f1021]">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-2xl border border-[#f3d48a]/70 bg-[#fffdf7] px-3 py-2.5 text-[#4d2b1f] shadow-sm outline-none transition focus:border-[#d4a017] focus:ring-2 focus:ring-[#f3d48a]/50"
              placeholder="e.g. Sweets, Snacks, Beverages"
            />
          </div>
          {form.type === 'subcategory' && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-[#5f1021]">
                Parent Category
              </label>
              <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="w-full rounded-2xl border border-[#f3d48a]/70 bg-[#fffdf7] px-3 py-2.5 text-[#4d2b1f] shadow-sm outline-none transition focus:border-[#d4a017] focus:ring-2 focus:ring-[#f3d48a]/50"
              >
                <option value="">Select parent category</option>
                {parentCategories.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-[#5f1021]">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-2xl border border-[#f3d48a]/70 bg-[#fffdf7] px-3 py-2.5 text-[#4d2b1f] shadow-sm outline-none transition focus:border-[#d4a017] focus:ring-2 focus:ring-[#f3d48a]/50"
              rows={3}
              placeholder="Optional description"
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-[#5f1021] px-4 py-2.5 text-sm font-semibold text-[#fff8ef] transition hover:bg-[#7a1a2d]"
            >
              {editingId ? 'Update' : 'Save'} Menu Item
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    name: '',
                    description: '',
                    type: 'category',
                    parentId: '',
                  });
                }}
                className="rounded-2xl border border-[#f3d48a]/70 bg-[#fffdf7] px-4 py-2.5 text-sm font-semibold text-[#5f1021] transition hover:bg-[#f3d48a]/30"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <div className="rounded-[28px] border border-[#f3d48a]/70 bg-[linear-gradient(135deg,#fffdf7_0%,#fff8ef_100%)] p-5 shadow-[0_18px_45px_rgba(95,16,33,0.06)] sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="text-lg font-semibold text-[#5f1021]">
              Current Menu Structure
            </h4>
            <span className="rounded-full bg-[#d4a017]/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a86f0b]">
              {siteContent.categories.length} items
            </span>
          </div>
          <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
            {siteContent.categories.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-[#f3d48a]/70 bg-[#fffdf7] p-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[#5f1021]">
                      {item.name}
                    </div>
                    <div className="mt-1 inline-flex rounded-full bg-[#f3d48a]/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a440d]">
                      {item.type === 'subcategory' ? 'Subcategory' : 'Category'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="rounded-xl border border-[#f3d48a]/70 bg-[#fff8ef] px-2.5 py-1.5 text-xs font-semibold text-[#5f1021] transition hover:bg-[#f3d48a]/30"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id || '')}
                      className="rounded-xl bg-[#c8553d] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#a53a2d]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
