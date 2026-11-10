// 画面に渡すログイン中ユーザーの形。
export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatarSrc: string;
  aboutText: string;
  favoriteGenre: string;
  isAdmin: boolean;
};
