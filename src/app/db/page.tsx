import { createClient } from "@/utils/supabase/server";

type Game = {
  id: string;
  title: string;
};

export default async function Home() {
  const supabase = await createClient();
  const { data: games } = await supabase.from("games").select();

  return (
    <main className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Gameリスト</h1>
      <ul className="space-y-2">
        {games?.map((game: Game) => (
          <li key={game.id} className="rounded border p-2">
            {game.title}
          </li>
        ))}
      </ul>
    </main>
  );
}
