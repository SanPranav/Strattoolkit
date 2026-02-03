import { Wrench, Rocket, Users, ExternalLink, Clock, Target } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function BuildSeasonPage() {
    return (
        <>
                    {/* Header */}
                    <section className="border-b border-border">
                        <div className="container mx-auto px-8 py-16 max-w-4xl">
                            <div className="mb-4">
                                <span className="text-sm font-medium text-muted-foreground">Core concepts</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                                Build Season
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                                Navigate the intense 6-week build period from kickoff to bag day. Time management and rapid iteration are everything.
                            </p>
                        </div>
                    </section>

                    <div className="container mx-auto px-8 py-12 max-w-4xl space-y-12">
                        {/* Overview */}
                        <section>
                            <h2 className="text-3xl font-bold mb-6">Build Season Overview</h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p className="text-lg">
                                    Build season is approximately <strong>6 weeks</strong> of intense design, prototyping, building, and testing. It starts at Kickoff (early January) and ends when you ship your robot to your first competition.
                                </p>
                                <div className="bg-card border border-border p-6 rounded-lg my-6">
                                    <p className="text-xl font-bold mb-2">⏱️ The Golden Timeline</p>
                                    <p className="mb-0 text-muted-foreground">
                                        <strong>Day 29:</strong> Robot should be "finished" (fully functional, all mechanisms working). This leaves ~2 weeks for driver practice, refinement, and preparing for competition. Remember: <strong>good drivers beat good robots</strong>.
                                    </p>
                                </div>
                                <div className="bg-card border border-border p-5 rounded-lg">
                                    <p className="font-semibold mb-1">💪 Embrace Setbacks</p>
                                    <p className="text-muted-foreground mb-0">
                                        You'll <strong>always</strong> encounter delays and setbacks—that's normal and expected. Plan for them, work through them, ask for help, and communicate constantly with your team.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Kickoff Weekend */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Rocket className="w-6 h-6 text-primary" />
                                <h2 className="text-3xl font-bold">Kickoff Weekend</h2>
                            </div>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p>
                                    Kickoff is a weekend dedicated to <strong>brainstorming</strong>, <strong>game analysis</strong>, and <strong>strategic planning</strong>. This is where you set the direction for the entire season.
                                </p>

                                <h3 className="text-2xl font-bold mt-8 mb-4">The "Whats" — Game Analysis</h3>
                                <p>Before you design anything, understand the game inside and out:</p>
                                <ul className="space-y-2">
                                    <li><strong>What are the ways to score?</strong> List every scoring opportunity (low goal, high goal, autonomous bonus, etc.)</li>
                                    <li><strong>What is each task worth?</strong> Calculate points per task and Ranking Points (RPs) for bonus objectives</li>
                                    <li><strong>Difficulty of each task?</strong> Assess both in-game difficulty (cycle time, defense vulnerability) and build difficulty (time, complexity, reliability)</li>
                                </ul>
                                <div className="bg-card border border-border p-4 rounded-lg my-6">
                                    <p className="font-semibold mb-1">🎯 Strategic Focus</p>
                                    <p className="text-muted-foreground mb-0">
                                        Just because another team is doing something doesn't mean you should. <strong>Specialization is often necessary.</strong> Pick 2-3 high-value tasks and execute them flawlessly rather than attempting everything poorly.
                                    </p>
                                </div>

                                <h3 className="text-2xl font-bold mt-8 mb-4">The "Hows" — Design Strategy</h3>
                                <p>For each task you choose to pursue, answer these questions:</p>
                                <ul className="space-y-2">
                                    <li><strong>How will the robot carry out this function?</strong> Sketch mechanism concepts</li>
                                    <li><strong>Do we have experience with this design?</strong> Leverage past knowledge or research proven solutions</li>
                                    <li><strong>Passive vs. Active?</strong> Passive mechanisms (gravity-fed, spring-loaded) are simpler than active (motor-driven)</li>
                                    <li><strong>Game piece processing:</strong> Map out Acquisition → Manipulation → Storage → Elevation → Positioning → Release</li>
                                </ul>

                                <h3 className="text-2xl font-bold mt-8 mb-4">Key Kickoff Decisions</h3>
                                <div className="grid md:grid-cols-3 gap-4 not-prose my-6">
                                    <Card>
                                        <CardContent className="p-5">
                                            <h4 className="font-semibold text-lg mb-2">Drivetrain</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Tank, Mecanum, or Swerve? Must be decided by <strong>Day 3</strong> to stay on schedule.
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <h4 className="font-semibold text-lg mb-2">Strategic Capabilities</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Which 2-3 tasks will you specialize in? Low goal? High goal? Defense?
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <h4 className="font-semibold text-lg mb-2">Prototyping Groups</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Divide into teams to prototype different mechanisms in parallel.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <h3 className="text-2xl font-bold mt-8 mb-4">Hand Drawings & Prototyping</h3>
                                <p>
                                    Create <strong>hand drawings</strong> of potential designs showing basic mechanism ideas <strong>with correct scale</strong>. These don't need to be CAD—simple sketches help communicate ideas quickly.
                                </p>
                                <p>
                                    Start prototyping immediately. Build quick-and-dirty versions of mechanisms to test feasibility. Use cardboard, wood, or spare parts—speed matters more than polish at this stage.
                                </p>
                            </div>
                        </section>

                        {/* Rules Test */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Target className="w-6 h-6 text-primary" />
                                <h2 className="text-3xl font-bold">Know the Game Manual</h2>
                            </div>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p>
                                    Every team member should take the <strong>Rules Test</strong> and thoroughly understand the game manual. Knowing the rules prevents costly mistakes and reveals strategic opportunities.
                                </p>
                                <ul className="space-y-2">
                                    <li>Understand robot size constraints (starting configuration, expansion limits)</li>
                                    <li>Know weight limits and what counts toward them</li>
                                    <li>Learn penalty conditions (what actions result in fouls or tech fouls)</li>
                                    <li>Identify bonus objectives for Ranking Points</li>
                                    <li>Understand autonomous period rules and bonuses</li>
                                </ul>
                                <div className="bg-card border border-border p-4 rounded-lg mt-4">
                                    <p className="font-semibold mb-1">📖 Pro Tip</p>
                                    <p className="text-muted-foreground mb-0">
                                        Read the Q&A forum on the FIRST website. Teams ask clarifying questions about rules, and official answers can reveal strategic insights or prevent design mistakes.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Build Timeline */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Clock className="w-6 h-6 text-primary" />
                                <h2 className="text-3xl font-bold">Critical Build Timeline</h2>
                            </div>
                            <div className="space-y-6">
                                {[
                                    {
                                        day: "Day 0-3",
                                        title: "Kickoff & Drivetrain Decision",
                                        description: "Game analysis, strategic planning, and drivetrain selection. Start prototyping immediately.",
                                    },
                                    {
                                        day: "Day 3-14",
                                        title: "Prototyping Phase",
                                        description: "Build and test rough prototypes of all major mechanisms. Fail fast, iterate rapidly. Finalize mechanism designs by Day 14.",
                                    },
                                    {
                                        day: "Day 14-22",
                                        title: "CAD & Fabrication",
                                        description: "Finalize CAD models and begin fabricating final parts. Order any remaining components. Start assembling drivetrain.",
                                    },
                                    {
                                        day: "Day 22-28",
                                        title: "Mechanism Integration",
                                        description: "Assemble all mechanisms onto the robot. Wire electronics, install pneumatics, write initial code.",
                                    },
                                    {
                                        day: "Day 29-42",
                                        title: "Testing & Driver Practice",
                                        description: "Robot is 'finished'—now refine, debug, and practice. This is the most critical period for success.",
                                    }
                                ].map((phase, index) => (
                                    <Card key={index}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="px-3 py-1 rounded-full text-white text-sm font-semibold bg-primary">
                                                    {phase.day}
                                                </div>
                                                <h3 className="text-xl font-semibold">{phase.title}</h3>
                                            </div>
                                            <p className="text-muted-foreground">{phase.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="bg-card border border-border p-6 rounded-lg mt-8">
                                <p className="text-xl font-bold mb-2">⚠️ Critical Deadline: Day 29</p>
                                <p className="mb-0 text-muted-foreground">
                                    If you're still building major mechanisms after Day 29, you're behind. Prioritize getting a functional robot early over adding extra features late.
                                </p>
                            </div>
                        </section>

                        {/* Communication & Documentation */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Users className="w-6 h-6 text-primary" />
                                <h2 className="text-3xl font-bold">Communication & Documentation</h2>
                            </div>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p>
                                    Build season is chaotic. Effective communication prevents duplicate work, missed deadlines, and confusion.
                                </p>
                                <ul className="space-y-2">
                                    <li><strong>Update your Project Management Board</strong> (Trello, Notion, GitHub Projects) daily</li>
                                    <li><strong>Document progress on Discord/Slack</strong>—share photos, videos, and status updates</li>
                                    <li><strong>Hold daily standups</strong>—quick 5-10 minute meetings to sync on progress and blockers</li>
                                    <li><strong>Ask for help early</strong>—don't wait until you're stuck for days</li>
                                    <li><strong>Take photos and videos</strong> of your build process for the Chairman's Award and future reference</li>
                                </ul>
                                <div className="bg-card border border-border p-4 rounded-lg mt-4">
                                    <p className="font-semibold mb-1">🤝 Team Culture</p>
                                    <p className="text-muted-foreground mb-0">
                                        Build season is stressful. Support each other, celebrate small wins, and maintain a positive team culture. Burnout helps no one.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Fail Faster */}
                        <section>
                            <h2 className="text-3xl font-bold mb-6">Golden Rule #5: Fail Faster!</h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p className="text-lg">
                                    The faster you test, break, fix, and iterate, the better your robot will be. Don't be afraid of failure—embrace it as part of the process.
                                </p>
                                <div className="grid md:grid-cols-2 gap-6 my-6 not-prose">
                                    <Card>
                                        <CardContent className="p-5">
                                            <h3 className="text-xl font-semibold mb-3">Test Constantly</h3>
                                            <p className="text-muted-foreground">
                                                Run your mechanisms with actual game pieces in realistic scenarios. Find problems early when they're easier to fix.
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <h3 className="text-xl font-semibold mb-3">Break Things</h3>
                                            <p className="text-muted-foreground">
                                                Intentionally stress-test your robot. If it's going to break, better in the shop than during a match.
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <h3 className="text-xl font-semibold mb-3">Driver Practice ASAP</h3>
                                            <p className="text-muted-foreground">
                                                Get the robot drivable as soon as possible. Even basic driver practice is invaluable.
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <h3 className="text-xl font-semibold mb-3">Good Drivers &gt; Good Robots</h3>
                                            <p className="text-muted-foreground">
                                                A skilled driver can compensate for robot limitations. An unskilled driver wastes a perfect robot.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </section>

                        {/* Next Steps */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Continue Learning</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Link
                                    href="/info/kickoff-guide/competition-season"
                                    className="group block p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-lg group-hover:text-primary transition-colors">Competition Season →</span>
                                        <ExternalLink className="w-5 h-5 opacity-50" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Prepare for quals, playoffs, and alliance selection at competitions.
                                    </p>
                                </Link>
                                <Link
                                    href="/info/kickoff-guide/scouting-data"
                                    className="group block p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-lg group-hover:text-primary transition-colors">Scouting & Data →</span>
                                        <ExternalLink className="w-5 h-5 opacity-50" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Learn how to collect and analyze data for strategic decisions.
                                    </p>
                                </Link>
                            </div>
                        </section>
                    </div>
        </>
    );
}
