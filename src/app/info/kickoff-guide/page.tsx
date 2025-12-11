import { NavbarServerConfig } from "@/components/NavbarServerConfig";
import { BookOpen, Cpu, Wrench, Calendar, Trophy, Database, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";

const sections = [
    {
        title: "Strategic Design",
        description: "Learn the golden rules of FRC design, from 'Keep it Simple' to 'Steal from the Best'. Master the art of analyzing games and building winning strategies.",
        icon: Rocket,
        href: "/info/kickoff-guide/strategic-design",
        color: "from-[var(--accent)] to-[var(--primary)]",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
        borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
        title: "Mechanism Design",
        description: "Deep dive into drivetrains, intakes, shooters, and elevators. Understand motors vs pneumatics, game piece processing, and device alignment.",
        icon: Cpu,
        href: "/info/kickoff-guide/mechanism-design",
        color: "from-[var(--accent)] to-[var(--primary)]",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
        borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
        title: "Build Season",
        description: "Navigate the intense 6-week build period. From kickoff analysis to prototyping deadlines, learn how to manage time and iterate rapidly.",
        icon: Wrench,
        href: "/info/kickoff-guide/build-season",
        color: "from-[var(--accent)] to-[var(--primary)]",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
        borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
        title: "Competition Season",
        description: "Master quals, playoffs, and alliance selection. Learn defensive strategies, match preparation, and how to adapt between regionals.",
        icon: Trophy,
        href: "/info/kickoff-guide/competition-season",
        color: "from-[var(--accent)] to-[var(--primary)]",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
        borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
        title: "Scouting & Data",
        description: "Collect objective, subjective, and pit data. Calculate OPR, EPA, and CCWM. Build picklists and create winning match strategies.",
        icon: Database,
        href: "/info/kickoff-guide/scouting-data",
        color: "from-[var(--accent)] to-[var(--primary)]",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
        borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
        title: "FRC Strategy Overview",
        description: "Quick reference guide covering competition structure, ranking points, robot tiers, drafting strategies, and essential FRC vocabulary.",
        icon: BookOpen,
        href: "/info/strategy",
        color: "from-[var(--accent)] to-[var(--primary)]",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
        borderColor: "border-blue-200 dark:border-blue-800"
    }
];

export default function KickoffGuidePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-purple-50/30 dark:from-neutral-950 dark:via-blue-950/10 dark:to-purple-950/10 text-neutral-900 dark:text-neutral-50">
            <NavbarServerConfig />

            <main className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Hero Header */}
                <header className="mb-16 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-white mb-4 shadow-lg">
                        <Rocket className="w-10 h-10" />
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tight">
                        <span className="bg-gradient-to-r from-[var(--accent)] via-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                            FRC Kickoff Guide
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
                        Your comprehensive resource for dominating the FIRST Robotics Competition. From strategic design to competition day execution.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center items-center pt-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-medium">2025 Season Ready</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">Updated for Kickoff</span>
                        </div>
                    </div>
                </header>

                {/* Introduction */}
                <section className="mb-16 max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-12 shadow-lg border border-neutral-200 dark:border-neutral-800">
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-blue-500" />
                            Welcome to FRC
                        </h2>
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <p className="text-lg leading-relaxed">
                                The FIRST Robotics Competition is the ultimate high school robotics challenge. In just <strong>6 weeks</strong>, teams design, build, and program a robot to compete in an alliance-based game that changes every year.
                            </p>
                            <p className="text-lg leading-relaxed">
                                Success in FRC requires more than just building a robot—it demands <strong>strategic thinking</strong>, <strong>efficient design</strong>, <strong>data-driven decisions</strong>, and <strong>seamless teamwork</strong>. This guide will walk you through every phase of the season, from kickoff to championships.
                            </p>
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-2xl border-l-4 border-blue-500 mt-6">
                                <p className="font-bold text-xl mb-2 text-blue-900 dark:text-blue-100">Golden Rule #5: Fail Faster!</p>
                                <p className="text-neutral-700 dark:text-neutral-300 mb-0">
                                    The best teams finish their robot by Day 29, leaving precious time for driver practice. Remember: <strong>good drivers are better than good robots</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Guide Sections Grid */}
                <section className="mb-16">
                    <h2 className="text-4xl font-bold text-center mb-12">
                        <span className="bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
                            Explore the Guide
                        </span>
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sections.map((section, index) => {
                            const Icon = section.icon;
                            return (
                                <Link
                                    key={index}
                                    href={section.href}
                                    className="group relative bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-md border border-neutral-200 dark:border-neutral-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>

                                    <div
                                        className="inline-flex p-3 rounded-xl mb-4"
                                        style={{
                                            background: "linear-gradient(135deg, var(--accent), var(--primary))",
                                            border: "1px solid var(--sidebar-border)"
                                        }}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    <h3 className="text-xl font-bold mb-3 flex items-center justify-between">
                                        {section.title}
                                        <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                    </h3>

                                    <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                                        {section.description}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Resources Section */}
                <section className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-800 dark:to-neutral-900 rounded-3xl p-8 md:p-12 shadow-2xl text-white">
                        <h2 className="text-3xl font-bold mb-6">Essential Resources</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <a
                                href="https://gm0.org/en/latest/docs/start-here.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                            >
                                <div className="font-bold mb-1">Game Manual 0</div>
                                <div className="text-sm text-neutral-300">Comprehensive FRC knowledge base</div>
                            </a>
                            <a
                                href="https://www.projectb.net.au/resources/robot-mechanisms/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                            >
                                <div className="font-bold mb-1">FRC Mechanism Library</div>
                                <div className="text-sm text-neutral-300">Visual reference for robot mechanisms</div>
                            </a>
                            <a
                                href="https://www.youtube.com/watch?v=Y9B0Khob0Xk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                            >
                                <div className="font-bold mb-1">Karthik's Lecture</div>
                                <div className="text-sm text-neutral-300">Legendary FRC strategy talk</div>
                            </a>
                            <a
                                href="https://www.youtube.com/watch?v=j-wOaF65cTU"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                            >
                                <div className="font-bold mb-1">Strategic Design Workshop</div>
                                <div className="text-sm text-neutral-300">Mike's fall workshop on design</div>
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
