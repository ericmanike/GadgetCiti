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
    rating: number;
    ratingCount: number;
    specifications?: { label: string; value: string }[];
    features?: string[];
}

export const ALL_PRODUCTS: Product[] = [
    {
        id: "s1",
        name: "MacBook Pro 16 M3 Max",
        slug: "macbook-pro-16-m3-max",
        description: "The most powerful MacBook ever with M3 Max chip. Experience extreme performance and amazing battery life.",
        price: 35000,
        oldPrice: 38000,
        brand: "Apple",
        category: "Laptops",
        images: [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&q=80",
            "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1000&q=80",
            "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1000&q=80"
        ],
        inStock: true,
        rating: 5.0,
        ratingCount: 15,
        features: ["Apple M3 Max Chip", "16-core CPU", "40-core GPU", "32GB Unified Memory", "1TB SSD"],
        specifications: [
            { label: "Display", value: '16.2" Liquid Retina XDR' },
            { label: "Battery", value: "Up to 22 hours" },
            { label: "Weight", value: "2.16 kg" }
        ]
    },
    {
        id: "s2",
        name: "Samsung Odyssey Neo G9",
        slug: "samsung-odyssey-neo-g9",
        description: "57-inch Dual UHD Curved Gaming Monitor with Quantum Matrix Technology.",
        price: 25000,
        oldPrice: 28000,
        brand: "Samsung",
        category: "Monitors",
        images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1000&q=80"],
        inStock: true,
        rating: 4.9,
        ratingCount: 8,
    },
    {
        id: "s3",
        name: "Sony Alpha a7R V",
        slug: "sony-alpha-a7r-v",
        description: "Full-frame Mirrorless Camera with 61MP resolution and AI-based processing.",
        price: 45000,
        brand: "Sony",
        category: "Cameras",
        images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&q=80"],
        inStock: true,
        rating: 4.9,
        ratingCount: 12,
    },
    {
        id: "s4",
        name: "iPad Pro 12.9 M2",
        slug: "ipad-pro-m2",
        description: "Brilliant Liquid Retina XDR display and M2 chip.",
        price: 15000,
        brand: "Apple",
        category: "Tablets",
        images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1000&q=80"],
        inStock: true,
        rating: 4.8,
        ratingCount: 45,
    },
    {
        id: "s5",
        name: "Surface Laptop Studio 2",
        slug: "surface-laptop-studio-2",
        description: "Versatile design with powerful performance.",
        price: 28000,
        brand: "Microsoft",
        category: "Laptops",
        images: ["https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?w=1000&q=80"],
        inStock: true,
        rating: 4.7,
        ratingCount: 22,
    },
    {
        id: "s6",
        name: "ROG Swift PG42UQ",
        slug: "rog-swift-oled",
        description: "41.5-inch 4K OLED gaming monitor.",
        price: 18000,
        brand: "Asus",
        category: "Monitors",
        images: ["https://images.unsplash.com/photo-1547115941-9545aff89278?w=1000&q=80"],
        inStock: true,
        rating: 4.9,
        ratingCount: 34,
    },
    {
        id: "l1",
        name: "iPhone 15 Pro Max",
        slug: "iphone-15-pro-max",
        description: "Titanium design, A17 Pro chip, Action button.",
        price: 18500,
        oldPrice: 19500,
        brand: "Apple",
        category: "Phones",
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80"],
        inStock: true,
        rating: 4.8,
        ratingCount: 1245
    },
    {
        id: "l2",
        name: "Galaxy Z Fold 5",
        slug: "galaxy-z-fold-5",
        description: "The ultimate productivity tool that fits in your pocket.",
        price: 22000,
        brand: "Samsung",
        category: "Phones",
        images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1000&q=80"],
        inStock: true,
        rating: 4.7,
        ratingCount: 856
    },
    {
        id: "l3",
        name: "Asus ROG Zephyrus G14",
        slug: "rog-zephyrus-g14",
        description: "Powerful 14-inch gaming laptop with AniMe Matrix display.",
        price: 15500,
        brand: "Asus",
        category: "Laptops",
        images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1000&q=80"],
        inStock: true,
        rating: 4.8,
        ratingCount: 420
    },
    {
        id: "l4",
        name: "Google Pixel 8 Pro",
        slug: "pixel-8-pro",
        description: "The most advanced Pixel camera ever, powered by Google AI.",
        price: 12500,
        brand: "Google",
        category: "Phones",
        images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1000&q=80"],
        inStock: true,
        rating: 4.6,
        ratingCount: 158
    },
    {
        id: "r1",
        name: "Nintendo Switch OLED",
        slug: "nintendo-switch-oled",
        description: "Vibrant 7-inch OLED screen, enhanced audio, and more.",
        price: 4500,
        brand: "Nintendo",
        category: "Gaming",
        images: ["https://images.unsplash.com/photo-1578303315323-2820d3664740?w=1000&q=80"],
        inStock: true,
        rating: 4.9,
        ratingCount: 4500
    },
    {
        id: "r2",
        name: "DJI Mini 4 Pro",
        slug: "dji-mini-4-pro",
        description: "Lightweight drone with 4K HDR video and omnidirectional sensing.",
        price: 9500,
        brand: "DJI",
        category: "Drones",
        images: ["https://images.unsplash.com/photo-1473968512647-3e44a224fe8f?w=1000&q=80"],
        inStock: true,
        rating: 4.8,
        ratingCount: 320
    },
    {
        id: "r3",
        name: "Apple Watch Ultra 2",
        slug: "apple-watch-ultra-2",
        description: "The most rugged and capable Apple Watch.",
        price: 11000,
        brand: "Apple",
        category: "Watches",
        images: ["https://images.unsplash.com/photo-1434493907317-a46b53b8183e?w=1000&q=80"],
        inStock: true,
        rating: 4.9,
        ratingCount: 1580
    },
    {
        id: "r4",
        name: "Bose QuietComfort Ultra",
        slug: "bose-qc-ultra",
        description: "World-class noise cancellation with immersive audio.",
        price: 5200,
        brand: "Bose",
        category: "Audio",
        images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&q=80"],
        inStock: true,
        rating: 4.7,
        ratingCount: 890
    },
    {
        id: "r5",
        name: "Kindle Paperwhite",
        slug: "kindle-paperwhite",
        description: "Now with a 6.8\" display and thinner borders.",
        price: 1800,
        brand: "Amazon",
        category: "Electronics",
        images: ["https://images.unsplash.com/photo-1592492159418-39f319320569?w=1000&q=80"],
        inStock: true,
        rating: 4.8,
        ratingCount: 2200
    },
    {
        id: "r6",
        name: "Logitech MX Master 3S",
        slug: "logitech-mx-master-3s",
        description: "An icon remade. Precise, silent, and ergonomic.",
        price: 1200,
        brand: "Logitech",
        category: "Accessories",
        images: ["https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?w=1000&q=80"],
        inStock: true,
        rating: 4.9,
        ratingCount: 3400
    }
];

export function getProductBySlug(slug: string): Product | undefined {
    return ALL_PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product): Product[] {
    return ALL_PRODUCTS.filter(
        (p) => p.category === product.category && p.id !== product.id
    ).slice(0, 4);
}
