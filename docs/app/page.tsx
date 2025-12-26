import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-black text-white">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-center sm:text-left">
        <h1 className="text-5xl font-bold tracking-tight">tomcs</h1>
        <p className="text-xl text-gray-400 max-w-2xl">
          Build beautiful TUIs without the math. A collection of re-usable
          terminal components built with React and Ink. Copy and paste into your
          apps.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row bg-zinc-900 p-6 rounded-lg border border-zinc-800 font-mono text-sm">
          <div className="flex flex-col gap-2">
            <code className="text-green-400"># How to get started</code>
            <code>npx tomcs init</code>
            <code>npx tomcs add shell</code>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-4">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black gap-2 hover:bg-[#383838] hover:text-white dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 font-semibold"
            href="/docs"
          >
            Get Started
          </Link>
          <Link
            className="rounded-full border border-solid border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] hover:text-black dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://github.com/tomiwadoesux/tomcs-registry"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-zinc-500">
        <p>© 2025 tomcs. All rights reserved.</p>
      </footer>
    </div>
  );
}
