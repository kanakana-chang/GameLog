import type { GameDetailData, Post } from "@/components/game-detail/data";
import type { ThreadReply } from "@/components/board-thread/data";
import { isUuid, requirePublishedGame } from "@/lib/games";
import { getLikedPostIds } from "@/lib/likes";
import { generatePostTitle } from "@/lib/post-title";
import { prisma } from "@/lib/prisma";
import { getHiddenTargetSets } from "@/lib/reports";

const AVATAR = {
  av: "ゲ",
  avBg: "#EEF2FF",
  avC: "#4F46E5",
  color: "#4F46E5",
} as const;

const FALLBACK_CATEGORY = "雑談";

export type TopicInput = {
  title: string;
  body: string;
  tags: string[];
  spoiler: boolean;
};

export type ReplyInput = {
  content: string;
  spoiler: boolean;
  imageUrl: string;
};

function asRecord(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") {
    throw new Error("送信内容が正しくありません");
  }
  return body as Record<string, unknown>;
}

function imageUrlForStore(url: string) {
  if (!url || url.startsWith("data:")) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
  } catch {
    return null;
  }
  return null;
}

function decodePostMeta(content: string): {
  text: string;
  tags: string[];
  title: string;
} {
  const match = content.match(/^<!--gl:(.*?)-->\n?([\s\S]*)$/);
  if (!match) return { text: content, tags: [], title: "" };
  try {
    const meta = JSON.parse(match[1]) as { tags?: unknown; title?: unknown };
    const tags = Array.isArray(meta.tags)
      ? meta.tags.filter((item): item is string => typeof item === "string")
      : [];
    const title = typeof meta.title === "string" ? meta.title.trim() : "";
    return { text: match[2] ?? "", tags, title };
  } catch {
    return { text: content, tags: [], title: "" };
  }
}

function encodeFirstPost(body: string, tags: string[]) {
  if (!tags.length) return body;
  return `<!--gl:${JSON.stringify({ tags })}-->\n${body}`;
}

function encodeReply(content: string, title: string) {
  if (!title) return content;
  return `<!--gl:${JSON.stringify({ title })}-->\n${content}`;
}

function publicAvatarSrc(url: string | null | undefined) {
  if (!url) return "";
  if (url.startsWith("data:image/")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
  } catch {
    return "";
  }
  return "";
}

function authorFromProfile(profile?: {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
} | null) {
  const name = profile?.display_name || profile?.username || "ゲスト";
  return {
    accountId: profile?.id ?? "",
    user: name,
    username: profile?.username ?? "",
    avatarSrc: publicAvatarSrc(profile?.avatar_url),
    av: name.slice(0, 1).toUpperCase() || AVATAR.av,
    avBg: AVATAR.avBg,
    avC: AVATAR.avC,
  };
}

function formatTimestamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseTopicInput(body: unknown): TopicInput {
  const record = asRecord(body);
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const text = typeof record.body === "string" ? record.body.trim() : "";
  const tags = Array.isArray(record.tags)
    ? record.tags
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  if (title.length > 100) throw new Error("タイトルは100文字以内で入力してください");
  if (!text) throw new Error("本文を入力してください");
  if (text.length > 4000) throw new Error("本文は4000文字以内で入力してください");

  return {
    title,
    body: text,
    tags,
    spoiler: record.spoiler === true,
  };
}

export function parseReplyInput(body: unknown): ReplyInput {
  const record = asRecord(body);
  const content = typeof record.content === "string" ? record.content.trim() : "";
  const imageUrl = typeof record.imageUrl === "string" ? record.imageUrl.trim() : "";

  if (!content) throw new Error("レスを入力してください");
  if (content.length > 4000) throw new Error("レスは4000文字以内で入力してください");

  return {
    content,
    spoiler: record.spoiler === true,
    imageUrl,
  };
}

type TopicWithPosts = Awaited<
  ReturnType<
    typeof prisma.topics.findMany<{
      include: {
        posts: {
          include: { profiles: true };
          orderBy: { created_at: "asc" };
        };
      };
    }>
  >
>[number];

function toListPost(topic: TopicWithPosts): Post {
  const first = topic.posts[0];
  const meta = first
    ? decodePostMeta(first.content)
    : { text: "", tags: [], title: "" };
  const author = authorFromProfile(first?.profiles ?? null);
  const tags = meta.tags.length ? meta.tags : [topic.category].filter(Boolean);

  return {
    id: topic.id,
    user: author.user,
    username: author.username,
    accountId: author.accountId,
    avatarSrc: author.avatarSrc,
    av: author.av,
    avBg: author.avBg,
    avC: author.avC,
    date: topic.created_at.toISOString().slice(0, 10),
    title: topic.title,
    body: meta.text,
    replies: Math.max(0, topic.posts.length - 1),
    views: 0,
    tags,
  };
}

