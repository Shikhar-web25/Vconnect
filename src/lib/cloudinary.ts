import { supabase } from "../../supabaseClient";

export type CloudinaryPreset = "vconnect_posts" | "vconnect_docs" | "vconnect_avatars";
export type CloudinaryResourceType = "image" | "video" | "raw";

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
};

export const uploadToCloudinary = async ({
  file,
  preset,
  resourceType,
}: {
  file: CloudinaryFile;
  preset: CloudinaryPreset;
  resourceType?: CloudinaryResourceType;
}) => {
  const { data, error } = await supabase.functions.invoke<SignatureResponse>("cloudinary-sign", {
    body: { preset, resourceType },
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
