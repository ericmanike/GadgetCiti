'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, Plus, Trash2, Eye, Loader2, X, AlertCircle, ShoppingBag, ArrowUpDown, Filter, Sparkles 
} from 'lucide-react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/toastProvider';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: string;
  name: string;
}

interface ProductItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  category: string;
  categoryId: string;
  imageUrl: string;
  description: string;
}

interface ProductFormValues {
  name: string;
  brand: string;
  price: string;
  stock: string;
  category: string;
  overview: string;
  description: string;
  imageUrl: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Product name is required').min(3, 'Name is too short'),
  brand: Yup.string().required('Brand is required'),
  price: Yup.number().required('Price is required').positive('Price must be greater than 0'),
  stock: Yup.number().required('Stock is required').min(0, 'Stock cannot be negative'),
  category: Yup.string().required('Category is required'),
  overview: Yup.string().required('Overview is required').min(5, 'Overview is too short'),
  description: Yup.string().required('Description is required').min(10, 'Description is too short'),
  imageUrl: Yup.string().url('Must be a valid URL').optional()
});

export default function SellerProductsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filtering & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortField, setSortField] = useState<'name' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Modals & UI States
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Products & Categories
  async function loadData() {
    if (!user) return;

    try {
      setLoading(true);
      
      // 1. Fetch categories
      const { data: dbCategories } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      setCategories(dbCategories || []);

      // 2. Fetch products for this seller
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select(`
          id, name, brand, price, stock, over_view,
          categories(id, name),
          product_images(image_url)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const mappedProducts: ProductItem[] = dbProducts?.map((row: any) => {
        const images = row.product_images?.map((img: any) => img.image_url) || [];
        return {
          id: row.id.toString(),
          name: row.name || "Unknown Product",
          brand: row.brand || "Unbranded",
          price: Number(row.price || 0),
          stock: Number(row.stock || 0),
          category: row.categories?.name || "Uncategorized",
          categoryId: row.categories?.id?.toString() || "",
          imageUrl: images.length > 0 ? images[0] : "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200&q=80",
          description: row.over_view?.description || ""
        };
      }) || [];

      setProducts(mappedProducts);
    } catch (err) {
      console.error("Failed to load seller products:", err);
      showToast("Could not load products.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle Sort
  const handleSort = (field: 'name' | 'price' | 'stock') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Handle Delete
  const handleDeleteProduct = async (id: string) => {
    try {
      setSubmitting(true);
      // Delete images first
      await supabase.from('product_images').delete().eq('product_id', id);
      // Delete product
      const { error } = await supabase.from('products').delete().eq('id', id).eq('user_id', user?.id);
      
      if (error) throw error;
      
      showToast("Product deleted successfully.", "success");
      setProducts(products.filter(p => p.id !== id));
      setDeletingId(null);
    } catch (err: any) {
      console.error("Error deleting product:", err);
      showToast(err.message || "Failed to delete product.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Formik for new product
  const formik = useFormik<ProductFormValues>({
    initialValues: {
      name: '',
      brand: '',
      price: '',
      stock: '',
      category: '',
      overview: '',
      description: '',
      imageUrl: ''
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!user) return;
      setSubmitting(true);
      try {
        // 1. Resolve or Create Category ID
        let categoryId = null;
        const matchingCat = categories.find(c => c.name.toLowerCase() === values.category.toLowerCase());
        
        if (matchingCat) {
          categoryId = matchingCat.id;
        } else {
          const { data: newCat, error: catError } = await supabase
            .from('categories')
            .insert({
              name: values.category,
              slug: values.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            })
            .select('id')
            .single();
          
          if (catError) throw catError;
          if (newCat) {
            categoryId = newCat.id;
            setCategories(prev => [...prev, { id: newCat.id, name: values.category }]);
          }
        }

        // 2. Insert Product
        const { data: product, error: productError } = await supabase
          .from('products')
          .insert({
            name: values.name,
            brand: values.brand,
            category_id: categoryId,
            user_id: user.id,
            price: Number(values.price),
            stock: Number(values.stock),
            over_view: {
              description: values.description,
              features: [values.overview]
            }
          })
          .select('id')
          .single();

        if (productError) throw productError;

        // 3. Insert Image if URL exists
        const defaultImage = "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=250&q=80";
        const finalImageUrl = values.imageUrl || defaultImage;
        
        await supabase
          .from('product_images')
          .insert({
            product_id: product.id,
            image_url: finalImageUrl
          });

        showToast("Product uploaded successfully! 🚀", "success");
        setIsAddDrawerOpen(false);
        resetForm();
        loadData();
      } catch (err: any) {
        console.error("Error creating product:", err);
        showToast(err.message || "Failed to create product.", "error");
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Filtered and Sorted Products
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory ? p.categoryId === selectedCategory : true;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      if (sortField === 'price' || sortField === 'stock') {
        return (a[sortField] - b[sortField]) * modifier;
      }
      return a.name.localeCompare(b.name) * modifier;
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-orange-500 w-10 h-10 mb-2" />
        <p className="text-slate-500 font-semibold">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Your Products</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage details, stock level, and listings of your products.</p>
        </div>
        <button 
          onClick={() => setIsAddDrawerOpen(true)}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-5 rounded-2xl text-sm transition duration-200 shadow-lg shadow-orange-500/20 cursor-pointer self-start sm:self-center"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-gray-150 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3.5 text-gray-400 size-4.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, brand..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="text-gray-400 size-4.5 shrink-0" />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full md:w-56 px-4 py-2.5 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none bg-white transition text-sm font-semibold text-gray-900 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Products Grid / Table */}
      <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
            <ShoppingBag size={52} className="mb-3 text-gray-300" />
            <p className="font-bold text-gray-655">No products found</p>
            <p className="text-xs text-gray-400 max-w-xs mt-1">Try resetting filters or upload a new item to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-xs font-black text-gray-400 uppercase border-b border-gray-100">
                  <th className="pb-3">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-gray-950 font-black cursor-pointer">
                      Item <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="pb-3 font-black">Brand</th>
                  <th className="pb-3 font-black">Category</th>
                  <th className="pb-3">
                    <button onClick={() => handleSort('price')} className="flex items-center gap-1 hover:text-gray-950 font-black cursor-pointer">
                      Price <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="pb-3">
                    <button onClick={() => handleSort('stock')} className="flex items-center gap-1 hover:text-gray-950 font-black cursor-pointer">
                      Stock Level <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="pb-3 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-xl border border-gray-100" />
                        <span className="font-bold text-gray-900 max-w-[220px] truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600 font-semibold">{p.brand}</td>
                    <td className="py-4 text-gray-600 font-semibold">{p.category}</td>
                    <td className="py-4 text-gray-900 font-black">{formatCurrency(p.price)}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        p.stock > 5 ? 'bg-green-50 text-green-700' : p.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {p.stock === 0 ? 'Out of stock' : `${p.stock} units`}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a href={`/products/${p.id}`} target="_blank" rel="noreferrer">
                          <button className="p-1.5 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                            <Eye size={16} />
                          </button>
                        </a>
                        <button 
                          onClick={() => setDeletingId(p.id)}
                          className="p-1.5 bg-gray-50 text-gray-400 hover:text-red-655 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Drawer */}
      <AnimatePresence>
        {isAddDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddDrawerOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="font-black text-gray-900 text-lg flex items-center gap-1.5">
                    <Sparkles className="text-orange-500 size-4.5" /> Upload New Product
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">List a new electronic gadget to your store catalog</p>
                </div>
                <button 
                  onClick={() => setIsAddDrawerOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <FormikProvider value={formik}>
                <form onSubmit={formik.handleSubmit} className="space-y-5 flex-1 pb-10">
                  
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Product Name</label>
                    <input
                      name="name"
                      type="text"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. MacBook Pro M3 Max"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-xs font-bold text-red-500">{formik.errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Brand */}
                    <div className="space-y-1">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Brand</label>
                      <input
                        name="brand"
                        type="text"
                        value={formik.values.brand}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. Apple"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
                      />
                      {formik.touched.brand && formik.errors.brand && (
                        <p className="text-xs font-bold text-red-500">{formik.errors.brand}</p>
                      )}
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Category</label>
                      <input
                        name="category"
                        type="text"
                        value={formik.values.category}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. Laptops"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
                      />
                      {formik.touched.category && formik.errors.category && (
                        <p className="text-xs font-bold text-red-500">{formik.errors.category}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Price */}
                    <div className="space-y-1">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Price (GHS)</label>
                      <input
                        name="price"
                        type="number"
                        step="0.01"
                        value={formik.values.price}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="2999.00"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
                      />
                      {formik.touched.price && formik.errors.price && (
                        <p className="text-xs font-bold text-red-500">{formik.errors.price}</p>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="space-y-1">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Stock Count</label>
                      <input
                        name="stock"
                        type="number"
                        value={formik.values.stock}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="10"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
                      />
                      {formik.touched.stock && formik.errors.stock && (
                        <p className="text-xs font-bold text-red-500">{formik.errors.stock}</p>
                      )}
                    </div>
                  </div>

                  {/* Image URL */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Image URL (Optional)</label>
                    <input
                      name="imageUrl"
                      type="text"
                      value={formik.values.imageUrl}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
                    />
                    {formik.touched.imageUrl && formik.errors.imageUrl && (
                      <p className="text-xs font-bold text-red-500">{formik.errors.imageUrl}</p>
                    )}
                  </div>

                  {/* Short Overview */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Short Overview feature</label>
                    <input
                      name="overview"
                      type="text"
                      value={formik.values.overview}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. 16GB Unified Memory, 512GB SSD Storage"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
                    />
                    {formik.touched.overview && formik.errors.overview && (
                      <p className="text-xs font-bold text-red-500">{formik.errors.overview}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Detailed Description</label>
                    <textarea
                      name="description"
                      rows={5}
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Detail specifications, product condition, warranty, and box items..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
                    />
                    {formik.touched.description && formik.errors.description && (
                      <p className="text-xs font-bold text-red-500">{formik.errors.description}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl text-sm transition duration-200 shadow-lg shadow-orange-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {submitting && <Loader2 className="animate-spin size-4" />}
                    {submitting ? 'Creating listing...' : 'Upload Product to Store'}
                  </button>

                </form>
              </FormikProvider>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingId(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full relative z-10 text-center space-y-4"
            >
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-md">Delete Product Listing?</h4>
                <p className="text-xs text-gray-400 font-medium mt-1">This action is permanent and will remove this product catalog from the marketplace.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProduct(deletingId)}
                  disabled={submitting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {submitting && <Loader2 className="animate-spin size-3" />}
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
