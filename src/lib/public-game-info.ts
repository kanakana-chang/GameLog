// Wikipedia API から概要用の公開情報を取る。Star Fox は Switch 2 節を優先する。
import type { SearchGame } from "@/components/game-search/data";

export type PublicSource = {
  title: string;
  url: string;
};

export type PublicGameInfo = {
  extract: string;
  description: string;
  pageTitle: string;
  sources: PublicSource[];
};

export type WikiHint = {
  title: string;
  sectionAnchor?: string;
  sourceTitle?: string;
};

const WIKI_HINTS: Record<string, WikiHint> = {
  "Star Fox": {
    title: "スターフォックス64",
    sectionAnchor: "Star_Fox（Switch_2）",
    sourceTitle: "Wikipedia『スターフォックス64』「Star Fox（Switch 2）」",
  },
};

type WikiSection = {
  index: string;
  line: string;
  anchor: string;
};

export function getWikiHint(game: SearchGame): WikiHint | null {
  return WIKI_HINTS[game.title] ?? null;
}

export function wikiHintSourceUrl(hint: WikiHint) {
  const page = `https://ja.wikipedia.org/wiki/${encodeURIComponent(hint.title)}`;
  return hint.sectionAnchor ? `${page}#${hint.sectionAnchor}` : page;
}

const WIKI_API = "https://ja.wikipedia.org/w/api.php";
const WIKI_HEADERS = {
  Accept: "application/json",
  "User-Agent": "GameLog/1.0 (game encyclopedia; local development)",
};

type WikiSearchItem = {
  title: string;
  snippet?: string;
};

type WikiPage = {
  title?: string;
  extract?: string;
  fullurl?: string;
  missing?: unknown;
};

function decodeSnippet(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .trim();
}

function mentionsGame(text: string, game: SearchGame) {
  return text.includes(game.title) || text.includes(`『${game.title}』`);
}

function pageScore(game: SearchGame, item: WikiSearchItem) {
  const title = item.title;
  if (
    title.includes("アニメ") ||
    title.includes("THE MOVIE") ||
    title.includes("映画")
  ) {
    return 0;
  }
  if (title === game.title) return 100;
  if (title.includes(game.title) || game.title.includes(title)) return 90;
  const snippet = decodeSnippet(item.snippet ?? "");
  if (!mentionsGame(`${title}${snippet}`, game)) return 0;
  if (/(ゲーム|ソフト|アプリ|発売)/.test(snippet)) return 40;
  return 5;
}

async function wikiJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: WIKI_HEADERS,
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Wikipedia request failed: ${response.status}`);
  }
  return response.json();
}

function pageFromQuery(data: unknown): WikiPage | null {
  const pages = (data as { query?: { pages?: Record<string, WikiPage> } }).query
    ?.pages;
  const page = Object.values(pages ?? {})[0];
  if (!page || page.missing || !page.extract) return null;
  return page;
}

function htmlToPlain(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h[1-6]|tr|div|li|dt|dd)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/引用エラー[^\n]*/g, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function toPublicInfo(
  page: WikiPage,
  game: SearchGame,
  hint?: WikiHint,
): PublicGameInfo | null {
  const extract = page.extract ?? "";
  if (!hint && !mentionsGame(extract, game)) return null;
  const pageTitle = page.title ?? hint?.title ?? game.title;
  const url = hint
    ? wikiHintSourceUrl(hint)
    : (page.fullurl ??
      `https://ja.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`);
  return {
    extract,
    description: takeSentences(cleanWikiExtract(extract), 2),
    pageTitle,
    sources: [
      {
        title: hint?.sourceTitle ?? `Wikipedia『${pageTitle}』`,
        url,
      },
    ],
  };
}

