import Image from "next/image";
import { STATUS_COLORS, PLATFORM_COLORS, type Game } from "./data";
import { IconStar } from "./icons";

export function GameCard({ game }: { game: Game }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-line shadow-sm transition-shadow hover:shadow-md">
        <Image
          src={game.cover}
          alt={game.title}
          fill
          sizes="(max-width: 672px) 33vw, 210px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="absolute right-2 bottom-2 left-2">
            <p className="line-clamp-2 text-[10px] leading-tight font-semibold text-white">
              {game.title}
            </p>
          </div>
        </div>
        <div className="absolute top-1.5 left-1.5">
          <span
            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${STATUS_COLORS[game.status]}`}
          >
            {game.status}
          </span>
        </div>
        {game.rating ? (
          <div className="absolute top-1.5 right-1.5 flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={index < game.rating! ? "text-amber-400" : "text-white/30"}
              >
                <IconStar size={8} filled={index < game.rating!} />
              </span>
            ))}
          </div>
        ) : null}
        <div className="absolute right-1.5 bottom-1.5">
          <span className="rounded-full bg-black/60 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white">
            {game.hours}h
          </span>
        </div>
      </div>
      <div className="mt-1.5 px-0.5">
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${PLATFORM_COLORS[game.platform]}`}
        >
          {game.platform}
        </span>
      </div>
    </div>
  );
}
