import React, { useState } from 'react';
import { useFormik, Field, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { AlertCircle, Upload } from 'lucide-react';
import Spinner from './loadingComponent';
import { supabase } from '@/lib/supabase';

interface ProductFormValues {
    name: string;
    brand: string;
    price: string;
    stock: string;
    category: string;
    overview: string;
    description: string;
    images: File[];
}

const validationSchema = Yup.object({
    name: Yup.string().required('Product name is required').min(3, 'Name must be at least 3 characters'),
    brand: Yup.string().required('Brand is required'),
    price: Yup.number().required('Price is required').positive('Price must be greater than 0'),
    stock: Yup.number().required('Stock quantity is required').min(0, 'Stock cannot be negative'),
    category: Yup.string().required('Category is required'),
    overview: Yup.string().required('Overview is required').min(5, 'Overview is too short'),
    description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
    images: Yup.array().max(5, 'Maximum 5 images allowed')
});

export default function ProductListingForm() {
    const [submitted, setSubmitted] = useState(false);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [creating, setCreating] = useState(false);

    const categories = [
        'Smartphones',
        'Laptops',
        'Tablets',
        'Accessories',
        'Gaming',
        'Watches',
        'Other Electronics'
    ];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const fileArray = Array.from(files);
        const currentImages = formik.values.images;
        if (currentImages.length + fileArray.length > 5) {
            formik.setFieldError("images", "You can only upload a maximum of 5 images.");
            return;
        }

        formik.setFieldError("images", "");
        const previewUrls = fileArray.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...previewUrls]);

        formik.setFieldValue("images", [...currentImages, ...fileArray]);
    };

    const formik = useFormik<ProductFormValues>({
        initialValues: {
            name: '',
            brand: '',
            price: '',
            stock: '',
            category: '',
            overview: '',
            description: '',
            images: [],
        },
        validationSchema,
        onSubmit: async (values) => {
            setCreating(true);
            try {
                // 1. Resolve Category ID
                let categoryId = null;
                const { data: foundCats } = await supabase
                    .from('categories')
                    .select('id')
                    .ilike('name', values.category)
                    .limit(1);

                if (foundCats && foundCats.length > 0) {
                    categoryId = foundCats[0].id;
                } else {
                    const { data: newCat } = await supabase
                        .from('categories')
                        .insert({
                            name: values.category,
                            slug: values.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                        })
                        .select('id')
                        .single();
                    if (newCat) categoryId = newCat.id;
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

                // 3. Upload Images to Supabase Storage (if bucket exists)
                // For demonstration, we upload them and track URLs, or fallback to object URLs
                const imageUrls: string[] = [];
                for (const file of values.images) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${productId}-${Math.random()}.${fileExt}`;
                    const filePath = `${fileName}`;

                    // IMPORTANT: You need a bucket named 'product-images' in your Supabase project with public access!
                    const { error: uploadError } = await supabase.storage
                        .from('product-images')
                        .upload(filePath, file);

                    if (!uploadError) {
                        const { data } = supabase.storage
                            .from('product-images')
                            .getPublicUrl(filePath);
                        imageUrls.push(data.publicUrl);
                    } else {
                        console.error('Image upload failed, using fallback URL:', uploadError);
                        // Using a dummy fallback image if bucket isn't correctly configured yet
                        imageUrls.push("https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1000&q=80");
                    }
                }

                // Insert image links
                if (imageUrls.length > 0) {
                    const imageRows = imageUrls.map(url => ({
                        product_id: productId,
                        image_url: url
                    }));
                    await supabase.from('product_images').insert(imageRows);
                } else {
                    // Default image
                    await supabase.from('product_images').insert({
                        product_id: productId,
                        image_url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1000&q=80"
                    });
                }

                setSubmitted(true);
                setTimeout(() => {
                    setSubmitted(false);
                    setImagePreviews([]);
                    formik.resetForm();
                }, 3000);
            } catch (err) {
                console.error('Error during product creation:', err);
            } finally {
                setCreating(false);
            }
        },
    });

    return (
        <div className="w-[90%] mt-5 mx-auto">
            {creating && <Spinner />}
            <div className="bg-white rounded-lg shadow-xl p-8">
                <div className="mb-8">
                    <h1 className="text-[12px] md:text-3xl font-bold text-gray-900 mb-2">Sell a Product</h1>
                    <p className="text-gray-600">List an electronic gadget for sale on Letronix</p>
                </div>

                {submitted && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                        Product successfully listed!
                    </div>
                )}

                <FormikProvider value={formik}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name *
                                </label>
                                <Field
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="e.g. iPhone 15 Pro Max"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} /> {formik.errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                                    Brand *
                                </label>
                                <Field
                                    type="text"
                                    id="brand"
                                    name="brand"
                                    placeholder="e.g. Apple, Samsung, Sony"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                {formik.touched.brand && formik.errors.brand && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} /> {formik.errors.brand}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <Field
                                    as="select"
                                    id="category"
                                    name="category"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">Select category</option>
                                    {categories.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </Field>
                                {formik.touched.category && formik.errors.category && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} /> {formik.errors.category}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (GHS) *
                                </label>
                                <Field
                                    type="number"
                                    id="price"
                                    name="price"
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                {formik.touched.price && formik.errors.price && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} /> {formik.errors.price}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                                    Available Stock *
                                </label>
                                <Field
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                {formik.touched.stock && formik.errors.stock && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} /> {formik.errors.stock}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="overview" className="block text-sm font-medium text-gray-700 mb-2">
                                Overview summary *
                            </label>
                            <Field
                                type="text"
                                id="overview"
                                name="overview"
                                placeholder="Short overview of the device, e.g. An excellent flagship with an incredible camera."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            {formik.touched.overview && formik.errors.overview && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle size={14} /> {formik.errors.overview}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Description & Specifications *
                            </label>
                            <Field
                                as="textarea"
                                id="description"
                                name="description"
                                rows={4}
                                placeholder="List the technical specs, condition, and full details of the product..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                            />
                            {formik.touched.description && formik.errors.description && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle size={14} /> {formik.errors.description}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Images
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Upload up to 5 images. High quality pictures increase sales. Note: requires "product-images" Storage bucket.
                            </p>

                            <div className="space-y-4">
                                {formik.values.images.length < 5 && (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="images"
                                            name="images"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="images"
                                            className="flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors"
                                        >
                                            <Upload size={24} className="text-gray-400" />
                                            <span className="text-sm font-medium text-gray-600">
                                                Click to upload product images
                                            </span>
                                        </label>
                                    </div>
                                )}

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                        {formik.values.images.map((file, index) => (
                                            <div key={index} className="relative group h-[70px] md:h-[100px]">
                                                <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {formik.errors.images && typeof formik.errors.images === 'string' && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} /> {formik.errors.images}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6 mt-4">
                            <button
                                type="button"
                                onClick={() => formik.handleSubmit()}
                                disabled={formik.isSubmitting}
                                className="cursor-pointer text-[12px] md:text-[16px] flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors focus:ring-4 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {formik.isSubmitting ? 'Publishing...' : 'Publish Product'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setImagePreviews([]);
                                    formik.resetForm();
                                }}
                                className="cursor-pointer text-[12px] md:text-[16px] px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </FormikProvider>
            </div>
        </div>
    );
}
