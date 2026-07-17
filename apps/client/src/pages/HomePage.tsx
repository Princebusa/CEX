import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Zap, Layers, Gauge, GitBranch, Code2 } from "lucide-react";
const Github = Code2;



const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-eggshell text-indigo overflow-x-hidden">

      <Hero />
      <Ticker />
      <OrderbookSection />
      <Features />
      <MatchingFlow />
      <Metrics />
      <CTA />
      <Footer />
    </main>
  );
}



function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={ref} className="relative pt-25 pb-24 md:pt-35 md:pb-32 px-6">
      <motion.div style={{ y, opacity }} className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-indigo/60 mb-8"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-peach animate-pulse" />
              Resume project · v1.0
            </motion.div>

            <h1 className="font-display text-[clamp(3rem,9vw,8rem)] leading-[0.95] tracking-tight max-w-5xl">
              {"A matching engine".split(" ").map((w, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.08, ease: "easeOut" as const }}
                  className="inline-block mr-4"
                >
                  {w}
                </motion.span>
              ))}
              <br />
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" as const }}
                className="inline-block italic text-peach"
              >
                built for speed.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-10 max-w-xl text-lg text-indigo/70 leading-relaxed"
            >
              TradeX is a price-time priority order matching engine with a live orderbook,
              streaming trades, and deterministic execution — engineered from first principles.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.75 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <a
                href="#orderbook"
                className="group inline-flex items-center gap-2 bg-indigo text-eggshell px-6 py-3.5 rounded-full text-sm font-medium hover:bg-peach transition-colors"
              >
                See it live
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <a
                href="https://github.com/Princebusa/CEX"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium border border-indigo/20 hover:border-indigo/50 transition-colors"
              >
                <Github className="h-4 w-4" />
                View source
              </a>
            </motion.div>
          </div>

          <HeroVisual />
        </div>
      </motion.div>
    </section>
  );
}

