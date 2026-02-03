import { Trophy, Shield, Eye, TrendingUp, ExternalLink, Target, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function CompetitionSeasonPage() {
    return (
        <>
                    {/* Header */}
                    <section className="border-b border-border">
                        <div className="container mx-auto px-8 py-16 max-w-4xl">
                            <div className="mb-4">
                                <span className="text-sm font-medium text-muted-foreground">Core concepts</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                                Competition Season
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                                Execute your strategy on the field. Master quals, playoffs, alliance selection, and continuous improvement between events.
                            </p>
                        </div>
                    </section>

                    <div className="container mx-auto px-8 py-12 max-w-4xl space-y-12">

                        {/* Overview */}
                        <section>
                            <h2 className="text-3xl font-bold mb-6">Competition Season Overview</h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p className="text-lg">
                                    Competition season runs from <strong>March through April</strong>, culminating in the FIRST Championship. Most teams attend 1-2 Regional competitions or District events.
                                </p>
                                <div className="bg-card border border-border p-6 rounded-lg my-6">
                                    <p className="text-xl font-bold mb-2">🏆 The Goal</p>
                                    <p className="mb-0 text-muted-foreground">
                                        Win matches, earn Ranking Points, seed high for playoffs, form a strong alliance, and advance to Championships. But remember: <strong>your robot will keep evolving</strong> throughout the season.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Watch Other Competitions */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Eye className="w-6 h-6 text-primary" />
                                <h2 className="text-3xl font-bold">Watch Other Competitions</h2>
                            </div>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p>
                                    Before your first event, watch other regionals to see how the game is actually played. Theory meets reality on the competition field.
                                </p>
                                <div className="grid md:grid-cols-3 gap-4 my-6 not-prose">
                                    <Card>
                                        <CardContent className="p-5">
                                            <h3 className="font-semibold text-lg mb-2">Twitch Streams</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Watch live matches on FIRST's official Twitch channels. See strategies in real-time.
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <h3 className="font-semibold text-lg mb-2">The Blue Alliance</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Access match videos, scores, and statistics from every event worldwide.
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <h3 className="font-semibold text-lg mb-2">Chief Delphi</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Read event threads for insights, robot reveals, and strategy discussions.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <ul className="space-y-2">
                                    <li><strong>FUN (FIRST Updates Now):</strong> Weekly show covering FRC news and highlights</li>
                                    <li><strong>Gamesense:</strong> Strategic analysis and commentary on the current game</li>
                                    <li><strong>Behind the Bumpers:</strong> YouTube series featuring top team interviews</li>
                                </ul>
                                <div className="bg-card border border-border p-4 rounded-lg mt-4">
                                    <p className="font-semibold mb-1">🔍 What to Look For</p>
                                    <p className="text-muted-foreground mb-0">
                                        Pay attention to: effective defensive strategies, common robot failures, successful autonomous routines, and which mechanisms are dominating. <strong>"Steal from the best!"</strong>
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* During Competition */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Target className="w-6 h-6 text-primary" />
                                <h2 className="text-3xl font-bold">During Competition: Continuous Improvement</h2>
                            </div>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p>
                                    Your robot will <strong>still change</strong> in-between regionals and even <strong>during</strong> regionals. Expect to make repairs, adjustments, and improvements on the fly.
                                </p>

                                <h3 className="text-2xl font-bold mt-8 mb-4">Review and Reflect</h3>
                                <p>After each match (and each day), ask:</p>
                                <div className="grid md:grid-cols-3 gap-4 my-6 not-prose">
                                    <Card>
                                        <CardContent className="p-5">
                                            <h4 className="font-semibold mb-2">Durability</h4>
                                            <ul className="text-sm space-y-1 text-muted-foreground">
                                                <li>• What broke or wore out?</li>
                                                <li>• Which mechanisms are fragile?</li>
                                                <li>• Can we reinforce weak points?</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <h4 className="font-semibold mb-2">Functionality</h4>
                                            <ul className="text-sm space-y-1 text-muted-foreground">
                                                <li>• What worked well?</li>
                                                <li>• What underperformed?</li>
                                                <li>• Can we simplify or improve?</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <h4 className="font-semibold mb-2">Alliance Cohesion</h4>
                                            <ul className="text-sm space-y-1 text-muted-foreground">
                                                <li>• How did we complement partners?</li>
                                                <li>• What roles did we fill?</li>
                                                <li>• What gaps remain?</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>

                                <h3 className="text-2xl font-bold mt-8 mb-4">Changing Level of Play</h3>
                                <p>
                                    Keep in mind the <strong>changing level of play</strong> at different events. Week 1 regionals are less competitive than Week 6. Championship-level play is significantly more intense.
                                </p>
                                <ul className="space-y-2">
                                    <li><strong>Early events:</strong> More experimental robots, less refined strategies, more opportunities for upsets</li>
                                    <li><strong>Late events:</strong> Robots are battle-tested, strategies are optimized, competition is fierce</li>
                                    <li><strong>Championships:</strong> Only the best teams, highest level of play, defense is critical</li>
                                </ul>
                                <div className="bg-card border border-border p-4 rounded-lg mt-4">
                                    <p className="font-semibold mb-1">📈 Adapt Your Strategy</p>
                                    <p className="text-muted-foreground mb-0">
                                        What works at Week 1 might not work at Championships. Be prepared to adjust your strategy, practice new skills, and even modify your robot between events.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Defense */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="w-6 h-6 text-primary" />
                                <h2 className="text-3xl font-bold">Defense: The Great Equalizer</h2>
                            </div>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p>
                                    Defense is a critical strategy where a team <strong>protects or stops opponents</strong> from scoring. It's often used by "lower-tier" robots to help stronger teammates and disorganize opposing alliances.
                                </p>

                                <h3 className="text-2xl font-bold mt-8 mb-4">Types of Defense</h3>
                                <div className="grid md:grid-cols-2 gap-6 my-6 not-prose">
                                    <Card>
                                        <CardContent className="p-5">
                                            <h4 className="font-semibold text-lg mb-3">🚧 Cutting Off Field Areas</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Block choke points, narrow passages, or high-traffic zones to slow opponent cycles and force them to take longer routes.
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <h4 className="font-semibold text-lg mb-3">⏱️ Slowing Cycles</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Follow opponents and impede their movement. Even a few extra seconds per cycle adds up over a 2.5-minute match.
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <h4 className="font-semibold text-lg mb-3">🛡️ Blocking Shots / Bumping</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Position yourself between shooters and goals. Gentle bumps (within rules) can disrupt aiming and timing.
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <h4 className="font-semibold text-lg mb-3">📦 Hoarding Game Pieces</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Collect game pieces and hold them (or move them away from opponents) to deny scoring opportunities.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <h3 className="text-2xl font-bold mt-8 mb-4">Historical Examples</h3>
                                <ul className="space-y-2">
                                    <li><strong>2022 Rapid React:</strong> Blocking opponents from reaching cargo, defending the terminal</li>
                                    <li><strong>2018 Power UP:</strong> Preventing opponents from reaching the scale or switch</li>
                                    <li><strong>2023 Charged Up:</strong> Blocking access to the charging station during end-game</li>
                                </ul>

                                <div className="bg-card border border-border p-4 rounded-lg mt-6">
                                    <p className="font-semibold mb-1">⚠️ Play Clean</p>
                                    <p className="text-muted-foreground mb-0">
                                        Defense is legal and strategic, but <strong>know the rules</strong>. Avoid penalties for pinning (holding an opponent in place too long), ramming, or damaging other robots. Good defense is persistent but fair.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Alliance Selection */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Users className="w-6 h-6 text-primary" />
                                <h2 className="text-3xl font-bold">Alliance Selection Strategy</h2>
                            </div>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p>
                                    After qualification matches, the top 8 seeds become <strong>alliance captains</strong> and draft their alliance partners in a serpentine format.
                                </p>

                                <h3 className="text-2xl font-bold mt-8 mb-4">The Drafting Process</h3>
                                <ol className="space-y-2">
                                    <li><strong>First Pick:</strong> Alliance captains (seeds 1-8) select their first partner in order (1st seed picks first, 8th seed picks last)</li>
                                    <li><strong>Second Pick:</strong> Order reverses—8th seed picks first, 1st seed picks last (serpentine)</li>
                                    <li><strong>Third Pick (Champs only):</strong> Back to original order for a third alliance member</li>
                                </ol>

                                <h3 className="text-2xl font-bold mt-8 mb-4">Strategic Drafting Techniques</h3>
                                <div className="grid md:grid-cols-2 gap-6 my-6 not-prose">
                                    <Card>
                                        <CardContent className="p-5">
                                            <h4 className="font-semibold text-lg mb-3">Complementary Picks</h4>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Choose robots that fill gaps in your capabilities. If you're a high-goal specialist, pick a low-goal scorer or defender.
                                            </p>
                                            <ul className="text-sm space-y-1 text-muted-foreground">
                                                <li>• <strong>First Pick:</strong> Rare skills, high-level scorer</li>
                                                <li>• <strong>Second Pick:</strong> Simpler tasks, defense</li>
                                                <li>• <strong>Third Pick:</strong> Counter-robot to expected opponents</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <h4 className="font-semibold text-lg mb-3">Advanced Tactics</h4>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                High-level strategic moves to gain an edge:
                                            </p>
                                            <ul className="text-sm space-y-1 text-muted-foreground">
                                                <li>• <strong>Scorching:</strong> Invite a top seed to decline, denying them to other alliances</li>
                                                <li>• <strong>Strongest Opponent:</strong> Pick the best remaining robot to prevent opponents from getting them</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="bg-card border border-border p-4 rounded-lg mt-4">
                                    <p className="font-semibold mb-1">🎯 Locking First</p>
                                    <p className="text-muted-foreground mb-0">
                                        The 1st seed's goal is often to "lock first"—secure the #1 ranking early to make an informed pick decision before other captains. This provides maximum flexibility in alliance selection.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Match Strategy */}
                        <section>
                            <h2 className="text-3xl font-bold mb-6">Match Strategy & Playbook</h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p className="text-lg">
                                    Before each match, create a <strong>playbook</strong>—a simple plan for what each robot will do during autonomous and teleop.
                                </p>
                                <div className="grid md:grid-cols-2 gap-6 my-6 not-prose">
                                    <Card>
                                        <CardContent className="p-5">
                                            <h3 className="text-xl font-semibold mb-3">Autonomous (15 sec)</h3>
                                            <ul className="text-sm space-y-1 text-muted-foreground">
                                                <li>• Who scores in auto?</li>
                                                <li>• Who goes for bonus objectives?</li>
                                                <li>• Avoid collisions—assign lanes</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-5">
                                            <h3 className="text-xl font-semibold mb-3">TeleOp (2:15)</h3>
                                            <ul className="text-sm space-y-1 text-muted-foreground">
                                                <li>• Who plays offense (scoring)?</li>
                                                <li>• Who plays defense?</li>
                                                <li>• Who goes for end-game climb/hang?</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>
                                <p>
                                    Communicate with your alliance partners before the match. A coordinated alliance beats three individual robots every time.
                                </p>
                            </div>
                        </section>

                        {/* Next Steps */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Continue Learning</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Link
                                    href="/info/kickoff-guide/scouting-data"
                                    className="group block p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-lg group-hover:text-primary transition-colors">Scouting & Data →</span>
                                        <ExternalLink className="w-5 h-5 opacity-50" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Learn how to collect data and build picklists for alliance selection.
                                    </p>
                                </Link>
                                <Link
                                    href="/info/strategy"
                                    className="group block p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-lg group-hover:text-primary transition-colors">Strategy Overview →</span>
                                        <ExternalLink className="w-5 h-5 opacity-50" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Quick reference for competition structure and FRC vocabulary.
                                    </p>
                                </Link>
                            </div>
                        </section>
                    </div>
        </>
    );
}
