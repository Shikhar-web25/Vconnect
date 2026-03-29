import { supabase } from "../../supabaseClient";

export type CloudinaryPreset = "vconnect_posts" | "vconnect_docs" | "vconnect_avatars";
export type CloudinaryResourceType = "image" | "video" | "raw";
export type CloudinaryDeliveryType = "upload" | "private" | "authenticated";

export type CloudinaryFile = {
  uri: string;
  name?: string;
  type?: string;
};

type SignatureResponse = {
  cloudName: string;
  apiKey: string;
  uploadPreset: CloudinaryPreset;
  folder: string;
  timestamp: string;
  signature: string;
  resourceType: CloudinaryResourceType;
  deliveryType: CloudinaryDeliveryType;
};

type DownloadUrlResponse = {
  downloadUrl: string;
  expiresAt: number;
};

const parseFunctionInvokeError = async (error: any) => {
  if (!error) return null;
  const context = (error as any).context;
  if (context?.json) {
    try {
      const body = await context.json();
      const detail =
        (typeof body?.error === "string" && body.error) ||
        (typeof body?.message === "string" && body.message) ||
        (typeof body?.details === "string" && body.details);
      if (detail) return detail;
    } catch {
      // Ignore JSON parse errors and try plain text next.
    }
  }
  if (context?.text) {
    try {
      const text = await context.text();
      if (typeof text === "string" && text.trim()) return text.trim();
    } catch {
      // Ignore text parse errors.
    }
  }
  return error?.message ?? null;
};

const buildFunctionAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Your session is not valid. Please log in again and retry.');
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
};

export const uploadToCloudinary = async ({
  file,
  preset,
  resourceType,
  deliveryType,
}: {
  file: CloudinaryFile;
  preset: CloudinaryPreset;
  resourceType?: CloudinaryResourceType;
  deliveryType?: CloudinaryDeliveryType;
}) => {
  const headers = await buildFunctionAuthHeaders();
  const { data, error } = await supabase.functions.invoke<SignatureResponse>("cloudinary-sign", {
    body: { action: "upload", preset, resourceType, deliveryType },
    headers,
  });

  if (error || !data) {
    const detail = await parseFunctionInvokeError(error);
    throw new Error(detail || "Failed to get Cloudinary signature.");
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${data.cloudName}/${data.resourceType}/upload`;

  const form = new FormData();
  form.append("file", {
    uri: file.uri,
    name: file.name ?? "upload",
    type: file.type ?? "application/octet-stream",
  } as any);
  form.append("api_key", data.apiKey);
  form.append("timestamp", data.timestamp);
  form.append("signature", data.signature);
  form.append("upload_preset", data.uploadPreset);
  form.append("folder", data.folder);
  if (data.deliveryType && data.deliveryType !== "upload") {
    form.append("type", data.deliveryType);
  }

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: form,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error?.message || "Cloudinary upload failed.");
  }

  return json;
};

export const getCloudinaryDownloadUrl = async ({
  publicId,
  resourceType = "raw",
  deliveryType = "private",
  format = "pdf",
  expiresInSeconds = 300,
}: {
  publicId: string;
  resourceType?: CloudinaryResourceType;
  deliveryType?: CloudinaryDeliveryType;
  format?: string;
  expiresInSeconds?: number;
}) => {
  const headers = await buildFunctionAuthHeaders();
  const { data, error } = await supabase.functions.invoke<DownloadUrlResponse>("cloudinary-sign", {
    body: {
      action: "download",
      publicId,
      resourceType,
      deliveryType,
      format,
      expiresInSeconds,
    },
    headers,
  });

  if (error || !data?.downloadUrl) {
    const detail = await parseFunctionInvokeError(error);
    throw new Error(detail || "Failed to get signed resume URL.");
  }

  return data.downloadUrl;
};
