import Link from "next/link";
import { DeleteButton } from "@/components/delete-button";
import { formatDate } from "@/lib/format";
import { canDeleteComment } from "@/lib/permissions";
import type { Comment, Viewer } from "@/lib/types";

export function CommentList({
  comments,
  viewer,
  postAuthorId,
}: {
  comments: Comment[];
  viewer: Viewer;
  postAuthorId: string;
}) {
  if (comments.length === 0) {
    return (
      <p className="border-t border-rule pt-6 text-sm italic text-muted">
        No notes yet. The margin is open.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-rule border-t border-rule">
      {comments.map((comment) => (
        <li key={comment.id} className="py-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm">
              <Link href={`/authors/${comment.author.username}`} className="font-medium hover:text-rust-ink">
                {comment.author.displayName}
              </Link>
              <span className="ml-2 text-muted">{formatDate(comment.createdAt)}</span>
            </p>
            {canDeleteComment(comment, { authorId: postAuthorId }, viewer) ? (
              <DeleteButton
                url={`/api/comments/${comment.id}`}
                label="Delete"
                confirmText="Delete this note?"
                className="text-xs text-muted underline underline-offset-2 hover:text-rust-ink disabled:opacity-50"
              />
            ) : null}
          </div>
          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">{comment.body}</p>
        </li>
      ))}
    </ol>
  );
}
