import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { Metadata } from "next";

interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) return { title: 'Product Not Found' };

    return {
        title: `${product.name} | Gadget's CITi`,
        description: product.description,
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product);

    return (
        <main className="min-h-screen bg-slate-50 w-full overflow-x-hidden pt-24 md:pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
                <ProductDetailClient product={product} relatedProducts={relatedProducts} />
            </div>
        </main>
    );
}
