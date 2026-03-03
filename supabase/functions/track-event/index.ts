import { Deno } from "https://deno.land/std@0.168.0/shim/deno.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { profile_id, link_id, event_type, referrer, utm_source, utm_medium, utm_campaign } = await req.json();
    const userAgent = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    // Rate limiting logic would go here (using Redis or similar)

    // Parse User Agent (Simplified)
    let device_type = 'desktop';
    if (/mobile/i.test(userAgent)) device_type = 'mobile';
    else if (/tablet/i.test(userAgent)) device_type = 'tablet';

    // GeoIP Lookup (Mocked)
    const country = "Unknown";
    const city = "Unknown";
    const region = "Unknown";

    // Hash IP
    const msgUint8 = new TextEncoder().encode(ip + "salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const ip_hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Insert Event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        profile_id,
        link_id,
        event_type,
        referrer,
        country,
        city,
        region,
        device_type,
        utm_source,
        utm_medium,
        utm_campaign,
        ip_hash
      });

    if (error) throw error;

    if (event_type === 'link_click' && link_id) {
       await supabase.rpc('increment_click_count', { link_id });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
