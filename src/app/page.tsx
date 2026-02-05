"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavbarServerConfig } from "@/components/NavbarServerConfig";
import ServerToaster from "@/components/ServerToaster";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CodeTerminal } from "@/components/CodeTerminal";
import { AnimatedGradient } from "@/components/AnimatedGradient";
import { ScrollIndicator } from "@/components/ScrollIndicator";
import { HorizontalScrollSection } from "@/components/HorizontalScrollSection";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Typewriter } from "@/components/Typewriter";
import { DynamicBackground } from "@/components/DynamicBackground";
import { BarChart3, ClipboardList, Users, Code2, Zap, Shield, Rocket, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <DynamicBackground />
      <SmoothScroll />
      <NavbarServerConfig defaultExpanded={false} />
      <ServerToaster
        message="Welcome to the new Optix Toolkit."
        type="info"
      />

      {/* Chapter 01: Hero */}
      <section
        ref={(el) => { sectionsRef.current.hero = el; }}
        id="hero"
        className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 py-12 md:py-20 relative md:snap-section overflow-hidden"
      >
        {/* Parallax Background Pattern */}
        <ParallaxBackground speed={0.3} className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '60px 60px'
          }}></div>
        </ParallaxBackground>

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <AnimatedGradient className="w-full">
            <div className="space-y-12">
              <ScrollReveal direction="down" delay={0}>
                <div className="mb-6 flex items-center justify-center gap-4">
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-[-0.02em] leading-[0.9]">
                  <span className="bg-gradient-to-r from-primary via-green-500 to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_200%] block">
                    Optix
                  </span>
                  <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%] block mt-2">
                    Toolkit
                  </span>
                </h1>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={300}>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                  <Typewriter 
                    text="Streamlining FRC operations with powerful tools for outreach, scouting, and team management."
                    speed={30}
                    delay={800}
                  />
                </p>
              </ScrollReveal>
            </div>
          </AnimatedGradient>
          
          <ScrollReveal direction="up" delay={500}>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-10 md:mt-14 justify-center">
              <Button asChild size="lg" className="min-w-[160px] sm:min-w-[180px] text-base md:text-lg h-12 md:h-14 shadow-2xl hover:shadow-primary/20 transition-all duration-300">
                <Link href="/outreach">Outreach</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-w-[160px] sm:min-w-[180px] text-base md:text-lg h-12 md:h-14 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
                <Link href="/scouting">Scouting</Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>

        <ScrollIndicator />
      </section>

      {/* Chapter 02: Features - Horizontal Scroll */}
      <section
        ref={(el) => { sectionsRef.current.features = el; }}
        id="features"
        className="min-h-screen w-full flex flex-col justify-center px-4 py-12 md:py-20 relative md:snap-section"
      >
        <div className="container mx-auto max-w-7xl">
          <ScrollReveal direction="up" className="text-center mb-8 md:mb-12">
            <div className="mb-4 flex items-center justify-center gap-4">
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              <Typewriter text="Everything You Need" speed={80} delay={200} />
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              <Typewriter text="Powerful tools designed specifically for FRC teams" speed={40} delay={1200} />
            </p>
          </ScrollReveal>

          {/* Feature cards - dynamic grid, fit side-by-side at all breakpoints */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 w-full min-w-0">
            <Card className="group h-full min-w-0 bg-card/70 backdrop-blur-lg border border-foreground/10 hover:border-primary/40 transition-all duration-700 hover:shadow-2xl p-2 md:p-3">
              <CardHeader className="p-0 mb-1.5 min-w-0">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-md bg-primary/10 flex items-center justify-center mb-1.5 group-hover:bg-primary/15 transition-all duration-500 shrink-0">
                  <ClipboardList className="w-3.5 h-3.5 md:w-4 md:h-4 text-foreground fill-foreground" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold break-words">Outreach</CardTitle>
              </CardHeader>
              <CardContent className="p-0 min-w-0">
                <p className="text-muted-foreground/90 leading-snug text-[11px] md:text-xs break-words">
                  Track hours, manage events, and monitor member participation effortlessly. Keep your team organized and compliant with comprehensive outreach tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="group h-full min-w-0 bg-card/70 backdrop-blur-lg border border-foreground/10 hover:border-primary/40 transition-all duration-700 hover:shadow-2xl p-2 md:p-3">
              <CardHeader className="p-0 mb-1.5 min-w-0">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-md bg-primary/10 flex items-center justify-center mb-1.5 group-hover:bg-primary/15 transition-all duration-500 shrink-0">
                  <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4 text-foreground fill-foreground" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold break-words">Scouting</CardTitle>
              </CardHeader>
              <CardContent className="p-0 min-w-0">
                <p className="text-muted-foreground/90 leading-snug text-[11px] md:text-xs break-words">
                  Real-time data collection and analysis for better match strategy. Make informed decisions with comprehensive scouting data and analytics.
                </p>
              </CardContent>
            </Card>

            <Card className="group h-full min-w-0 bg-card/70 backdrop-blur-lg border border-foreground/10 hover:border-primary/40 transition-all duration-700 hover:shadow-2xl p-2 md:p-3">
              <CardHeader className="p-0 mb-1.5 min-w-0">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-md bg-primary/10 flex items-center justify-center mb-1.5 group-hover:bg-primary/15 transition-all duration-500 shrink-0">
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-foreground fill-foreground" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold break-words">Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0 min-w-0">
                <p className="text-muted-foreground/90 leading-snug text-[11px] md:text-xs break-words">
                  Easy administration tools for team leaders and mentors. Streamline operations and focus on what matters most.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Chapter 03: Capabilities */}
      <section
        ref={(el) => { sectionsRef.current.capabilities = el; }}
        id="capabilities"
        className="min-h-screen w-full flex flex-col justify-center px-4 py-12 md:py-20 relative md:snap-section"
      >
        <div className="container mx-auto max-w-7xl">
          <ScrollReveal direction="up" className="text-center mb-8 md:mb-12">
            <div className="mb-4 flex items-center justify-center gap-4">
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              <Typewriter text="Built for Excellence" speed={80} delay={200} />
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              <Typewriter text="Every detail crafted to help your team succeed" speed={40} delay={1200} />
            </p>
          </ScrollReveal>

          {/* Capabilities - narrower widths for cards */}
          <HorizontalScrollSection className="mb-4 md:mb-8" showControls={false}>
            <div className="flex gap-3 md:gap-4">
              <div className="snap-item min-w-[55vw] sm:min-w-[45vw] md:min-w-[36vw] lg:min-w-[28vw] flex-shrink-0">
                <ScrollReveal direction="up" delay={0}>
                  <div className="mb-3 md:mb-4">
                    <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2 flex items-center gap-2">
                      <Code2 className="w-4 h-4 md:w-5 md:h-5 text-foreground fill-foreground shrink-0" />
                      Developer Experience
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 leading-relaxed">
                      Built with modern technologies for the best developer experience
                    </p>
                  </div>
                  <CodeTerminal />
                </ScrollReveal>
              </div>

              <div className="snap-item min-w-[55vw] sm:min-w-[45vw] md:min-w-[36vw] lg:min-w-[28vw] flex-shrink-0">
                <div className="grid gap-3 md:gap-3 h-full">
                  <ScrollReveal direction="left" delay={0}>
                    <Card className="h-full bg-card/60 backdrop-blur-md border-muted/40 hover:border-primary/50 transition-all duration-300 p-2.5 md:p-3">
                      <CardHeader className="p-0 mb-1 md:mb-1.5">
                        <Rocket className="w-5 h-5 md:w-6 md:h-6 text-foreground fill-foreground mb-1" />
                        <CardTitle className="text-sm md:text-base font-bold">Rapid Development</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                          Get started in minutes with our intuitive interface and comprehensive documentation. No complex setup required.
                        </p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>

                  <ScrollReveal direction="left" delay={100}>
                    <Card className="h-full bg-card/60 backdrop-blur-md border-muted/40 hover:border-primary/50 transition-all duration-300 p-2.5 md:p-3">
                      <CardHeader className="p-0 mb-1 md:mb-1.5">
                        <Target className="w-5 h-5 md:w-6 md:h-6 text-foreground fill-foreground mb-1" />
                        <CardTitle className="text-sm md:text-base font-bold">Data-Driven Decisions</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                          Make strategic decisions based on real data. Our analytics tools provide insights that matter.
                        </p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                </div>
              </div>
            </div>
          </HorizontalScrollSection>
        </div>
      </section>

      {/* Chapter 04: Stats */}
      <section
        ref={(el) => { sectionsRef.current.stats = el; }}
        id="stats"
        className="min-h-screen w-full flex flex-col justify-center px-4 py-12 md:py-20 relative md:snap-section border-t border-border"
      >
        <div className="container mx-auto max-w-7xl">
          <ScrollReveal direction="up" className="text-center mb-8 md:mb-12">
            <div className="mb-4 flex items-center justify-center gap-4">
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              <Typewriter text="Performance & Reliability" speed={80} delay={200} />
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              <Typewriter text="Built to handle the demands of competitive robotics" speed={40} delay={1200} />
            </p>
          </ScrollReveal>

          <HorizontalScrollSection showControls={false}>
            <div className="flex gap-3 md:gap-5">
              <div className="snap-item min-w-[62vw] sm:min-w-[52vw] md:min-w-[36vw] lg:min-w-[24vw] flex-shrink-0">
                <ScrollReveal direction="up" delay={0}>
                  <div className="text-center p-3 md:p-5 rounded-xl bg-card/60 backdrop-blur-md border border-border hover:border-primary/50 transition-all duration-300 h-full">
                    <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 mb-3 hover:bg-primary/20 transition-colors">
                      <Zap className="w-5 h-5 md:w-6 md:h-6 text-foreground fill-foreground" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2">Lightning Fast</h3>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                      Built with Next.js 15 and optimized for performance. Experience blazing fast load times.
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              <div className="snap-item min-w-[62vw] sm:min-w-[52vw] md:min-w-[36vw] lg:min-w-[24vw] flex-shrink-0">
                <ScrollReveal direction="up" delay={100}>
                  <div className="text-center p-3 md:p-5 rounded-xl bg-card/60 backdrop-blur-md border border-border hover:border-primary/50 transition-all duration-300 h-full">
                    <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 mb-3 hover:bg-primary/20 transition-colors">
                      <Shield className="w-5 h-5 md:w-6 md:h-6 text-foreground fill-foreground" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2">Secure & Reliable</h3>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                      Enterprise-grade security with PocketBase backend. Your data is safe and protected.
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              <div className="snap-item min-w-[62vw] sm:min-w-[52vw] md:min-w-[36vw] lg:min-w-[24vw] flex-shrink-0">
                <ScrollReveal direction="up" delay={200}>
                  <div className="text-center p-3 md:p-5 rounded-xl bg-card/60 backdrop-blur-md border border-border hover:border-primary/50 transition-all duration-300 h-full">
                    <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 mb-3 hover:bg-primary/20 transition-colors">
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-foreground fill-foreground" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2">Always Improving</h3>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                      Continuously updated with new features and improvements based on team feedback.
                    </p>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </HorizontalScrollSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 sm:py-8 md:py-10 mt-auto md:snap-section">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground text-center md:text-left">
          <p>© {new Date().getFullYear()} Team Optix 3749</p>
          <div className="flex gap-6">
            <Link
              href="https://github.com/SlushEE0/otoolkit"
              className="hover:text-foreground transition-colors">
              GitHub
            </Link>
            <Link
              href="/info/privacy"
              className="hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
