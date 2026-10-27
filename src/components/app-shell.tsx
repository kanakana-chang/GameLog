import { Footer } from "./footer";
import { Header } from "./header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full min-w-0 flex-col">
      <Header />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
