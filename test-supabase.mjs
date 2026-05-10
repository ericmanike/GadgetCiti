import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    const { data, error } = await supabase
        .from('products')
        .select(`
            id, name, brand, price, stock, over_view, specifications,
            categories(name),
            product_images(image_url),
            reviews(rating)
        `);

    if (error) {
        console.error("Error fetching products:", error);
    } else {
        console.log("Success! Fetched", data.length, "products.");
        if (data.length > 0) {
            console.log(data[0]);
        }
    }
}

test();
