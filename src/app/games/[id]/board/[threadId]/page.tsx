import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoardThread } from "@/components/board-thread/board-thread";
import { getGameDetail, getThread } from "@/components/game-detail/data";
import { SEARCH_GAMES } from "@/components/game-search/data";

type ThreadPageProps = {
  params: Promise<{ id: string; threadId: string }>;
};

export function generateStaticParams() {
  return SEARCH_GAMES.flatMap((game) => {
    const detail = getGameDetail(String(game.id));
    return (detail?.posts ?? []).map((post) => ({
      id: String(game.id),
      threadId: String(post.id),
    }));
  });
}

export async function generateMetadata({
  params,
}: ThreadPageProps): Promise<Metadata> {
  const { id, threadId } = await params;
  const thread = getThread(id, threadId);
  return {
    title: thread
      ? `${thread.post.title} | ${thread.gameTitle}`
      : "スレッド | GameLog",
    description: thread?.post.body ?? "掲示板スレッド",
  };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id, threadId } = await params;
  const thread = getThread(id, threadId);
  if (!thread) notFound();

  return (
    <BoardThread
      gameId={thread.gameId}
      gameTitle={thread.gameTitle}
      post={thread.post}
    />
  );
}
