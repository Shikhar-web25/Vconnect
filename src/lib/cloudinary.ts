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
  const { data, error } = await supabase.functions.invoke<SignatureResponse>("cloudinary-sign", {
    body: { action: "upload", preset, resourceType, deliveryType },
  });

  if (error || !data) {
    throw new Error(error?.message || "Failed to get Cloudinary signature.");
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
  const { data, error } = await supabase.functions.invoke<DownloadUrlResponse>("cloudinary-sign", {
    body: {
      action: "download",
      publicId,
      resourceType,
      deliveryType,
      format,
      expiresInSeconds,
    },
  });

  if (error || !data?.downloadUrl) {
    throw new Error(error?.message || "Failed to get signed resume URL.");
  }

  return data.downloadUrl;
};
