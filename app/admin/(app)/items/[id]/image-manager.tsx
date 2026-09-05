"use client";

import "@uploadthing/react/styles.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/lib/uploadthing-client";
import { addProductImage, deleteProductImage, makePrimaryImage } from "../actions";
import ConfirmDelete from "../../confirm-delete";
import { TrashIcon } from "../../icons";

type Img = { id: string; url: string; alt: string | null };

export default function ImageManager({
  productId,
  images,
}: {
  productId: string;
  images: Img[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      {images.length > 0 && (
        <div className="admin-image-grid">
          {images.map((img, i) => (
            <div key={img.id} className="admin-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt ?? ""} />
              {i === 0 && <span className="admin-image-primary">Primary</span>}
              <div className="admin-image-actions">
                {i !== 0 && (
                  <form action={makePrimaryImage}>
                    <input type="hidden" name="id" value={img.id} />
                    <input type="hidden" name="productId" value={productId} />
                    <button type="submit" className="admin-btn sm ghost">
                      Make primary
                    </button>
                  </form>
                )}
                <ConfirmDelete
                  action={deleteProductImage}
                  fields={{ id: img.id, productId }}
                  title="Remove this photo?"
                  message="The photo will be deleted from storage."
                  triggerLabel={<TrashIcon />}
                  triggerAriaLabel="Remove photo"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <UploadDropzone
        endpoint="productImage"
        onClientUploadComplete={async (res) => {
          setError(null);
          const f = res?.[0];
          if (f?.serverData?.url) {
            await addProductImage({
              productId,
              url: f.serverData.url,
              key: f.serverData.key,
            });
            router.refresh();
          }
        }}
        onUploadError={(e) => setError(e.message)}
      />
      {error && <p className="admin-login-error">{error}</p>}
    </div>
  );
}