async function fetchWikiSection(
  pageTitle: string,
  sectionAnchor: string,
): Promise<WikiPage | null> {
  const sectionsUrl = new URL(WIKI_API);
  sectionsUrl.searchParams.set("action", "parse");
  sectionsUrl.searchParams.set("page", pageTitle);
  sectionsUrl.searchParams.set("prop", "sections");
  sectionsUrl.searchParams.set("utf8", "1");
  sectionsUrl.searchParams.set("format", "json");
  const sectionData = (await wikiJson(sectionsUrl.toString())) as {
    parse?: { sections?: WikiSection[] };
  };
  const wanted = sectionAnchor.replace(/ /g, "_");
  const match = (sectionData.parse?.sections ?? []).find((section) => {
    const anchor = (section.anchor ?? "").replace(/ /g, "_");
    const line = section.line.replace(/ /g, "_");
    return anchor === wanted || line === wanted;
  });
  if (!match) return null;

  const parseUrl = new URL(WIKI_API);
  parseUrl.searchParams.set("action", "parse");
  parseUrl.searchParams.set("page", pageTitle);
  parseUrl.searchParams.set("prop", "text");
  parseUrl.searchParams.set("section", match.index);
  parseUrl.searchParams.set("disableeditsection", "1");
  parseUrl.searchParams.set("utf8", "1");
  parseUrl.searchParams.set("format", "json");
  const parsed = (await wikiJson(parseUrl.toString())) as {
    parse?: { text?: { "*": string } };
  };
  const extract = htmlToPlain(parsed.parse?.text?.["*"] ?? "");
  if (!extract) return null;
  return {
    title: pageTitle,
    extract,
    fullurl: wikiHintSourceUrl({
      title: pageTitle,
      sectionAnchor: match.anchor || sectionAnchor,
    }),
  };
}

async function fetchWikiPage(title: string): Promise<WikiPage | null> {
  const extractUrl = new URL(WIKI_API);
  extractUrl.searchParams.set("action", "query");
  extractUrl.searchParams.set("prop", "extracts|info");
  extractUrl.searchParams.set("exchars", "1800");
  extractUrl.searchParams.set("explaintext", "1");
  extractUrl.searchParams.set("inprop", "url");
  extractUrl.searchParams.set("titles", title);
  extractUrl.searchParams.set("redirects", "1");
  extractUrl.searchParams.set("utf8", "1");
  extractUrl.searchParams.set("format", "json");
  return pageFromQuery(await wikiJson(extractUrl.toString()));
}

export function cleanWikiExtract(extract: string) {
  return extract
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (/^==/.test(line)) return false;
      if (/声\s*-/.test(line)) return false;
      if (/^（英:/.test(line)) return false;
      if (!line.includes("。") && line.length < 40) return false;
      return true;
    })
    .join("");
}

export function takeSentences(text: string, max = 5) {
  const sentences = text
    .split(/(?<=。)/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 18);
  return sentences.slice(0, max).join("");
}

async function fetchHintedWikiInfo(game: SearchGame) {
  const hint = getWikiHint(game);
  if (!hint) return null;
  const page = hint.sectionAnchor
    ? await fetchWikiSection(hint.title, hint.sectionAnchor)
    : await fetchWikiPage(hint.title);
  return page ? toPublicInfo(page, game, hint) : null;
}

export async function fetchPublicGameInfo(
  game: SearchGame,
): Promise<PublicGameInfo | null> {
  try {
    const hinted = await fetchHintedWikiInfo(game);
    if (hinted) return hinted;

    const exact = await fetchWikiPage(game.title);
    const fromExact = exact ? toPublicInfo(exact, game) : null;
    if (fromExact) return fromExact;

    const search = new URL(WIKI_API);
    search.searchParams.set("action", "query");
    search.searchParams.set("list", "search");
    search.searchParams.set("srsearch", game.title);
    search.searchParams.set("srlimit", "8");
    search.searchParams.set("utf8", "1");
    search.searchParams.set("format", "json");

    const searchData = (await wikiJson(search.toString())) as {
      query?: { search?: WikiSearchItem[] };
    };
    const ranked = [...(searchData.query?.search ?? [])]
      .map((item) => ({ item, score: pageScore(game, item) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    for (const { item } of ranked) {
      if (item.title === game.title) continue;
      const page = await fetchWikiPage(item.title);
      const info = page ? toPublicInfo(page, game) : null;
      if (info) return info;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch public game info", error);
    return null;
  }
}
