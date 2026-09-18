"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth-provider";
import { LogoutModal } from "./logout-modal";

const NAV_LINKS = ["レビュー", "掲示板", "ランキング", "記念カード"] as const;

function LogoMark() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
      <svg
        width={18}
        height={18}
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="2" />
        <circle cx="9" cy="9" r="3" fill="white" />
      </svg>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function AccountMenu() {
  const router = useRouter();
  const { avatarSrc, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!confirmOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConfirmOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirmOpen]);

  return (
    <>
      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex h-8 w-8 overflow-hidden rounded-full ring-1 ring-gray-200 transition hover:ring-indigo-400"
          aria-label="アカウントメニュー"
          aria-expanded={open}
        >
          <Image
            src={avatarSrc}
            alt="アカウント"
            width={32}
            height={32}
            className="h-8 w-8 object-cover"
          />
        </button>
        {open ? (
          <div className="absolute top-10 right-0 z-40 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
            <Link
              href="/mypage"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              マイページ
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              アカウント設定
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirmOpen(true);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              ログアウト
            </button>
          </div>
        ) : null}
      </div>
      {confirmOpen ? (
        <LogoutModal
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            logout();
            router.push("/");
          }}
        />
      ) : null}
    </>
  );
}

export function Header() {
  const { isLoggedIn } = useAuth();

  return (
    <header className="w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <LogoMark />
          <span className="text-lg font-bold tracking-tight text-gray-900">
            GameLog
          </span>
        </Link>

        <div className="relative max-w-sm flex-1">
          <SearchIcon />
          <input
            type="search"
            placeholder="ゲームを検索..."
            aria-label="ゲームを検索"
            className="w-full rounded-full border border-transparent bg-gray-100 py-2 pr-4 pl-9 text-sm transition-colors placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none"
          />
        </div>

        <nav className="ml-auto hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((label) => (
            <a
              key={label}
              href="#"
              className="text-sm whitespace-nowrap text-gray-600 transition-colors hover:text-gray-900"
            >
              {label}
            </a>
          ))}
        </nav>

        {isLoggedIn ? (
          <AccountMenu />
        ) : (
          <div className="flex shrink-0 items-center gap-4">
            <Link
              href="/login"
              className="text-sm whitespace-nowrap text-gray-600 transition-colors hover:text-gray-900"
            >
              ログイン
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800"
            >
              無料登録
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
