'use client';

import React, { useEffect, useState } from 'react';
import { 
  Tag, Search, Plus, Trash2, AlertCircle, CheckCircle, Sparkles, Edit
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/lib/supabase';

interface CategoryItem {
  id: string;
  rawId?: any;
  name: string;
  slug: string;
  productCount: number;
}

export default function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Quick Add State
  const [newCatName, setNewCatName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cannotDeleteMsg, setCannotDeleteMsg] = useState<string | null>(null);

  // Edit State
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [editCatName, setEditCatName] = useState('');

  async function loadCategories() {
    try {
      setLoading(true);
      
      // 1. Fetch categories
      const { data: dbCats, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');
      
      if (catError) {
        console.log(catError);
        throw catError;
      }

      // 2. Fetch all products to count occurrences in memory
      const { data: dbProducts } = await supabase
        .from('products')
        .select('category_id');

      const countsMap: Record<string, number> = {};
      dbProducts?.forEach((p: any) => {
        if (p.category_id) {
          const cid = p.category_id.toString();
          countsMap[cid] = (countsMap[cid] || 0) + 1;
        }
      });

      const mappedCats: CategoryItem[] = dbCats?.map((cat: any) => ({
        id: cat.id.toString(),
        rawId: cat.id,
        name: cat.name || "Unnamed",
        slug: cat.slug || "",
        productCount: countsMap[cat.id.toString()] || 0
      })) || [];

      setCategories(mappedCats);

    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // Handle Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const slug = newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Check duplicate locally first
      const duplicate = categories.find(c => c.name.toLowerCase() === newCatName.trim().toLowerCase() || c.slug === slug);
      if (duplicate) {
        setErrorMsg('A category with this name or slug already exists.');
        setSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: newCatName.trim(),
          slug
        })
        .select('id')
        .single();

      console.log("inserted cat",data);
      if (error) {
        console.log(error);
        throw error;
      }

      setSuccessMsg(`Category "${newCatName.trim()}" created successfully!`);
      setNewCatName('');
      await loadCategories();
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error("Failed to add category:", err);
      setErrorMsg(err.message || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Category
  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editCatName.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const slug = editCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Check duplicate locally first (excluding currently edited category)
      const duplicate = categories.find(c => c.id !== editingCat.id && (c.name.toLowerCase() === editCatName.trim().toLowerCase() || c.slug === slug));
      if (duplicate) {
        setErrorMsg('A category with this name or slug already exists.');
        setSubmitting(false);
        return;
      }

      const targetId = editingCat.rawId ?? (isNaN(Number(editingCat.id)) ? editingCat.id : Number(editingCat.id));

      const { data, error } = await supabase
        .from('categories')
        .update({
          name: editCatName.trim(),
          slug
        })
        .eq('id', targetId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        // Fallback: try with string id if number failed or vice versa
        const fallbackId = targetId === editingCat.id ? Number(editingCat.id) : editingCat.id;
        if (fallbackId !== targetId) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('categories')
            .update({
              name: editCatName.trim(),
              slug
            })
            .eq('id', fallbackId)
            .select();
          if (fallbackError) throw fallbackError;
          if (!fallbackData || fallbackData.length === 0) {
            throw new Error('Could not update category. Please check database permissions.');
          }
        } else {
          throw new Error('Could not update category. Please check database permissions.');
        }
      }

      setSuccessMsg(`Category updated successfully!`);
      setEditingCat(null);
      setEditCatName('');
      await loadCategories();
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error("Failed to edit category:", err);
      setErrorMsg(err.message || 'Failed to update category.');
    } finally {
      setSubmitting(false);
    }
  };

  // Check and trigger Delete
  const checkDeleteCategory = (cat: CategoryItem) => {
    if (cat.productCount > 0) {
      setCannotDeleteMsg(`Category "${cat.name}" cannot be deleted because it is currently linked to ${cat.productCount} active product listings. Please re-assign those products first.`);
    } else {
      setDeletingId(cat.id);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const cat = categories.find(c => c.id === id);
      const targetId = cat?.rawId ?? (isNaN(Number(id)) ? id : Number(id));

      const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('id', targetId)
        .select();

      if (error) {
        console.log(error);
        throw error;
      }

      setCategories(categories.filter(c => c.id !== id));
      setDeletingId(null);
      setSuccessMsg('Category deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error("Error deleting category:", err);
      setErrorMsg(err.message || 'Failed to delete category.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Categories Inventory
        </h1>
        <p className="text-slate-550 text-sm mt-0.5 font-medium">
          Configure product classification nodes, search slugs, and monitor active catalog stock distribution.
        </p>
      </div>

      {/* Main Grid: Add Panel (Left/Top) & Categories Grid (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Category Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 h-fit space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Create Category</h2>
            <p className="text-xs text-slate-550 mt-0.5">Add a new catalog routing node to the shop</p>
          </div>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label htmlFor="catName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Category Name *
              </label>
              <input
                type="text"
                id="catName"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Smart Home"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1.5 block leading-normal font-semibold">
                Auto-generates routing slugs: <strong>smart-home</strong>
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-550/10 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle size={14} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !newCatName.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-orange-500/20 text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Spinner className="size-4" /> : <Plus size={16} />}
              <span>Add Category</span>
            </button>
          </form>
        </div>

        {/* Categories Directory Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Lookup Input */}
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search active categories by label name or slug..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-850 placeholder-slate-400 text-sm focus:outline-none focus:border-orange-500 transition shadow-sm"
            />
          </div>

          {/* Grid listing */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <div className="loader w-10 h-10 mb-2" />
                <p className="text-slate-500 font-semibold">Updating categorization nodes...</p>
              </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-3xl text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-400">
                <Tag size={20} />
              </div>
              <div>
                <p className="text-slate-800 font-semibold text-sm">No Categories Found</p>
                <p className="text-slate-500 text-xs mt-1">There are no categories matching your filter.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCategories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-350 hover:bg-slate-50/10 transition-all duration-200 flex justify-between items-start gap-4 group shadow-sm animate-in fade-in"
                >
                  <div className="space-y-2 truncate">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-xs">
                        <Tag size={14} />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm md:text-base leading-tight truncate group-hover:text-orange-500 transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-slate-450 truncate">slug: {cat.slug}</p>
                      <span className="inline-block text-[10px] bg-slate-100 border border-slate-200 text-slate-650 px-2 py-0.5 rounded-full font-bold mt-1.5">
                        {cat.productCount} {cat.productCount === 1 ? 'listed gadget' : 'listed gadgets'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingCat(cat);
                        setEditCatName(cat.name);
                        setErrorMsg('');
                      }}
                      className="p-2 bg-slate-50 hover:bg-orange-50 text-slate-500 hover:text-orange-600 border border-slate-200 hover:border-orange-100 rounded-lg transition cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => checkDeleteCategory(cat)}
                      className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-100 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Cannot Delete Modal Alert */}
      {cannotDeleteMsg && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-650">
              <AlertCircle size={24} />
              <h3 className="text-lg font-black text-slate-900">Integrity Guard Lock</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              {cannotDeleteMsg}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCannotDeleteMsg(null)}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition cursor-pointer shadow-lg shadow-orange-500/20"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Delete Category</h3>
            <p className="text-slate-550 text-sm leading-relaxed">
              Are you sure you want to permanently delete this category? This will remove it from the classification filters list.
            </p>
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <button
                disabled={submitting}
                onClick={() => {
                  setDeletingId(null);
                  setErrorMsg('');
                }}
                className="px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-sm font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={() => deletingId && handleDeleteCategory(deletingId)}
                className="px-4 py-2 bg-red-500 hover:bg-red-650 text-white text-sm font-semibold rounded-lg transition cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? <Spinner className="size-3.5" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCat && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-orange-500">
              <Edit size={20} />
              <h3 className="text-lg font-black text-slate-900">Edit Category</h3>
            </div>
            
            <form onSubmit={handleEditCategory} className="space-y-4">
              <div>
                <label htmlFor="editCatName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="editCatName"
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  placeholder="e.g. Smart Home"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1.5 block leading-normal font-semibold">
                  Auto-generates slug: <strong>{editCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}</strong>
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setEditingCat(null);
                    setEditCatName('');
                    setErrorMsg('');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-650 bg-white hover:bg-slate-50 text-sm font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !editCatName.trim()}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <Spinner className="size-3.5" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
