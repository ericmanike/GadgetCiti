'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, Plus, Trash2, Eye, Loader2, X, AlertCircle, ShoppingBag, ArrowUpDown, Filter, Sparkles 
} from 'lucide-react';
import { useFormik, Field, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { supabase } from '@/lib/supabase';

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

export default function AdminProductsPage() {
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
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Products & Categories
  async function loadData() {
    try {
      setLoading(true);
      
      // 1. Fetch categories
      const { data: dbCategories } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      setCategories(dbCategories || []);

      // 2. Fetch products
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select(`
          id, name, brand, price, stock, over_view,
          categories(id, name),
          product_images(image_url)
        `);

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
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

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
      const { error } = await supabase.from('products').delete().eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setProducts(products.filter(p => p.id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting product:", err);
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
    onSubmit: async (values) => {
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
            // Add new category to local list
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
        const productId = product.id;

        // 3. Insert Product Image relationship
        const finalImgUrl = values.imageUrl.trim() || "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1000&q=80";
        await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: finalImgUrl
          });

        setSuccessMsg('Product created successfully!');
        
        // Refresh products list
        await loadData();
        
        setTimeout(() => {
          setSuccessMsg('');
          setIsAddDrawerOpen(false);
          formik.resetForm();
        }, 1500);

      } catch (err) {
        console.error("Error creating product:", err);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Filtered products list
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = 
      !selectedCategory || product.category === selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    let compA = a[sortField];
    let compB = b[sortField];
    if (typeof compA === 'string') compA = compA.toLowerCase();
    if (typeof compB === 'string') compB = compB.toLowerCase();
    
    if (compA < compB) return sortOrder === 'asc' ? -1 : 1;
    if (compA > compB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Products Directory <Sparkles className="text-orange-500 w-5 h-5" />
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage your electronic gadgets directory, catalog pricing, and inventory levels.
          </p>
        </div>
        <button
          onClick={() => setIsAddDrawerOpen(true)}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl transition duration-200 shadow-lg shadow-orange-500/20 text-sm cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title, name, or brand..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        {/* Category Filter */}
        <div className="relative w-full md:w-64 shrink-0">
          <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-orange-500 transition cursor-pointer appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Listing / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-900 border border-slate-800 rounded-3xl">
          <Loader2 className="animate-spin text-orange-500 w-10 h-10 mb-2" />
          <p className="text-slate-400 font-semibold">Updating catalog directory...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 bg-slate-950 border border-slate-850 rounded-full flex items-center justify-center text-slate-600">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">No Products Found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">
              There are no products matching your search query. Try broadening your criteria or list a new product.
            </p>
          </div>
          <button
            onClick={() => setIsAddDrawerOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-sm transition cursor-pointer"
          >
            Add Product
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-200 transition" onClick={() => handleSort('name')}>
                    <span className="flex items-center gap-1">Brand & Name <ArrowUpDown size={12} /></span>
                  </th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-200 transition" onClick={() => handleSort('price')}>
                    <span className="flex items-center gap-1">Price <ArrowUpDown size={12} /></span>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-200 transition" onClick={() => handleSort('stock')}>
                    <span className="flex items-center gap-1">Inventory <ArrowUpDown size={12} /></span>
                  </th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-850/40 transition duration-150">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-slate-800 shadow-md"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">{prod.brand}</span>
                        <span className="font-bold text-slate-200 block text-sm leading-snug">{prod.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-xs bg-slate-800/80 text-slate-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-black text-slate-100">GHS {prod.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        prod.stock > 10 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : prod.stock > 0 
                            ? 'bg-amber-500/10 text-amber-400' 
                            : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          prod.stock > 10 ? 'bg-emerald-400' : prod.stock > 0 ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        {prod.stock > 0 ? `${prod.stock} units` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2">
                        <a href={`/products/${prod.id}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer">
                          <Eye size={14} />
                        </a>
                        <button 
                          onClick={() => setDeletingId(prod.id)}
                          className="p-2 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded-lg transition cursor-pointer border border-transparent hover:border-rose-500/10"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Delete Product</h3>
            <p className="text-slate-400 text-sm">
              Are you sure you want to permanently delete this product? This action removes all dynamic catalogs and linked image listings.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                disabled={submitting}
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-slate-700 text-slate-300 bg-slate-850 hover:bg-slate-800 text-sm font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={() => deletingId && handleDeleteProduct(deletingId)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Side Drawer Modal */}
      {isAddDrawerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 md:p-8 flex flex-col space-y-6 shadow-2xl animate-in slide-in-from-right duration-350">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white">Publish New Gadget</h3>
                <p className="text-xs text-slate-500">List an electronic gadget for sale on Swappi</p>
              </div>
              <button 
                onClick={() => setIsAddDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold text-center">
                {successMsg}
              </div>
            )}

            {/* Form */}
            <FormikProvider value={formik}>
              <form onSubmit={formik.handleSubmit} className="flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Product Name */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Product Name *
                    </label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      placeholder="e.g. iPhone 15 Pro Max"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm focus:outline-none focus:border-orange-500 transition"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {formik.errors.name}
                      </p>
                    )}
                  </div>

                  {/* Brand & Category row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="brand" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Brand *
                      </label>
                      <Field
                        type="text"
                        id="brand"
                        name="brand"
                        placeholder="e.g. Apple"
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm focus:outline-none focus:border-orange-500 transition"
                      />
                      {formik.touched.brand && formik.errors.brand && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle size={12} /> {formik.errors.brand}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Category *
                      </label>
                      <Field
                        as="select"
                        id="category"
                        name="category"
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-orange-500 transition cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                        <option value="Other Electronics">Other Electronics</option>
                      </Field>
                      {formik.touched.category && formik.errors.category && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle size={12} /> {formik.errors.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price & Stock row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Price (GHS) *
                      </label>
                      <Field
                        type="number"
                        id="price"
                        name="price"
                        step="0.01"
                        placeholder="1200.00"
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm focus:outline-none focus:border-orange-500 transition"
                      />
                      {formik.touched.price && formik.errors.price && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle size={12} /> {formik.errors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="stock" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Initial Stock *
                      </label>
                      <Field
                        type="number"
                        id="stock"
                        name="stock"
                        placeholder="5"
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm focus:outline-none focus:border-orange-500 transition"
                      />
                      {formik.touched.stock && formik.errors.stock && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle size={12} /> {formik.errors.stock}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label htmlFor="imageUrl" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Product Image URL
                    </label>
                    <Field
                      type="text"
                      id="imageUrl"
                      name="imageUrl"
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm focus:outline-none focus:border-orange-500 transition"
                    />
                    {formik.touched.imageUrl && formik.errors.imageUrl && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {formik.errors.imageUrl}
                      </p>
                    )}
                  </div>

                  {/* Overview summary */}
                  <div>
                    <label htmlFor="overview" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Overview Summary *
                    </label>
                    <Field
                      type="text"
                      id="overview"
                      name="overview"
                      placeholder="e.g. Excellent flagship smartphone with pristine dynamic displays."
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm focus:outline-none focus:border-orange-500 transition"
                    />
                    {formik.touched.overview && formik.errors.overview && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {formik.errors.overview}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Specifications & Details *
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows={3}
                      placeholder="Explain features, specs, size, and package components in detail..."
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm focus:outline-none focus:border-orange-500 transition resize-none"
                    />
                    {formik.touched.description && formik.errors.description && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {formik.errors.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex gap-4 pt-6 border-t border-slate-800 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      formik.resetForm();
                      setIsAddDrawerOpen(false);
                    }}
                    className="flex-1 py-3 px-6 border border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold rounded-xl transition text-sm cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition text-sm shadow-lg shadow-orange-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    <span>Publish Gadget</span>
                  </button>
                </div>
              </form>
            </FormikProvider>

          </div>
        </div>
      )}

    </div>
  );
}
