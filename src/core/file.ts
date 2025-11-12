import { BASEURL } from "../utils/utils.js";
import { Cocobase } from "./core.js";

/**
 * Response from a successful file upload.
 */
interface UploadedFile {
  /** Public URL of the uploaded file */
  url: string;
}

/**
 * Uploads a single file to Cocobase cloud storage.
 *
 * This is a standalone function for uploading files without associating them
 * with a specific document. For document-related file uploads, use methods like
 * `createDocumentWithFiles` or `updateDocumentWithFiles` instead.
 *
 * @param cb - Cocobase client instance
 * @param file - File object to upload
 * @returns Promise resolving to an object containing the file URL
 * @throws Error if the upload fails or API key is missing
 *
 * @example
 * ```typescript
 * const db = new Cocobase({ apiKey: 'your-key' });
 * const fileInput = document.querySelector('input[type="file"]');
 * const file = fileInput.files[0];
 *
 * const { url } = await uploadFile(db, file);
 * console.log('File uploaded to:', url);
 * ```
 */
const uploadFile = async (cb: Cocobase, file: File): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append("file", file);

  const req = await fetch(BASEURL + "/collections/file", {
    method: "POST",
    body: formData,
    headers: {
      "x-api-key": cb.apiKey!,
    },
  });
  if (!req.ok) {
    throw new Error("File upload failed");
  }
  return (await req.json()) as UploadedFile;
};

export { uploadFile };
