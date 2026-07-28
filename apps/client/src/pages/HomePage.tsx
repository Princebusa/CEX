import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Radio,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import heroBg from "@/assets/hero.webp";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.65, ease: "easeOut" as const },
};

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-eggshell text-indigo">
      <Hero />
      <Ticker />
      <Product />
      <Features />
      <Pipeline />
      <CTA />
      <Footer />
    </main>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[calc(100vh-4rem)] flex justify-between items-center overflow-hidden px-6 pb-16 pt-16 md:pb-24 md:pt-20"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-black/35" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(224,122,95,0.12),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(129,178,154,0.12),_transparent_45%)]" />

      <motion.div style={{ y, opacity }} className="relative w-full max-w-7xl mx-auto">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="text-white font-display text-4xl tracking-tight text-indigo md:text-5xl"
            >
              trade<span className="italic text-peach">X</span>
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-white mt-6 max-w-xl font-display text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.95] tracking-tight"
            >
              Match orders.
              <br />
              <span className="italic text-peach">Move markets.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.25 }}
              className="mt-6 max-w-md text-base leading-relaxed text-white font-medium tracking-[.4px] md:text-[18px]"
            >
              A price-time priority engine with a live order book, streaming
              fills, and settlement you can trust.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/markets"
                className="group inline-flex items-center gap-2 rounded-full bg-indigo px-6 py-3.5 text-sm font-medium text-eggshell transition-colors hover:bg-peach"
              >
                Open markets
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full border border-indigo/15 bg-white/90 px-6 py-3.5 text-sm font-medium text-indigo backdrop-blur transition-colors hover:border-indigo/35"
              >
                Create account
              </Link>
            </motion.div>
          </div>

          <HeroTerminal />
        </div>
      </motion.div>
    </section>
  );
}

