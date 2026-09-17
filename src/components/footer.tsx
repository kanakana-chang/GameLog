import Link from "next/link";

const NAV_LINKS = [
  { label: "レビュー", href: "#" },
  { label: "掲示板", href: "#" },
  { label: "ランキング", href: "#" },
  { label: "記念カード", href: "#" },
] as const;

const CATEGORY_LINKS = [
  { label: "Nintendo Switch", href: "#" },
  { label: "iOS / iPhone", href: "#" },
  { label: "Android", href: "#" },
  { label: "PlayStation 5", href: "#" },
  { label: "Steam / PC", href: "#" },
  { label: "ガチャゲー", href: "#" },
] as const;

const LEGAL_LINKS = [
  { label: "利用規約", href: "#" },
  { label: "プライバシーポリシー", href: "#" },
  { label: "お問い合わせ", href: "#" },
  { label: "運営会社", href: "#" },
] as const;

function FooterLogoMark() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
      <svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M3 5h2v2H3V5zm5-2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 2h1v1h-1V5zm0 2h1v1h-1V7zM2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z"
          fill="white"
        />
      </svg>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#12102a] text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <FooterLogoMark />
              <span className="text-xl font-bold tracking-tight">
                <span className="text-white">Game</span>
                <span className="text-indigo-400">Log</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              無課金での遊びやすさ・プレイボリューム・実際の口コミで、あなたにぴったりのゲームが見つかる。
            </p>
            <p className="text-xs text-slate-500">12,400以上のゲームを収録</p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="mb-1 text-xs font-semibold tracking-widest text-slate-500 uppercase">
              メニュー
            </h3>
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-slate-300 transition-colors duration-150 hover:text-indigo-400"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="mb-1 text-xs font-semibold tracking-widest text-slate-500 uppercase">
              カテゴリ
            </h3>
            {CATEGORY_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-slate-300 transition-colors duration-150 hover:text-indigo-400"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06]" />

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
        <p className="order-2 text-xs text-slate-500 sm:order-1">
          © {new Date().getFullYear()} GameLog. All rights reserved.
        </p>
        <div className="order-1 flex items-center gap-5 sm:order-2">
          {LEGAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-slate-500 transition-colors duration-150 hover:text-slate-300"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
