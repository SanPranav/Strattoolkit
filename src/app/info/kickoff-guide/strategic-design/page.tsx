import { Lightbulb, Target, Zap, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function StrategicDesignPage() {
    return (
        <>
                    {/* Header */}
                    <section className="border-b border-border">
                        <div className="container mx-auto px-8 py-16 max-w-4xl">
                            <div className="mb-4">
                                <span className="text-sm font-medium text-muted-foreground">Core concepts</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                                Strategic Design
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                                Master the art of analyzing games, identifying optimal strategies, and building robots that execute flawlessly in alliance-based competition.
                            </p>
                        </div>
                    </section>

                    <div className="container mx-auto px-8 py-12 max-w-4xl space-y-12">

                        {/* Why Strategic Design */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Target className="w-6 h-6 text-primary" />
                                <h2 className="text-3xl font-bold">Why Strategic Design?</h2>
                            </div>
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p className="text-lg leading-relaxed">
                                    Strategic design is the foundation of every successful FRC team. It's not just about building a robot—it's about building the <strong>right</strong> robot for the game at hand.
                                </p>
                                <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                                    <Card>
                                        <CardContent className="p-6">
                                            <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
                                            <h3 className="text-lg font-semibold mb-2">Analyze the Game</h3>
                                            <p className="text-muted-foreground">
                                                Break down scoring opportunities, bonus objectives, and defensive possibilities. Understand what wins matches.
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-6">
                                            <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
                                            <h3 className="text-lg font-semibold mb-2">Identify Optimal Strategies</h3>
                                            <p className="text-muted-foreground">
                                                Determine which tasks provide the best return on investment for your team's resources and capabilities.
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-6">
                                            <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
                                            <h3 className="text-lg font-semibold mb-2">Build for Execution</h3>
                                            <p className="text-muted-foreground">
                                                Design mechanisms that reliably perform your chosen strategy under match conditions and defensive pressure.
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-6">
                                            <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
                                            <h3 className="text-lg font-semibold mb-2">Optimize Resources</h3>
                                            <p className="text-muted-foreground">
                                                Maximize your limited time, budget, and expertise. Focus on what matters most for alliance success.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="bg-card border border-border p-6 rounded-lg">
                                    <p className="text-lg font-semibold mb-2">🎯 Core Principle</p>
                                    <p className="mb-0">
                                        FRC is an <strong>alliance-based game</strong>. Your robot doesn't need to do everything—it needs to complement your alliance partners and fill critical gaps in capability.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Golden Rules */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Zap className="w-6 h-6 text-primary" />
                                <h2 className="text-3xl font-bold">The Golden Rules</h2>
                            </div>

                    {/* Rule #1: KISS */}
                    <div className="mb-10">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black text-xl">
                                1
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Keep It Simple, Silly (KISS)</h3>
                                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                    Simple = Robust. Function over Form.
                                </p>
                            </div>
                        </div>
                        <div className="pl-16 prose prose-lg dark:prose-invert max-w-none">
                            <p>
                                Complexity is the enemy of reliability. In the heat of competition, simple mechanisms work when complex ones fail.
                            </p>
                            <ul className="space-y-2">
                                <li><strong>Fewer moving parts</strong> = fewer points of failure</li>
                                <li><strong>Simpler code</strong> = easier debugging and faster iteration</li>
                                <li><strong>Straightforward designs</strong> = quicker repairs in the pits</li>
                                <li><strong>Function over form</strong> = prioritize what works over what looks cool</li>
                            </ul>
                            <div className="bg-card border border-border p-4 rounded-lg mt-4">
                                <p className="font-semibold mb-1">⚠️ Warning</p>
                                <p className="text-muted-foreground mb-0">
                                    Don't over-engineer. A robot that scores 80% as many points but works 100% of the time beats a robot that scores 100% but only works 50% of the time.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rule #2: Steal from the Best */}
                    <div className="mb-10">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-black text-xl">
                                2
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">"Steal from the Best, Invent the Rest!"</h3>
                                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                    Learn from history. Others have solved similar problems before.
                                </p>
                            </div>
                        </div>
                        <div className="pl-16 prose prose-lg dark:prose-invert max-w-none">
                            <p>
                                You don't need to reinvent the wheel. Study what top teams have done in similar games and adapt their proven solutions.
                            </p>
                            <ul className="space-y-2">
                                <li><strong>Watch reveal videos</strong> from championship-winning teams</li>
                                <li><strong>Study game history</strong>—similar game elements appear across years</li>
                                <li><strong>Analyze top performers</strong> at other regionals via The Blue Alliance</li>
                                <li><strong>Browse the FRC Mechanism Library</strong> for proven designs</li>
                                <li><strong>Read Chief Delphi</strong> for technical discussions and CAD models</li>
                            </ul>
                            <div className="bg-card border border-border p-4 rounded-lg mt-4">
                                <p className="font-semibold mb-1">💡 Pro Tip</p>
                                <p className="text-muted-foreground mb-0">
                                    "Including us :)" — Your own team's past robots are valuable references. Document your designs so future team members can learn from them.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rule #4: Acquisition Zone */}
                    <div className="mb-10">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-black text-xl">
                                4
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Maximize Your Acquisition Zone</h3>
                                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                    "Touch it, own it!" — Make the driver's job easy.
                                </p>
                            </div>
                        </div>
                        <div className="pl-16 prose prose-lg dark:prose-invert max-w-none">
                            <p>
                                A large, forgiving intake area dramatically improves cycle times and reduces driver stress. The easier it is to pick up game pieces, the more you'll score.
                            </p>

                            <div className="grid md:grid-cols-2 gap-4 my-6 not-prose">
                                <div className="p-5 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        <h4 className="font-bold text-lg">Continuous Intake</h4>
                                    </div>
                                    <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
                                        <li>✓ Large acquisition zone</li>
                                        <li>✓ Works from multiple angles</li>
                                        <li>✓ Rollers pull pieces in automatically</li>
                                        <li>✓ Driver can focus on positioning</li>
                                    </ul>
                                </div>
                                <div className="p-5 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        <h4 className="font-bold text-lg">Single-Point Intake</h4>
                                    </div>
                                    <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
                                        <li>✗ Small acquisition zone (claw, hook, scoop)</li>
                                        <li>✗ Requires precise alignment</li>
                                        <li>✗ Slower cycle times</li>
                                        <li>✗ Driver must be very accurate</li>
                                    </ul>
                                </div>
                            </div>

                            <p>
                                <strong>Rolly-Grabbers</strong> (roller-based intakes) are a classic example. They create a wide "capture zone" where any game piece that touches the rollers gets pulled in automatically.
                            </p>

                            <div className="bg-card border border-border p-4 rounded-lg mt-4">
                                <p className="font-semibold mb-1">🔧 Design Principle</p>
                                <p className="text-muted-foreground mb-0">
                                    Always prototype your intake! Test with actual game pieces to ensure your acquisition zone is large enough and your intake works from various approach angles.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rule #5: Fail Faster */}
                    <div>
                        <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white font-black text-xl">
                                5
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Fail Faster!</h3>
                                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                    Good drivers are better than good robots.
                                </p>
                            </div>
                        </div>
                        <div className="pl-16 prose prose-lg dark:prose-invert max-w-none">
                            <p>
                                The build season is short. The faster you test, break, fix, and iterate, the better your final robot will be.
                            </p>
                            <ul className="space-y-2">
                                <li><strong>Prototype early and often</strong>—don't wait for perfection</li>
                                <li><strong>Test with real game pieces</strong> in realistic scenarios</li>
                                <li><strong>Break things intentionally</strong> to find weak points</li>
                                <li><strong>Document failures</strong> so you don't repeat them</li>
                                <li><strong>Aim to be "finished" by Day 29</strong> to maximize driver practice</li>
                            </ul>
                            <div className="bg-card border border-border p-6 rounded-lg mt-6">
                                <p className="text-xl font-bold mb-2">🏆 Championship Mindset</p>
                                <p className="mb-0 text-muted-foreground">
                                    A mediocre robot with 100 hours of driver practice will outperform an excellent robot with 10 hours of practice. Finish early, practice relentlessly.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                        {/* Competitive Benefits */}
                        <section>
                            <h2 className="text-3xl font-bold mb-6">Competitive Benefits of Strategic Design</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="text-4xl mb-3">🎯</div>
                                        <h3 className="text-xl font-semibold mb-2">Higher Win Rate</h3>
                                        <p className="text-muted-foreground">
                                            Robots designed with strategy in mind win more matches because they focus on high-value tasks.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="text-4xl mb-3">🤝</div>
                                        <h3 className="text-xl font-semibold mb-2">Better Alliance Partner</h3>
                                        <p className="text-muted-foreground">
                                            Teams want to pick robots that complement their strengths and fill gaps in their strategy.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="text-4xl mb-3">⚡</div>
                                        <h3 className="text-xl font-semibold mb-2">Efficient Resource Use</h3>
                                        <p className="text-muted-foreground">
                                            Strategic design prevents wasted time on low-impact features, letting you perfect what matters.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        {/* Next Steps */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Continue Learning</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Link
                                    href="/info/kickoff-guide/mechanism-design"
                                    className="group block p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-lg group-hover:text-primary transition-colors">Mechanism Design →</span>
                                        <ExternalLink className="w-5 h-5 opacity-50" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Learn about drivetrains, intakes, and game piece processing.
                                    </p>
                                </Link>
                                <Link
                                    href="/info/kickoff-guide/build-season"
                                    className="group block p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-lg group-hover:text-primary transition-colors">Build Season →</span>
                                        <ExternalLink className="w-5 h-5 opacity-50" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Navigate kickoff, prototyping, and the 6-week build timeline.
                                    </p>
                                </Link>
                            </div>
                        </section>
                    </div>
        </>
    );
}
