'use client';

import React, { useEffect, useState } from 'react';
import {
  Search, Plus, Trash2, Edit, X, AlertCircle, ShoppingBag, ArrowUpDown, Filter, Sparkles, Upload
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/toastProvider';
import { formatCurrency } from '@/lib/utils';
import { parseImageUrls } from '@/lib/products';
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
  oldPrice?: number;
  discount?: number;
  stock: number;
  category: string;
  condition: string;
  categoryId: string;
  imageUrl: string;
  images: string[];
  overview: string;
  description: string;
}

interface ProductFormValues {
  name: string;
  brand: string;
  price: string;
  discount: string;
  stock: string;
  category: string;
  condition: string;
  overview: string;
  description: string;
  imageFiles: File[];
}

const validationSchema = Yup.object({
  name: Yup.string().required('Product name is required').min(3, 'Name is too short'),
  brand: Yup.string().required('Brand is required'),
  price: Yup.number().required('Price is required').positive('Price must be greater than 0'),
  discount: Yup.number().min(0, 'Discount cannot be negative').max(99, 'Discount cannot exceed 99%').nullable().optional(),
  stock: Yup.number().required('Stock is required').min(0, 'Stock cannot be negative'),
  category: Yup.string().required('Category is required'),
  condition: Yup.string().required('Condition is required'),
  overview: Yup.string().required('Overview is required').min(5, 'Overview is too short'),
  description: Yup.string().required('Description is required').min(10, 'Description is too short'),
  imageFiles: Yup.array().of(Yup.mixed()).max(3, 'You can upload a maximum of 3 images')
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
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
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
          id, name, brand, price, discount, stock, condition, over_view,
          categories(id, name),
          product_images(image_url)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const mappedProducts: ProductItem[] = dbProducts?.map((row: any) => {
        const images = parseImageUrls(row.product_images);
        const overviewText = Array.isArray(row.over_view?.features) && row.over_view.features.length > 0
          ? row.over_view.features[0]
          : (row.over_view?.overview || '');
        const oldPrice = row.over_view?.oldPrice ? Number(row.over_view.oldPrice) : undefined;
        const priceNum = Number(row.price || 0);
        const dbDiscount = row.discount != null ? Number(row.discount) : undefined;
        const discountNum = dbDiscount ?? (oldPrice && oldPrice > priceNum
          ? Math.round(((oldPrice - priceNum) / oldPrice) * 100)
          : 0);
        const calculatedOldPrice = oldPrice ?? (dbDiscount && dbDiscount > 0
          ? Number((priceNum / (1 - dbDiscount / 100)).toFixed(2))
          : undefined);

        return {
          id: row.id.toString(),
          name: row.name || "Unknown Product",
          brand: row.brand || "Unbranded",
          price: priceNum,
          oldPrice: calculatedOldPrice,
          discount: discountNum,
          stock: Number(row.stock || 0),
          category: row.categories?.name || "Uncategorized",
          condition: row.condition || "New",
          categoryId: row.categories?.id?.toString() || "",
          imageUrl: images.length > 0 ? images[0] : "https://placehold.co/800?text=photo+unavailable&font=roboto",
          images: images,
          overview: overviewText,
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
    console.log(user)
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

  // Formik for product create/edit
  const formik = useFormik<ProductFormValues>({
    initialValues: {
      name: '',
      brand: '',
      price: '',
      discount: '',
      stock: '',
      category: '',
      condition: '',
      overview: '',
      description: '',
      imageFiles: []
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!user) return;

      const totalImages = existingImages.length + (values.imageFiles?.length || 0);
      if (totalImages === 0) {
        showToast("At least one product image is required", "error");
        return;
      }

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

        // 2. Upload New Images to Cloudinary if provided
        let uploadedUrls: string[] = [];
        if (values.imageFiles && values.imageFiles.length > 0) {
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwjvjjplu';
          const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'letronix_preset';

          const uploadPromises = values.imageFiles.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);

            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
              method: 'POST',
              body: formData
            });

            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error?.message || `Cloudinary returned ${res.statusText}`);
            }

            const data = await res.json();
            if (data.secure_url) {
              return data.secure_url;
            } else {
              throw new Error("No secure_url returned from Cloudinary response");
            }
          });

          try {
            uploadedUrls = await Promise.all(uploadPromises);
          } catch (uploadError: any) {
            console.error('Cloudinary upload failed:', uploadError);
            showToast("Failed to upload new product images.", "error");
            setSubmitting(false);
            return;
          }
        }

        const finalImages = [...existingImages, ...uploadedUrls];
        const primaryImage = finalImages.length > 0 ? finalImages : ["https://placehold.co/800?text=photo+unavailable&font=roboto"];

        const priceNum = Number(values.price);
        const discountNum = values.discount ? Number(values.discount) : 0;
        const calculatedOldPrice = discountNum > 0
          ? Number((priceNum / (1 - discountNum / 100)).toFixed(2))
          : undefined;

        const overviewData = {
          description: values.description,
          features: [values.overview],
          ...(calculatedOldPrice ? { oldPrice: calculatedOldPrice } : {})
        };

        if (editingProduct) {
          // UPDATE PRODUCT
          const { error: updateError } = await supabase
            .from('products')
            .update({
              name: values.name,
              brand: values.brand,
              category_id: categoryId,
              condition: values.condition,
              price: priceNum,
              discount: discountNum > 0 ? discountNum : 0,
              stock: Number(values.stock),
              over_view: overviewData
            })
            .eq('id', editingProduct.id)
            .eq('user_id', user.id);

          if (updateError) throw updateError;

          // Replace product_images
          await supabase.from('product_images').delete().eq('product_id', editingProduct.id);
          await supabase.from('product_images').insert({
            product_id: editingProduct.id,
            image_url: primaryImage
          });

          showToast("Product updated successfully! 🚀", "success");
        } else {
          // INSERT PRODUCT
          const { data: product, error: productError } = await supabase
            .from('products')
            .insert({
              name: values.name,
              brand: values.brand,
              category_id: categoryId,
              condition: values.condition,
              user_id: user.id,
              price: priceNum,
              discount: discountNum > 0 ? discountNum : 0,
              stock: Number(values.stock),
              over_view: overviewData
            })
            .select('id')
            .single();

          if (productError) throw productError;

          await supabase.from('product_images').insert({
            product_id: product.id,
            image_url: primaryImage
          });

          showToast("Product uploaded successfully! 🚀", "success");
        }

        setIsAddDrawerOpen(false);
        setEditingProduct(null);
        setExistingImages([]);
        resetForm();
        loadData();
      } catch (err: any) {
        console.error("Error saving product:", err);
        showToast(err.message || "Failed to save product.", "error");
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleEditProduct = (p: ProductItem) => {
    setEditingProduct(p);
    setExistingImages(p.images || (p.imageUrl ? [p.imageUrl] : []));
    formik.setValues({
      name: p.name,
      brand: p.brand,
      price: p.price.toString(),
      discount: p.discount ? p.discount.toString() : '',
      stock: p.stock.toString(),
      category: p.category,
      condition: p.condition,
      overview: p.overview,
      description: p.description,
      imageFiles: []
    });
    setIsAddDrawerOpen(true);
  };

  const handleOpenAddDrawer = () => {
    setEditingProduct(null);
    setExistingImages([]);
    formik.resetForm();
    setIsAddDrawerOpen(true);
  };

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
        <div className="loader w-10 h-10 mb-2" />
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
          onClick={handleOpenAddDrawer}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-5 rounded-2xl text-sm transition duration-200 cursor-pointer shadow-lg shadow-orange-500/20"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

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
      <div className="bg-white rounded-3xl p-6 shadow-xs">
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
                    <td className="py-4 font-black">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{formatCurrency(p.price)}</span>
                        {p.oldPrice && p.oldPrice > p.price && (
                          <span className="text-[10px] text-gray-400 line-through font-normal">
                            {formatCurrency(p.oldPrice)} ({p.discount}% OFF)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${p.stock > 5 ? 'bg-green-50 text-green-700' : p.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {p.stock === 0 ? 'Out of stock' : `${p.stock} units`}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditProduct(p)}
                          className="p-1.5 bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </button>
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
              className="relative w-full md:w-[60%] bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="font-black text-gray-900 text-lg flex items-center gap-1.5">
                    <Sparkles className="text-orange-500 size-4.5" />
                    {editingProduct ? 'Edit Product Listing' : 'Upload New Product'}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    {editingProduct ? `Modify details for ${editingProduct.name}` : 'List a new electronic gadget to your store catalog'}
                  </p>
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
                      <select
                        name="category"
                        value={formik.values.category}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none bg-white transition text-sm font-semibold text-gray-900 cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                      {formik.touched.category && formik.errors.category && (
                        <p className="text-xs font-bold text-red-500">{formik.errors.category}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Condition */}
                    <div className="space-y-1">
                      <label className="text-[9px] md:text-xs font-black text-gray-500 uppercase tracking-widest">Condition *</label>
                      <select
                        name="condition"
                        value={formik.values.condition}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none bg-white transition text-xs font-semibold text-gray-900 cursor-pointer"
                      >
                        <option value="">Select Condition</option>
                        <option value="New">New</option>
                        <option value="Used">Used</option>
                      </select>
                      {formik.touched.condition && formik.errors.condition && (
                        <p className="text-[8px] md:text-xs font-bold text-red-500">{formik.errors.condition}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <label className="text-[9px] md:text-xs font-black text-gray-500 uppercase tracking-widest">Price (GHS) *</label>
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
                        <p className="text-[8px] md:text-xs font-bold text-red-500">{formik.errors.price}</p>
                      )}
                    </div>

                    {/* Discount */}
                    <div className="space-y-1">
                      <label className="text-[9px] md:text-xs font-black text-gray-500 uppercase tracking-widest">Discount (%)</label>
                      <input
                        name="discount"
                        type="number"
                        min="0"
                        max="99"
                        value={formik.values.discount}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. 10"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-semibold text-gray-900"
                      />
                      {formik.touched.discount && formik.errors.discount && (
                        <p className="text-[8px] md:text-xs font-bold text-red-500">{formik.errors.discount}</p>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="space-y-1">
                      <label className="text-[9px] md:text-xs font-black text-gray-500 uppercase tracking-widest">Stock Count *</label>
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
                        <p className="text-[8px] md:text-xs font-bold text-red-500">{formik.errors.stock}</p>
                      )}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">
                      Product Images (Up to 3)
                    </label>

                    <div className="space-y-4">
                      {/* Grid showing existing and newly selected images */}
                      {(existingImages.length > 0 || (formik.values.imageFiles && formik.values.imageFiles.length > 0)) && (
                        <div className="grid grid-cols-3 gap-3">
                          {/* Existing images */}
                          {existingImages.map((url, idx) => (
                            <div key={`existing-${idx}`} className="relative aspect-square border border-gray-200 rounded-xl overflow-hidden bg-gray-50 group">
                              <img
                                src={url}
                                alt={`Existing ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                                  className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition cursor-pointer"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <span className="absolute bottom-1 left-1 bg-black/75 text-[9px] text-white px-1.5 py-0.5 rounded font-black">
                                Saved #{idx + 1}
                              </span>
                            </div>
                          ))}

                          {/* Newly uploaded file previews */}
                          {formik.values.imageFiles?.map((file, idx) => (
                            <div key={`new-${idx}`} className="relative aspect-square border border-gray-200 rounded-xl overflow-hidden bg-gray-50 group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`New Preview ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextFiles = formik.values.imageFiles.filter((_, i) => i !== idx);
                                    formik.setFieldValue('imageFiles', nextFiles);
                                  }}
                                  className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition cursor-pointer"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <span className="absolute bottom-1 left-1 bg-orange-500 text-[9px] text-white px-1.5 py-0.5 rounded font-black">
                                New
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Dropzone */}
                      {(existingImages.length + (formik.values.imageFiles?.length || 0)) < 3 && (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 hover:border-orange-500/50 transition duration-200">
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-2">
                            <Upload className="text-gray-400 w-8 h-8 mb-2 animate-bounce" />
                            <span className="text-xs font-bold text-gray-700">
                              {(existingImages.length + (formik.values.imageFiles?.length || 0)) > 0
                                ? `Add more images (${existingImages.length + (formik.values.imageFiles?.length || 0)}/3)`
                                : "Click to upload product images"}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-1 font-semibold">
                              PNG, JPG, JPEG (Max 3 files total, 5MB each)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.currentTarget.files || []);
                                const currentFiles = formik.values.imageFiles || [];
                                const combined = [...currentFiles, ...files];
                                const maxAllowed = 3 - existingImages.length;
                                const uniqueCombined = combined.filter((file, idx, self) =>
                                  self.findIndex(f => f.name === file.name && f.size === file.size) === idx
                                ).slice(0, maxAllowed);
                                formik.setFieldValue('imageFiles', uniqueCombined);
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {formik.touched.imageFiles && formik.errors.imageFiles && (
                      <p className="text-xs font-bold text-red-500">{String(formik.errors.imageFiles)}</p>
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
                    {submitting && <Spinner className="size-4" />}
                    {submitting
                      ? (editingProduct ? 'Saving changes...' : 'Creating listing...')
                      : (editingProduct ? 'Save Changes' : 'Upload Product to Store')}
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
                  {submitting && <Spinner className="size-3" />}
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
