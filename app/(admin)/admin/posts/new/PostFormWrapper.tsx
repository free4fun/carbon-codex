"use client";

import PostForm, { type PostFormValues } from "@/src/components/admin/PostForm";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPostAction } from "./actions";

export default function PostFormWrapper() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: PostFormValues) {
    setError(null);
    try {
      await createPostAction(values);
      router.push("/admin/posts");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to create post");
    }
  }

  return (
    <>
      {error && (
        <div role="alert" className="mb-4 px-4 py-3 rounded border border-red-500 bg-red-50 text-red-700">
          {error}
        </div>
      )}
      <PostForm onSubmit={handleSubmit} />
    </>
  );
}
