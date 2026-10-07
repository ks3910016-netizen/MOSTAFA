/* =========================================================
   إعدادات Supabase
========================================================= */

const SUPABASE_URL = "https://zjagwkjjpksmhwtqvghi.supabase.co";

const SUPABASE_KEY = "sb_publishable_smXF5e2OeIJ1f8O0bsk_TA_HyIQOrG7";


/* تحميل مكتبة Supabase */

const supabaseScript = document.createElement("script");
supabaseScript.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

supabaseScript.onload = function () {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.dispatchEvent(new Event("supabaseReady"));
};

document.head.appendChild(supabaseScript);