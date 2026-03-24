// Supabase Edge Function: Cloudinary signed upload
// Env vars required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PresetName = "vconnect_posts" | "vconnect_docs" | "vconnect_avatars";

const presetConfig: Record<PresetName, { folder: string; defaultResourceType: "image" | "video" | "raw" }> = {
  vconnect_posts: { folder: "vconnect/posts", defaultResourceType: "image" },
  vconnect_docs: { folder: "vconnect/docs", defaultResourceType: "raw" },
  vconnect_avatars: { folder: "vconnect/avatars", defaultResourceType: "image" },
};

const sha1 = async (message: string) => {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const buildSignature = async (params: Record<string, string>, apiSecret: string) => {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return await sha1(`${sorted}${apiSecret}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
  const apiKey = Deno.env.get("CLOUDINARY_API_KEY");
  const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");

  if (!cloudName || !apiKey || !apiSecret) {
    return new Response(JSON.stringify({ error: "Missing Cloudinary env vars" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({}));
  const preset = body?.preset as PresetName | undefined;
  const resourceType = body?.resourceType as "image" | "video" | "raw" | undefined;

  if (!preset || !presetConfig[preset]) {
    return new Response(JSON.stringify({ error: "Invalid preset" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const folder = presetConfig[preset].folder;
  const finalResourceType = resourceType ?? presetConfig[preset].defaultResourceType;
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const paramsToSign: Record<string, string> = {
    folder,
    timestamp,
    upload_preset: preset,
  };

  const signature = await buildSignature(paramsToSign, apiSecret);

  return new Response(
    JSON.stringify({
      cloudName,
      apiKey,
      uploadPreset: preset,
      folder,
      timestamp,
      signature,
      resourceType: finalResourceType,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
