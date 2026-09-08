// UploadThing file router — defines the one upload endpoint the admin uses for
// product photos. Auth is enforced in the middleware (only a signed-in admin can
// upload); the route itself isn't behind the proxy matcher.

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { isAuthenticated } from "@/lib/auth/session";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      if (!(await isAuthenticated())) {
        throw new UploadThingError("Unauthorized");
      }
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      // Returned to the client's onClientUploadComplete as `serverData`.
      return { url: file.ufsUrl, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
