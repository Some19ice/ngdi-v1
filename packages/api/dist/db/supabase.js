"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("../config");
// Initialize Supabase client
const supabaseUrl = config_1.config.supabase?.url || process.env.SUPABASE_URL || "";
const supabaseKey = config_1.config.supabase?.anonKey || process.env.SUPABASE_ANON_KEY || "";
if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or anon key is missing. Please check your environment variables.");
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
exports.default = exports.supabase;
