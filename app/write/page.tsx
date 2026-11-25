import { Suspense } from "react";
import { PostEditor } from "@/components/post-editor";
import { requireViewer } from "@/lib/auth";

export const metadata = { title: "Write" };

export default function WritePage() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <Gate />
    </Suspense>
  );
}

async function Gate() {
  await requireViewer("/write");
  return <PostEditor />;
}

function EditorSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl animate-pulse space-y-6 px-5 py-14 sm:px-8">
      <div className="h-4 w-24 rounded bg-wash" />
      <div className="h-10 w-2/3 rounded bg-wash" />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="h-14 rounded bg-wash" />
          <div className="h-24 rounded bg-wash" />
          <div className="h-96 rounded bg-wash" />
        </div>
        <div className="space-y-4">
          <div className="aspect-[16/9] rounded bg-wash" />
          <div className="h-10 rounded bg-wash" />
        </div>
      </div>
    </div>
  );
}
