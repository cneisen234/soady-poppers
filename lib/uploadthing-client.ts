// Typed UploadThing React components. Imported by client components only.
// `import type` keeps the server-side router code out of the client bundle.

import { generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
