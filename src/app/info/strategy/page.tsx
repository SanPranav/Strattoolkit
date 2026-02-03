import { BookOpen, Trophy, Cpu, Database, Shield, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function StrategyGuidePage() {
    return (
        <>
                    {/* Header */}
                    <section className="border-b border-border">
                        <div className="container mx-auto px-8 py-16 max-w-4xl">
                            <div className="mb-4">
                                <span className="text-sm font-medium text-muted-foreground">Guides</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                                FRC Strategy & Design
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                                The comprehensive guide to mastering the First Robotics Competition, from competition structure to advanced strategic design.
                            </p>
                        </div>
                    </section>

                    <div className="container mx-auto px-8 py-12 max-w-4xl space-y-12">

                        {/* Competition Structure */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Trophy className="w-6 h-6 text-primary" />
                                <h2 className="text-3xl font-bold">Competition Structure</h2>
                            </div>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p>
                                    The FRC season is a rigorous journey divided into distinct phases: <strong>Offseason</strong> (May-Dec) for training, <strong>Build Season</strong> (Jan-Feb), and <strong>Competition Season</strong> (Mar-Apr) culminating in Regionals and Champs.
                                </p>
                                <div className="grid md:grid-cols-2 gap-6 my-6 not-prose">
                                    <Card>
                                        <CardContent className="p-6">
                                            <h3 className="text-lg font-semibold mb-2 text-primary">Review Qualifications (Quals)</h3>
                                            <p className="text-muted-foreground mb-4">Teams are randomly paired. The goal is to seed first by earning <strong>Ranking Points (RPs)</strong>.</p>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>Win: 2 RP</li>
                                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>Tie: 1 RP</li>
                                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Bonus: +2 RP possible</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-6">
                                            <h3 className="text-lg font-semibold mb-2 text-primary">Playoffs (Elims)</h3>
                                            <p className="text-muted-foreground mb-4">Double elimination bracket. Alliances are formed via a serpentine draft by the top 8 seeds.</p>
                                            <div className="text-sm font-medium text-muted-foreground">Prioritizes purely winning matches over bonus objectives.</div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </section>

                        {/* Strategic Design */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Cpu className="w-6 h-6 text-primary" />
                                <h2 className="text-3xl font-bold">Strategic Design</h2>
                            </div>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p>
                                    Effective robot design starts with strategy. The golden rules of FRC engineering are:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>KISS (Keep It Simple, Silly):</strong> Simple equals robust. Function over form.</li>
                                    <li><strong>Steal from the best, invent the rest:</strong> Analyze top teams and game history.</li>
                                    <li><strong>Fail Faster:</strong> Iterate constantly. A robot "finished" on Day 29 allows for critical driver practice.</li>
                                </ul>

                                <h3 className="text-xl font-bold mt-8 mb-4">Mechanisms & Drivetrains</h3>
                                <div className="grid md:grid-cols-3 gap-4 not-prose mb-8">
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="font-semibold mb-1">Tank / West Coast</div>
                                            <div className="text-sm text-muted-foreground">Great pushing power and traction. Simple to build and code.</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="font-semibold mb-1">Mecanum</div>
                                            <div className="text-sm text-muted-foreground">Omnidirectional movement but low traction. Vulnerable to defense.</div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="font-semibold mb-1">Swerve</div>
                                            <div className="text-sm text-muted-foreground">Top tier maneuverability and traction. Complex code and high cost.</div>
                                        </CardContent>
                                    </Card>
                                </div>
                                <p>
                                    <strong>Game Object Processing</strong> typically follows the cycle: Acquisition &rarr; Manipulation &rarr; Storage &rarr; Elevation &rarr; Positioning &rarr; Release.
                                </p>
                                <div className="bg-card border border-border p-4 rounded-lg font-medium mt-4">
                                    💡 Pro Tip: Optimize your "Acquisition Zone" with rolly-grabbers and continuous intakes. "Touch it, own it!"
                                </div>
                            </div>
                        </section>

                        {/* Data & Calculations */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Database className="w-6 h-6 text-primary" />
                                <h2 className="text-3xl font-bold">Data & Analytics</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8 prose prose-lg dark:prose-invert max-w-none">
                                <div>
                                    <h3 className="mt-0">Scouting Types</h3>
                                    <ul className="space-y-1">
                                        <li><strong>Objective:</strong> Quantitative data (Points scored, missed shots).</li>
                                        <li><strong>Subjective:</strong> Qualitative data (Driver awareness, speed, defense).</li>
                                        <li><strong>Pit:</strong> Technical specs (Motor types, drivetrain, weight).</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="mt-0">Key Metrics</h3>
                                    <ul className="space-y-1">
                                        <li><strong>EPA:</strong> Expected Points Added (Predicted contribution).</li>
                                        <li><strong>OPR:</strong> Offensive Power Rating.</li>
                                        <li><strong>DPR:</strong> Defensive Power Rating.</li>
                                        <li><strong>CCWM:</strong> Calculated Contribution to Win Margin.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Defense */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <Shield className="w-6 h-6 text-primary" />
                                    <h2 className="text-2xl font-bold">Defense</h2>
                                </div>
                                <div className="prose prose-neutral dark:prose-invert">
                                    <p>
                                        Defense is a critical match strategy, often used by "lower tier" robots to disrupt powerful alliances.
                                    </p>
                                    <strong className="block mb-2">Effective Tactics:</strong>
                                    <ul className="grid grid-cols-1 gap-2">
                                        <li className="bg-card border border-border p-2 rounded-md">🚧 Cutting off field choke points</li>
                                        <li className="bg-card border border-border p-2 rounded-md">⏱️ Slowing opponent cycles</li>
                                        <li className="bg-card border border-border p-2 rounded-md">🛡️ Blocking shots or bumping</li>
                                        <li className="bg-card border border-border p-2 rounded-md">📦 Hoarding game pieces</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Resources */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <Globe className="w-6 h-6 text-primary" />
                                    <h2 className="text-2xl font-bold">Resources</h2>
                                </div>
                                <div className="space-y-4">
                                    <a href="https://www.chiefdelphi.com" target="_blank" rel="noopener noreferrer" className="block group p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-colors">
                                        <div className="font-semibold text-lg group-hover:text-primary transition-colors">Chief Delphi</div>
                                        <div className="text-sm text-muted-foreground">The premier online forum for FRC discussion and community help.</div>
                                    </a>
                                    <a href="https://www.thebluealliance.com" target="_blank" rel="noopener noreferrer" className="block group p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-colors">
                                        <div className="font-semibold text-lg group-hover:text-primary transition-colors">The Blue Alliance</div>
                                        <div className="text-sm text-muted-foreground">Comprehensive match results, event data, and video archives.</div>
                                    </a>
                                    <a href="https://www.statbotics.io" target="_blank" rel="noopener noreferrer" className="block group p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-colors">
                                        <div className="font-semibold text-lg group-hover:text-primary transition-colors">Statbotics</div>
                                        <div className="text-sm text-muted-foreground">Advanced analytics and EPA predictions for teams and matches.</div>
                                    </a>
                                </div>
                            </section>
                        </div>

                    </div>
        </>
    );
}