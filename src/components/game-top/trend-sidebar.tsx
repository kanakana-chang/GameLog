import { TRENDS } from "./data";
import { ChartIcon } from "./icons";

const FEATURES = [
  { icon: "⭐", label: "レビューを書く" },
  { icon: "🏆", label: "記念カードを作る" },
  { icon: "📋", label: "実績を登録する" },
  { icon: "💬", label: "掲示板で話す" },
] as const;

export function TrendSidebar() {
  return (
    <aside className="sticky top-20 rounded-2xl border border-[#e3e4ea] bg-white p-4">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#1a1c22]">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#ff4d84]">
          <ChartIcon />
        </span>
        トレンドキーワード
      </h3>
      <div className="space-y-3">
        {TRENDS.map((trend) => (
          <button
            key={trend.rank}
            type="button"
            className="group flex w-full items-center gap-3"
          >
            <span
              className={`w-5 shrink-0 text-right text-sm font-extrabold ${
                trend.rank <= 3 ? "text-[#5c4dff]" : "text-[#c0c2cc]"
              }`}
            >
              {trend.rank}
            </span>
            <span className="flex-1 text-left text-sm text-[#1a1c22] transition-colors group-hover:text-[#5c4dff]">
              {trend.title}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              <span
                className={`text-xs ${
                  trend.change === "up"
                    ? "text-emerald-500"
                    : trend.change === "down"
                      ? "text-[#ff4d84]"
                      : "text-[#c0c2cc]"
                }`}
              >
                {trend.change === "up"
                  ? "▲"
                  : trend.change === "down"
                    ? "▼"
                    : "─"}
              </span>
              <span className="text-xs text-[#7a7d8a]">{trend.count}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-5 border-t border-[#e3e4ea] pt-4">
        <h4 className="mb-3 text-xs font-bold tracking-widest text-[#7a7d8a] uppercase">
          主な機能
        </h4>
        {FEATURES.map((item) => (
          <button
            key={item.label}
            type="button"
            className="group flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-[#f5f6f8]"
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="text-sm text-[#1a1c22] transition-colors group-hover:text-[#5c4dff]">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
