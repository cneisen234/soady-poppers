// UploadThing route handler (GET/POST at /api/uploadthing).

import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