function HeroTerminal() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, []);

  const asks = [
    { p: 189.55, q: 120 },
    { p: 189.5, q: 85 },
    { p: 189.48, q: 210 },
  ];
  const bids = [
    { p: 189.42, q: 160 },
    { p: 189.4, q: 95 },
    { p: 189.35, q: 240 },
  ];
  const maxQ = 240;

  return (
    <motion.div
      initial={{ opacity: 0, x: 36 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.85, delay: 0.3, ease: "easeOut" }}
      className="relative hidden lg:block"
    >
      <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-peach/10 via-transparent to-teal/10 blur-2xl" />

      <div className="relative overflow-hidden rounded-3xl border border-indigo/10 bg-white shadow-[0_40px_100px_-48px_rgba(61,64,91,0.45)]">
        <div className="flex items-center justify-between border-b border-indigo/10 bg-eggshell/60 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-indigo/55">
              TATA · L2
            </span>
          </div>
          <span className="font-mono text-sm tabular-nums text-indigo">189.42</span>
        </div>

        <div className="grid grid-cols-3 px-5 py-2 font-mono text-[10px] uppercase tracking-widest text-indigo/35">
          <span>Price</span>
          <span className="text-right">Size</span>
          <span className="text-right">Total</span>
        </div>

        <div className="space-y-0.5 px-2 pb-2">
          {[...asks].reverse().map((l) => (
            <DepthRow key={`a-${l.p}`} {...l} side="ask" maxQ={maxQ} />
          ))}
        </div>

        <div className="flex items-center justify-between border-y border-indigo/10 bg-eggshell/40 px-5 py-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-indigo/40">
            Last
          </span>
          <motion.span
            key={tick}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 font-mono text-base tabular-nums text-teal"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            189.42
          </motion.span>
        </div>

        <div className="space-y-0.5 px-2 py-2">
          {bids.map((l) => (
            <DepthRow key={`b-${l.p}`} {...l} side="bid" maxQ={maxQ} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function DepthRow({
  p,
  q,
  side,
  maxQ,
}: {
  p: number;
  q: number;
  side: "ask" | "bid";
  maxQ: number;
}) {
  const ask = side === "ask";
  const width = `${(q / maxQ) * 100}%`;

  return (
    <div
      className={`relative grid grid-cols-3 gap-2 rounded-md px-3 py-1.5 font-mono text-[12px] tabular-nums ${
        ask ? "text-peach" : "text-teal"
      }`}
    >
      <div
        className={`absolute inset-y-0 right-0 rounded-md ${ask ? "bg-peach/12" : "bg-teal/12"}`}
        style={{ width }}
      />
      <span className="relative">{p.toFixed(2)}</span>
      <span className="relative text-right text-indigo/70">{q}</span>
      <span className="relative text-right text-indigo/35">{(p * q).toFixed(0)}</span>
    </div>
  );
}

const TICKER = [
  { s: "TATA", p: 189.42, c: 1.24 },
  { s: "RELI", p: 2841.1, c: -0.56 },
  { s: "INFY", p: 1642.5, c: 2.31 },
  { s: "HDFC", p: 1689.0, c: 0.42 },
  { s: "TCS", p: 3921.4, c: -1.12 },
  { s: "SBIN", p: 812.3, c: 0.88 },
];

function Ticker() {
  return (
    <section className="ticker-mask overflow-hidden border-y border-indigo/10 bg-indigo py-3.5 text-eggshell">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      >
        {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
          <div key={i} className="flex items-center gap-3 font-mono text-sm">
            <span className="text-eggshell/45">{t.s}</span>
            <span className="tabular-nums">{t.p.toFixed(2)}</span>
            <span className={t.c >= 0 ? "text-teal" : "text-peach"}>
              {t.c >= 0 ? "+" : ""}
              {t.c.toFixed(2)}%
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function Product() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-peach">
            The book
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">
            Depth you can trade against.
            <span className="italic text-peach"> Instantly.</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-indigo/65">
            Bids and asks stream over websockets. Limit and market orders match
            in memory — then settle into positions and P/L.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="mt-14 grid gap-4 md:grid-cols-3"
        >
          {[
            {
              title: "Live depth",
              body: "Aggregated L2 levels with real-time updates as the book changes.",
            },
            {
              title: "Price-time priority",
              body: "Better price first. Same price — earlier order wins. Deterministic.",
            },
            {
              title: "Settled fills",
              body: "Matched trades update wallets, holdings, and unrealized P/L.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-indigo/10 bg-white/70 p-7 backdrop-blur"
            >
              <div className="font-mono text-[11px] text-peach">0{i + 1}</div>
              <h3 className="mt-4 font-display text-2xl tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-indigo/60">{item.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Zap,
      title: "In-memory matching",
      body: "Orders hit a per-symbol book and match without waiting on the database.",
    },
    {
      icon: Radio,
      title: "Streaming everything",
      body: "Order book, trades, and order status push over Redis pub/sub to the UI.",
    },
    {
      icon: ShieldCheck,
      title: "Idempotent settlement",
      body: "Every fill settles once — wallets and positions stay consistent.",
    },
    {
      icon: Workflow,
      title: "Clean exit paths",
      body: "Cancel resting limits. Exit holdings only when the book has liquidity.",
    },
  ];

  return (
    <section className="bg-indigo px-6 py-24 text-eggshell md:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-peach">
            Engine
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">
            Built like a real exchange.
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-eggshell/10 md:grid-cols-2">
          {items.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="bg-indigo p-8 transition-colors hover:bg-indigo/80 md:p-10"
            >
              <f.icon className="mb-8 h-5 w-5 text-peach" />
              <h3 className="font-display text-2xl">{f.title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-eggshell/55">
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pipeline() {
  const steps = [
    { k: "01", t: "Place", d: "Limit or market — buy and sell hit the stream." },
    { k: "02", t: "Match", d: "Engine pairs opposite sides by price-time rules." },
    { k: "03", t: "Settle", d: "Consumer updates balances, positions, history." },
    { k: "04", t: "Stream", d: "UI refreshes live — book, tape, and P/L." },
  ];

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-peach">
            Flow
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">
            Four hops.
            <span className="italic text-peach"> Done.</span>
          </h2>
        </motion.div>

        <div className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <div className="absolute left-0 right-0 top-3 hidden h-px bg-indigo/10 md:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.k}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-peach ring-4 ring-eggshell" />
                <span className="font-mono text-xs text-indigo/40">{s.k}</span>
              </div>
              <h3 className="font-display text-2xl">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-indigo/60">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 pb-28">
      <motion.div
        {...fadeUp}
        className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-indigo/10 bg-white px-8 py-16 text-center shadow-[0_40px_100px_-60px_rgba(61,64,91,0.35)] md:px-16 md:py-20"
      >
        <h2 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">
          Ready to
          <br />
          <span className="italic text-peach">run the book?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-indigo/60">
          Open a market, place a limit, watch the match — then track holdings
          with live P/L.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/markets"
            className="group inline-flex items-center gap-2 rounded-full bg-indigo px-7 py-3.5 text-sm font-medium text-eggshell transition-colors hover:bg-peach"
          >
            Start trading
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full border border-indigo/15 px-7 py-3.5 text-sm font-medium text-indigo transition-colors hover:border-indigo/40"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-indigo/10 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-indigo/50 md:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="grid h-5 w-5 place-items-center rounded-sm bg-indigo">
            <div className="h-1.5 w-1.5 bg-peach" />
          </div>
          <span className="font-display text-lg text-indigo">
            trade<span className="italic text-peach">X</span>
          </span>
        </div>
        <p className="font-mono text-xs text-indigo/40">
          Matching engine · order book · settlement
        </p>
        <a
          href="https://github.com/Princebusa/CEX"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-indigo"
        >
          Source
          <ArrowDownRight className="h-3.5 w-3.5 rotate-[-90deg]" />
        </a>
      </div>
    </footer>
  );
}
