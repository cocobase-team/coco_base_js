import { BASEURL } from "../utils/utils";
import { Cocobase } from "./core";

interface UploadedFile {
  url: string;
}

const uploadFile = async (cb: Cocobase, file: File) => {
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
