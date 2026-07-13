import { supabase } from './supabase';

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    oldPrice?: number;
    brand: string;
    category: string;
    images: string[];
    inStock: boolean;
    stock: number;
    rating: number;
    ratingCount: number;
    specifications?: { label: string; value: string }[];
    features?: string[];
    createdAt?: string;
}

export async function fetchAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select(`
            id, name, brand, price, stock, over_view, specifications, created_at,
            categories(name),
            product_images(image_url),
            reviews(rating)
        `);

    if (error || !data) {
        console.error("Error fetching products:", error);
        return [];
    }

    return data.map(mapDBProductToClient);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
    const products = await fetchAllProducts();
    return products.find((p) => p.slug === slug);
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
    const products = await fetchAllProducts();
    return products.filter(
        (p) => p.category === product.category && p.id !== product.id
    ).slice(0, 4);
}

function mapDBProductToClient(row: any): Product {
    const images = row.product_images?.flatMap((img: any) => 
        Array.isArray(img.image_url) ? img.image_url : (img.image_url ? [img.image_url] : [])
    ) || [];
    const ratingSum = row.reviews?.reduce((sum: number, r: any) => sum + r.rating, 0) || 0;
    const ratingCount = row.reviews?.length || 0;

    let specs = [];
    if (row.specifications && typeof row.specifications === 'object') {
        const specKeys = Object.keys(row.specifications);
        if (specKeys.length > 0 && !Array.isArray(row.specifications)) {
            specs = specKeys.map(key => ({ label: key, value: String(row.specifications[key]) }));
        } else if (Array.isArray(row.specifications)) {
            specs = row.specifications;
        }
    }

    return {
        id: row.id.toString(),
        name: row.name || "Unknown Product",
        slug: (row.name || "product-" + row.id).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: row.over_view?.description || "No description available",
        price: Number(row.price || 0),
        oldPrice: row.over_view?.oldPrice ? Number(row.over_view.oldPrice) : undefined,
        brand: row.brand || "Unbranded",
        category: row.categories?.name || "Uncategorized",
        images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1000&q=80"],
        inStock: Number(row.stock || 0) > 0,
        stock: Number(row.stock || 0),
        rating: ratingCount > 0 ? ratingSum / ratingCount : 0,
        ratingCount: ratingCount,
        specifications: specs,
        features: row.over_view?.features || [],
        createdAt: row.created_at || new Date().toISOString()
    };
}
