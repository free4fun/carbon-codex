import PostFormWrapper from "./PostFormWrapper";

export default async function NewPostPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">New Post</h1>
      <PostFormWrapper />
    </div>
  );
}
