"use client"; // provitional
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

// `app/dashboard/page.tsx` is the UI for the `/dashboard` URL
export default function Page() {
  const [imagePreview, setImagePreview] = useState("");
  const [isImagePreviewLoading, setIsImagePreviewLoading] = useState(false);
  const { ["component-id"]: componentId, componentVersion } = useParams();

  const getImagePreview = async () => {
    setIsImagePreviewLoading(true);
    try {
      const { data } = await axios.get<{ url: string }>(
        `/api/preview/${componentId}?componentVersion=${componentVersion}`
      );
      setImagePreview(data.url);
    } catch (error) {
      console.log(error);
    } finally {
      setIsImagePreviewLoading(false);
    }
  };

  return (
    <>
      <main
        id="generated"
        className="flex flex-col items-center justify-between p-24"
      >
        <h1>Hello, Dashboard Page!</h1>
        <Link href="/">Go to Form</Link>
      </main>
      <div>{imagePreview && <img src={imagePreview} />}</div>
      <div>
        <button onClick={() => getImagePreview()}>
          {isImagePreviewLoading ? "Loading..." : "Get Image Preview"}
        </button>
      </div>
    </>
  );
}
