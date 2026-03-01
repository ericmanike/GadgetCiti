import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { Metadata } from "next";

interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = getProductBySlug(slug);

    if (!product) return { title: 'Product Not Found' };

    return {
        title: `${product.name} | Letronix`,
        description: product.description,
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    const relatedProducts = getRelatedProducts(product);

    return (
        <main className="min-h-screen bg-slate-50 pt-36 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ProductDetailClient product={product} relatedProducts={relatedProducts} />
            </div>
        </main>
    );
}
