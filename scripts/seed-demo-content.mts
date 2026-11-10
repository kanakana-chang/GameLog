import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const { prisma } = await import("../src/lib/prisma");

const TEST_RE = /てすと|テスト|確認用/;

function metaComment(input: {
  hours: number;
  status: string;
  platform: string;
  f2p: number;
  title: string;
  body: string;
}) {
  return `<!--gl:${JSON.stringify({
    h: input.hours,
    s: input.status,
    p: input.platform,
    f: input.f2p,
    t: input.title,
  })}-->\n${input.body}`;
}

async function main() {
  const demo = await prisma.profiles.findFirst({
    where: { username: "demo" },
  });
  if (!demo) throw new Error("demo ユーザーが見つかりません");

  const testReviews = await prisma.reviews.findMany({
    select: { id: true, comment: true },
  });
  const reviewIds = testReviews
    .filter((row) => TEST_RE.test(row.comment ?? ""))
    .map((row) => row.id);
  if (reviewIds.length) {
    await prisma.reviews.deleteMany({ where: { id: { in: reviewIds } } });
  }

  const testPosts = await prisma.posts.findMany({
    select: { id: true, topic_id: true, content: true },
  });
  const topicIds = [
    ...new Set(
      testPosts
        .filter((row) => TEST_RE.test(row.content))
        .map((row) => row.topic_id),
    ),
  ];
  if (topicIds.length) {
    await prisma.topics.deleteMany({ where: { id: { in: topicIds } } });
  }

  const games = await prisma.games.findMany({
    where: { is_published: true },
    include: {
      reviews: { select: { id: true } },
      topics: { select: { id: true } },
      game_platform: { include: { platforms: true } },
    },
    orderBy: { created_at: "desc" },
  });

  for (const game of games) {
    const platform = game.game_platform[0]?.platforms.name ?? "Switch2";
    if (game.reviews.length === 0) {
      await prisma.reviews.create({
        data: {
          game_id: game.id,
          user_id: demo.id,
          rating_overall: 8.0,
          param_1: 8,
          param_2: 8,
          param_3: 7,
          param_4: 7,
          param_5: 6,
          comment: metaComment({
            hours: 18,
            status: "cleared",
            platform,
            f2p: 6,
            title: `${game.title}のプレイ記録`,
            body: `『${game.title}』をクリアしました。操作のテンポがよく、ストーリーも追いやすいです。無課金でも一通り楽しめました。`,
          }),
        },
      });
    }
    if (game.topics.length === 0) {
      await prisma.topics.create({
        data: {
          game_id: game.id,
          title: `${game.title}の攻略・感想`,
          category: "雑談",
          posts: {
            create: {
              user_id: demo.id,
              content: `<!--gl:${JSON.stringify({ tags: ["雑談"] })}-->\n『${game.title}』を遊んだ人の攻略や感想を共有するスレッドです。おすすめの進め方や詰まったところを教えてください。`,
            },
          },
        },
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        deletedReviews: reviewIds.length,
        deletedTopics: topicIds.length,
        games: games.length,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
