import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read and parse .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
envContent.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
        const parts = trimmed.split("=");
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join("=").trim();
            envVars[key] = val;
        }
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    console.log("Trying to insert empty object into 'orders'...");
    const { data, error } = await supabase
        .from('orders')
        .insert([{}])
        .select();

    if (error) {
        console.error("Error inserting:", error);
    } else {
        console.log("SUCCESS! Inserted row:", data);
        // Clean up the dummy row if inserted
        if (data && data.length > 0) {
            console.log("Cleaning up dummy order...");
            const { error: deleteError } = await supabase
                .from('orders')
                .delete()
                .eq('id', data[0].id);
            if (deleteError) {
                console.error("Error deleting dummy order:", deleteError);
            } else {
                console.log("Cleaned up successfully.");
            }
        }
    }
}

testInsert();
