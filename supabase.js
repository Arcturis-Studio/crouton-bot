const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const client = require("@supabase/supabase-js");

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = client.createClient(supabaseUrl, supabaseAnonKey);