function HeroVisual() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => p + 1), 1200);
    return () => clearInterval(id);
  }, []);

  const candles = [
    { h: 48, o: 28, c: 38, up: true },
    { h: 42, o: 34, c: 26, up: false },
    { h: 56, o: 30, c: 48, up: true },
    { h: 50, o: 44, c: 40, up: false },
    { h: 62, o: 38, c: 54, up: true },
    { h: 58, o: 52, c: 46, up: false },
    { h: 70, o: 46, c: 62, up: true },
    { h: 64, o: 58, c: 52, up: false },
    { h: 74, o: 52, c: 68, up: true },
    { h: 68, o: 64, c: 60, up: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: 30 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" as const }}
      className="relative hidden lg:flex items-center justify-center"
    >
      <div className="relative w-full max-w-md aspect-square">
        {/* Animated gradient ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-dashed border-indigo/20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-6 rounded-full border border-indigo/10"
        />

        {/* Central card */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative w-64 rounded-2xl bg-white border border-indigo/10 shadow-[0_30px_80px_-40px_rgba(61,64,91,0.3)] p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo/60">AAPL · Live</span>
              </div>
              <span className="font-mono text-sm text-indigo">189.42</span>
            </div>

            {/* Candle chart */}
            <div className="flex items-end justify-between h-24 gap-1 mb-4">
              {candles.map((c, i) => {
                const bodyHeight = Math.abs(c.o - c.c);
                const bottom = Math.min(c.o, c.c);
                return (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 + i * 0.05 }}
                    className="relative w-full flex justify-center origin-bottom"
                    style={{ height: c.h }}
                  >
                    <div
                      className="absolute w-px bg-indigo/30"
                      style={{ height: c.h, bottom: 0 }}
                    />
                    <div
                      className={`absolute w-full rounded-sm ${c.up ? "bg-teal" : "bg-peach"}`}
                      style={{ height: bodyHeight, bottom }}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Depth bars */}
            <div className="space-y-1.5">
              {[
                { s: 90, c: "bg-peach" },
                { s: 70, c: "bg-peach/70" },
                { s: 55, c: "bg-peach/50" },
                { s: 80, c: "bg-teal" },
                { s: 60, c: "bg-teal/70" },
                { s: 45, c: "bg-teal/50" },
              ].map((b, i) => (
                <motion.div
                  key={i}
                  animate={{ width: [`${b.s}%`, `${b.s * 0.85}%`, `${b.s}%`] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }}
                  className={`h-1.5 rounded-full ${b.c} ${i < 3 ? "ml-auto" : "mr-auto"}`}
                  style={{ width: `${b.s}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Orbiting order bubbles */}
        {[
          { label: "BUY 150", color: "bg-teal", dur: 16 },
          { label: "SELL 80", color: "bg-peach", dur: 12 },
          { label: "MATCH", color: "bg-indigo text-eggshell", dur: 10 },
        ].map((o, i) => (
          <motion.div
            key={o.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 + i * 0.15 }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium shadow-lg orbit ${o.color}`}
            style={{
              ["--orbit-duration" as string]: `${o.dur}s`,
              ["--orbit-radius" as string]: "190px",
              animationDelay: `${-i * (o.dur / 3)}s`,
            }}
          >
            {o.label}
          </motion.div>
        ))}

        {/* Pulse ring on match */}
        <motion.div
          key={pulse}
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" as const }}
          className="absolute inset-0 rounded-full border border-peach/40 pointer-events-none"
        />
      </div>
    </motion.div>
  );
}

const TICKER = [
  { s: "AAPL", p: 189.42, c: 1.24 },
  { s: "NVDA", p: 872.10, c: -0.56 },
  { s: "TSLA", p: 251.78, c: 2.31 },
  { s: "MSFT", p: 421.05, c: 0.42 },
  { s: "GOOG", p: 168.90, c: -1.12 },
  { s: "AMZN", p: 189.30, c: 0.88 },
  { s: "META", p: 512.44, c: 1.94 },
  { s: "INFY", p: 1642.5, c: -0.31 },
];

function Ticker() {
  return (
    <section className="border-y border-indigo/10 bg-indigo text-eggshell py-4 overflow-hidden ticker-mask">
      <motion.div
        className="flex gap-14 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
          <div key={i} className="flex items-center gap-3 font-mono text-sm">
            <span className="text-eggshell/50">{t.s}</span>
            <span>{t.p.toFixed(2)}</span>
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

function OrderbookSection() {
  return (
    <section id="orderbook" className="px-6 py-32">
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
        <motion.div {...fadeUp}>
          <div className="text-xs uppercase tracking-[0.2em] text-peach mb-6">01 · Orderbook</div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.05] tracking-tight">
            Every bid, every ask.<br />
            <span className="italic text-peach">Live.</span>
          </h2>
          <p className="mt-6 text-indigo/70 leading-relaxed max-w-md">
            A depth-sorted L2 orderbook streams over websockets. Aggregated by price level,
            reconciled per tick — the same view your matching engine sees.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Aggregated depth by price level",
              "Delta updates over websocket",
              "Deterministic snapshot + patch model",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="h-1 w-4 bg-peach" />
                {t}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.1 }}>
          <LiveOrderbook />
        </motion.div>
      </div>
    </section>
  );
}

type Level = { price: number; size: number };
function LiveOrderbook() {
  const [bids, setBids] = useState<Level[]>(() =>
    Array.from({ length: 8 }, (_, i) => ({ price: 189.4 - i * 0.05, size: Math.random() * 800 + 200 })),
  );
  const [asks, setAsks] = useState<Level[]>(() =>
    Array.from({ length: 8 }, (_, i) => ({ price: 189.45 + i * 0.05, size: Math.random() * 800 + 200 })),
  );
  const [last, setLast] = useState({ price: 189.42, up: true });

  useEffect(() => {
    const id = setInterval(() => {
      setBids((prev) =>
        prev.map((l, i) => ({ ...l, size: Math.max(80, l.size + (Math.random() - 0.5) * (i === 0 ? 300 : 150)) })),
      );
      setAsks((prev) =>
        prev.map((l, i) => ({ ...l, size: Math.max(80, l.size + (Math.random() - 0.5) * (i === 0 ? 300 : 150)) })),
      );
      setLast((prev) => {
        const delta = (Math.random() - 0.5) * 0.08;
        const np = +(prev.price + delta).toFixed(2);
        return { price: np, up: delta >= 0 };
      });
    }, 900);
    return () => clearInterval(id);
  }, []);

  const maxBid = Math.max(...bids.map((b) => b.size));
  const maxAsk = Math.max(...asks.map((a) => a.size));

  return (
    <div className="rounded-2xl bg-white border border-indigo/10 shadow-[0_30px_80px_-40px_rgba(61,64,91,0.35)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-indigo/10 bg-eggshell/50">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-indigo/60">AAPL · L2</span>
        </div>
        <span className="text-xs font-mono text-indigo/50">USD</span>
      </div>

      <div className="grid grid-cols-3 px-5 py-2 text-[10px] uppercase tracking-widest text-indigo/40 font-mono">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (reversed so best ask nearest to spread) */}
      <div className="px-2">
        {[...asks].reverse().map((l, i) => {
          const pct = (l.size / maxAsk) * 100;
          return (
            <div key={`a-${i}`} className="relative grid grid-cols-3 px-3 py-1 font-mono text-xs">
              <div className="absolute inset-y-0 right-0 bg-peach/15" style={{ width: `${pct}%` }} />
              <span className="relative text-peach">{l.price.toFixed(2)}</span>
              <span className="relative text-right text-indigo/80">{l.size.toFixed(0)}</span>
              <span className="relative text-right text-indigo/50">{(l.size * l.price).toFixed(0)}</span>
            </div>
          );
        })}
      </div>

      {/* Last trade */}
      <div className="flex items-center justify-between px-5 py-3 border-y border-indigo/10 bg-eggshell/30">
        <span className="text-xs uppercase tracking-widest text-indigo/50 font-mono">Last</span>
        <motion.div
          key={last.price}
          initial={{ scale: 0.95, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`flex items-center gap-1.5 font-mono text-base ${last.up ? "text-teal" : "text-peach"}`}
        >
          {last.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {last.price.toFixed(2)}
        </motion.div>
      </div>

      {/* Bids */}
      <div className="px-2 pb-3">
        {bids.map((l, i) => {
          const pct = (l.size / maxBid) * 100;
          return (
            <div key={`b-${i}`} className="relative grid grid-cols-3 px-3 py-1 font-mono text-xs">
              <div className="absolute inset-y-0 right-0 bg-teal/20" style={{ width: `${pct}%` }} />
              <span className="relative text-teal">{l.price.toFixed(2)}</span>
              <span className="relative text-right text-indigo/80">{l.size.toFixed(0)}</span>
              <span className="relative text-right text-indigo/50">{(l.size * l.price).toFixed(0)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: Layers,
    title: "Price-time priority",
    body: "Deterministic FIFO within each price level. Same rules the majors use.",
  },
  {
    icon: Zap,
    title: "Sub-ms matching",
    body: "In-memory book with tuned data structures. Match, ack, broadcast — hot path only.",
  },
  {
    icon: Gauge,
    title: "Live orderbook",
    body: "Websocket L2 stream with snapshot + delta reconciliation on the client.",
  },
  {
    icon: GitBranch,
    title: "Order types",
    body: "Limit, market, IOC, FOK — cancel-replace with correct queue position semantics.",
  },
];

function Features() {
  return (
    <section id="engine" className="px-6 py-32 bg-indigo text-eggshell">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.2em] text-apricot mb-6">02 · Engine</div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.05] tracking-tight">
            Small surface.<br />
            <span className="italic text-apricot">Serious internals.</span>
          </h2>
        </motion.div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-eggshell/10 rounded-2xl overflow-hidden">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-indigo p-8 hover:bg-indigo/70 transition-colors group"
            >
              <f.icon className="h-5 w-5 text-peach mb-8 group-hover:scale-110 transition-transform" />
              <h3 className="font-display text-2xl mb-3">{f.title}</h3>
              <p className="text-sm text-eggshell/60 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MatchingFlow() {
  const steps = [
    { k: "01", t: "Order arrives", d: "Validated, timestamped, assigned a monotonic sequence id." },
    { k: "02", t: "Book lookup", d: "Best opposing level fetched from an ordered price map." },
    { k: "03", t: "Priority match", d: "FIFO within price. Fill greedily until size zero or price crosses." },
    { k: "04", t: "Broadcast", d: "Trade prints + book delta stream out over websocket to every client." },
  ];
  return (
    <section id="flow" className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="max-w-2xl mb-16">
          <div className="text-xs uppercase tracking-[0.2em] text-peach mb-6">03 · Matching</div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.05] tracking-tight">
            One order.<br />
            <span className="italic text-peach">Four hops.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          <div className="absolute top-4 left-0 right-0 h-px bg-indigo/15 hidden md:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.k}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative"
            >
              <div className="relative flex items-center gap-3 mb-6">
                <div className="h-2 w-2 rounded-full bg-peach ring-4 ring-eggshell" />
                <span className="font-mono text-xs text-indigo/50">{s.k}</span>
              </div>
              <h3 className="font-display text-2xl mb-2">{s.t}</h3>
              <p className="text-sm text-indigo/60 leading-relaxed">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  const stats = [
    { v: "0.4ms", l: "p50 match latency" },
    { v: "120k", l: "orders / sec" },
    { v: "8", l: "supported order types" },
    { v: "100%", l: "deterministic" },
  ];
  return (
    <section id="metrics" className="px-6 py-32 bg-apricot/40">
      <div className="mx-auto max-w-7xl grid md:grid-cols-4 gap-10">
        {stats.map((s, i) => (
          <motion.div
            key={s.l}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
          >
            <div className="font-display text-6xl md:text-7xl leading-none tracking-tight text-indigo">
              {s.v}
            </div>
            <div className="mt-3 text-sm text-indigo/60">{s.l}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 py-32">
      <motion.div
        {...fadeUp}
        className="mx-auto max-w-5xl text-center"
      >
        <h2 className="font-display text-6xl md:text-8xl leading-[0.95] tracking-tight">
          Read the code.<br />
          <span className="italic text-peach">Run the book.</span>
        </h2>
        <p className="mt-8 text-indigo/70 max-w-lg mx-auto">
          Fully open. Fork it, benchmark it, or drop a limit order into the live demo book.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          
          <a
            href="https://github.com/Princebusa/CEX"
            className="inline-flex items-center gap-2 bg-indigo text-eggshell px-6 py-3.5 rounded-full text-sm font-medium hover:bg-peach transition-colors"
          >
            <Github className="h-4 w-4" /> Github
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-indigo/10 px-6 py-10">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-indigo/60">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-sm bg-indigo grid place-items-center">
            <div className="h-1.5 w-1.5 bg-peach" />
          </div>
          <span className="font-display text-lg text-indigo">tradeX</span>
        </div>
        <p className="font-mono text-xs">© {new Date().getFullYear()} · Built as a resume project.</p>
      </div>
    </footer>
  );
}
