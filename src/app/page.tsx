import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavbarServerConfig } from "@/components/NavbarServerConfig";
import ServerToaster from "@/components/ServerToaster";
import { BarChart3, ClipboardList, Users } from "lucide-react";

export const metadata = {
  title: "Optix Toolkit | Team Optix 3749",
  description: "Streamlining FRC Operations for Team Optix 3749."
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <NavbarServerConfig defaultExpanded={false} />
      <ServerToaster message="Welcome to the new Optix Toolkit." type="info" />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 space-y-8">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Optix Toolkit
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button asChild size="lg" className="min-w-[150px] text-lg h-12">
            <Link href="/outreach">Outreach</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-w-[150px] text-lg h-12">
            <Link href="/scouting">Scouting</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-card/50 backdrop-blur border-muted/40 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <ClipboardList className="w-6 h-6 text-primary" />
                Outreach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track hours, manage events, and monitor member participation
                effortlessly.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-muted/40 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <BarChart3 className="w-6 h-6 text-primary" />
                Scouting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Real-time data collection and analysis for better match
                strategy.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-muted/40 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Users className="w-6 h-6 text-primary" />
                Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Easy administration tools for team leaders and mentors.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
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
