import Link from "next/link";
import { Brand } from "@/components/brand";
import { ChatShell } from "@/components/chat/chat-shell";
import { buttonVariants } from "@/components/ui/button";

export default function ChatPage() {
  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-white/50 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <Brand />
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Back to home
          </Link>
        </header>
        <ChatShell />
      </div>
    </main>
  );
}
