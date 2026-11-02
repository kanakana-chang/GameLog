import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoardThread } from "@/components/board-thread/board-thread";
import { getSessionUser } from "@/lib/auth";
import { getBoardThread } from "@/lib/board";

type ThreadPageProps = {
  params: Promise<{ id: string; threadId: string }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: ThreadPageProps): Promise<Metadata> {
  const { id, threadId } = await params;
  const thread = await getBoardThread(id, threadId);
  return {
    title: thread
      ? `${thread.post.title} | ${thread.gameTitle}`
      : "スレッド | GameLog",
    description: thread?.post.body ?? "掲示板スレッド",
  };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id, threadId } = await params;
  const user = await getSessionUser();
  const thread = await getBoardThread(id, threadId, user?.id);
  if (!thread) notFound();

  return (
    <BoardThread
      gameId={thread.gameId}
      gameTitle={thread.gameTitle}
      post={thread.post}
      initialReplies={thread.replies}
    />
  );
}