function toThreadReply(
  post: TopicWithPosts["posts"][number],
  index: number,
  likedByMe = false,
): ThreadReply {
  const meta = decodePostMeta(post.content);
  const author = authorFromProfile(post.profiles);

  return {
    id: post.id,
    userId: author.accountId || author.username || author.user,
    userName: author.user,
    username: author.username,
    accountId: author.accountId,
    avatar: author.av,
    avatarSrc: author.avatarSrc,
    color: author.avC,
    title: index === 0 ? "" : meta.title,
    content: meta.text,
    isSpoiler: post.is_spoiler,
    likes: post.likes_count,
    likedByMe,
    timestamp: formatTimestamp(post.created_at),
    image: post.image_url ?? undefined,
  };
}

export function attachGameTopics(
  detail: GameDetailData,
  posts: Post[],
): GameDetailData {
  return { ...detail, posts };
}

export async function getGameTopics(gameId: string): Promise<Post[]> {
  if (!isUuid(gameId)) return [];

  const hidden = await getHiddenTargetSets();
  const topics = await prisma.topics.findMany({
    where: { game_id: gameId },
    include: {
      posts: {
        include: { profiles: true },
        orderBy: { created_at: "asc" },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return topics
    .filter((topic) => {
      const first = topic.posts[0];
      if (hidden.topics.has(topic.id)) return false;
      if (first && hidden.posts.has(first.id)) return false;
      return true;
    })
    .map(toListPost);
}

export async function getBoardThread(
  gameId: string,
  topicId: string,
  userId?: string,
) {
  if (!isUuid(gameId) || !isUuid(topicId)) return null;

  const hidden = await getHiddenTargetSets();
  const topic = await prisma.topics.findFirst({
    where: { id: topicId, game_id: gameId },
    include: {
      games: { select: { title: true, is_published: true } },
      posts: {
        include: { profiles: true },
        orderBy: { created_at: "asc" },
      },
    },
  });
  if (!topic || !topic.games.is_published) return null;

  const first = topic.posts[0];
  if (hidden.topics.has(topic.id) || (first && hidden.posts.has(first.id))) {
    return null;
  }

  const visiblePosts = topic.posts.filter((item) => !hidden.posts.has(item.id));
  const likedIds = await getLikedPostIds(
    userId,
    visiblePosts.map((item) => item.id),
  );

  return {
    gameId,
    gameTitle: topic.games.title,
    post: toListPost({ ...topic, posts: visiblePosts }),
    replies: visiblePosts.map((item, index) =>
      toThreadReply(item, index, likedIds.has(item.id)),
    ),
  };
}

export async function createGameTopic(
  gameId: string,
  input: TopicInput,
  userId: string,
): Promise<Post> {
  if (!userId) throw new Error("ログインしてください");
  if (!isUuid(gameId)) throw new Error("ゲームが見つかりません");

  const game = await requirePublishedGame(gameId);

  const category = (input.tags[0] ?? FALLBACK_CATEGORY).slice(0, 20);
  const title =
    input.title ||
    (await generatePostTitle({
      kind: "topic",
      gameTitle: game.title,
      body: input.body,
      extra: input.tags.join(" / "),
    }));
  const created = await prisma.topics.create({
    data: {
      game_id: gameId,
      title,
      category,
      posts: {
        create: {
          content: encodeFirstPost(input.body, input.tags),
          is_spoiler: input.spoiler,
          user_id: userId,
        },
      },
    },
    include: {
      posts: {
        include: { profiles: true },
        orderBy: { created_at: "asc" },
      },
    },
  });

  return toListPost(created);
}

export async function createTopicReply(
  gameId: string,
  topicId: string,
  input: ReplyInput,
  userId: string,
): Promise<ThreadReply> {
  if (!userId) throw new Error("ログインしてください");
  if (!isUuid(gameId) || !isUuid(topicId)) {
    throw new Error("スレッドが見つかりません");
  }

  const topic = await prisma.topics.findFirst({
    where: { id: topicId, game_id: gameId },
    include: {
      games: { select: { title: true, is_published: true } },
      _count: { select: { posts: true } },
    },
  });
  if (!topic || !topic.games.is_published) {
    throw new Error("スレッドが見つかりません");
  }

  const title = await generatePostTitle({
    kind: "reply",
    gameTitle: topic.games.title,
    body: input.content,
  });

  const created = await prisma.posts.create({
    data: {
      topic_id: topicId,
      user_id: userId,
      content: encodeReply(input.content, title),
      is_spoiler: input.spoiler,
      image_url: imageUrlForStore(input.imageUrl),
    },
    include: { profiles: true },
  });

  return toThreadReply(created, topic._count.posts);
}
