import Link from "next/link";
import { BookOpen, Rocket, ClipboardList, Calendar, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function InfoIndexPage() {
  const cards = [
    { title: "Kickoff Guide", href: "/info/kickoff-guide", desc: "All kickoff topics: strategy, build season, scouting, and more.", icon: Rocket },
    { title: "Strategy Overview", href: "/info/strategy", desc: "Quick reference for competition structure and drafting strategies.", icon: BookOpen },
    { title: "Scouting & Data", href: "/info/kickoff-guide/scouting-data", desc: "How to collect and use data to improve match outcomes.", icon: ClipboardList },
    { title: "Build Season", href: "/info/kickoff-guide/build-season", desc: "Guides and timelines for an effective build season.", icon: Calendar },
    { title: "Privacy & Policies", href: "/info/privacy", desc: "Information about data use and privacy policies.", icon: ShieldCheck }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-background to-card/20">
        <div className="w-full px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 max-w-4xl mx-auto">
          <div className="text-center space-y-4 sm:space-y-5 md:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Never miss the <span className="text-primary">info</span> again.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-1">
              Comprehensive guides and resources for FRC teams. Everything you need to know about strategy, build season, scouting, and competition.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center pt-2 sm:pt-4">
              <Button asChild size="lg" className="text-sm sm:text-base h-10 sm:h-11 md:h-12">
                <Link href="/info/kickoff-guide">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 shrink-0" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-sm sm:text-base h-10 sm:h-11 md:h-12">
                <Link href="/info/strategy">View Strategy Guide</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-16 max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Getting Started</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Explore our comprehensive guides and resources</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <Link key={i} href={c.href} className="block min-w-0">
                <Card className="h-full hover:border-primary/50 transition-colors group">
                  <CardContent className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg bg-primary/10 text-primary shrink-0">
                        <Icon className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-primary transition-colors break-words">
                          {c.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                          {c.desc}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
