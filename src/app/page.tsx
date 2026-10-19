
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Search,
  ArrowUpRight,
  Wrench,
  Store,
  GraduationCap,
  Dumbbell,
  FlaskConical,
  Building2,
  CalendarDays,
  ShoppingBasket,
  ReceiptText,
  Sparkles,
  LayoutGrid,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const tools = [
  {
    name: 'Garage Management',
    description: 'Manage vehicle services, prices and customer work.',
    href: '/tools/garage',
    icon: Wrench,
    category: 'Business',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    name: 'Grocery Store ',
    description: 'Organize grocery products, prices and store orders.',
    href: '/tools/grocery',
    icon: ShoppingBasket,
    category: 'Business',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    name: 'Coaching Center',
    description: 'Manage students, subjects and coaching fees.',
    href: '/tools/school',
    icon: GraduationCap,
    category: 'Education',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Gym Management',
    description: 'Keep track of gym services and membership plans.',
    href: '/tools/gym',
    icon: Dumbbell,
    category: 'Business',
    color: 'bg-violet-100 text-violet-700',
  },
  {
    name: 'Clinic Management',
    description: 'Organize laboratory-related services and records.',
    href: '/tools/lab',
    icon: FlaskConical,
    category: 'Business',
    color: 'bg-cyan-100 text-cyan-700',
  },
  {
    name: 'Broker Tools',
    description: 'Manage brokerage-related business information.',
    href: '/tools/broker',
    icon: Building2,
    category: 'Business',
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    name: 'Event Management',
    description: 'Organize event services and booking details.',
    href: '/tools/event',
    icon: CalendarDays,
    category: 'Business',
    color: 'bg-pink-100 text-pink-700',
  },
  {
    name: 'Tax Tools',
    description: 'Access tools designed for tax-related workflows.',
    href: '/tools/tax',
    icon: ReceiptText,
    category: 'Finance',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    name: 'Bakery Management',
    description: 'Manage bakery products, pricing and daily work.',
    href: '/tools/baker',
    icon: Store,
    category: 'Business',
    color: 'bg-rose-100 text-rose-700',
  },
];

export default function Home() {
  const [search, setSearch] = useState('');

  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tools;

    return tools.filter((tool) =>
      `${tool.name} ${tool.description} ${tool.category}`
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <LayoutGrid size={23} />
            </span>
            <span>
              <span className="block text-xl font-extrabold tracking-tight">
                Biz<span className="text-indigo-600">Tools</span>
              </span>
              <span className="block text-xs text-slate-500">
                Your business workspace
              </span>
            </span>
          </Link>

          <a
            href="#tools"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            Explore tools
          </a>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-slate-950">
        <div className="absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-32 right-0 -z-10 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-indigo-200">
              <Sparkles size={16} />
              One place. Multiple business tools.
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Run your business
              <span className="block text-indigo-400">
                smarter with BizTools.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Discover practical tools for managing everyday business tasks,
              organizing information and keeping your work in one place.
            </p>

            <a
              href="#tools"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400"
            >
              Explore all tools <ArrowUpRight size={19} />
            </a>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-emerald-400" />
                Simple to use
              </span>
              <span className="flex items-center gap-2">
                <Zap size={17} className="text-amber-400" />
                Practical workflows
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Your workspace</p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  All in one place
                </h2>
              </div>
              <span className="rounded-2xl bg-indigo-400/15 p-3 text-indigo-300">
                <LayoutGrid size={27} />
              </span>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3">
              {tools.slice(0, 6).map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    href={tool.href}
                    key={tool.href}
                    aria-label={tool.name}
                    className="flex min-h-24 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-center transition hover:border-indigo-400/50 hover:bg-white/10"
                  >
                    <Icon size={23} className="text-indigo-300" />
                    <span className="text-xs font-medium text-slate-200">
                      {tool.name.replace(' Management', '').replace(' Tools', '')}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl bg-indigo-500/15 p-4">
              <p className="text-sm font-semibold text-indigo-200">
                Find the right tool for your work
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Browse the collection below and open the tool you need.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
              Tool collection
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Find your business tool
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Choose a tool to get started. Search by name or category to find
              what you need.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            <LayoutGrid size={16} className="text-indigo-600" />
            {filteredTools.length} tools available
          </span>
        </div>

        <div className="relative mt-8 max-w-xl">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search garage, school, grocery..."
            aria-label="Search business tools"
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        {filteredTools.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  href={tool.href}
                  key={tool.href}
                  className="group flex min-h-60 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/60"
                >
                  <div className="flex items-start justify-between">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tool.color}`}>
                      <Icon size={24} />
                    </span>
                    <ArrowUpRight
                      size={20}
                      className="text-slate-300 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-indigo-600"
                    />
                  </div>

                  <span className="mt-5 w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {tool.category}
                  </span>
                  <h3 className="mt-3 text-xl font-bold tracking-tight">
                    {tool.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                    {tool.description}
                  </p>
                  <span className="mt-5 text-sm font-bold text-indigo-600">
                    Open tool <span aria-hidden="true">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <Search size={30} className="mx-auto text-slate-400" />
            <h3 className="mt-4 text-lg font-bold">No tools found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Try another search term.
            </p>
            <button
              type="button"
              onClick={() => setSearch('')}
              className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Clear search
            </button>
          </div>
        )}
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            <span className="font-extrabold text-slate-900">BizTools</span>
            {' '}— Practical tools for everyday business.
          </p>
          <a href="#tools" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Browse tools ↑
          </a>
        </div>
      </footer>
    </main>
  );
}
