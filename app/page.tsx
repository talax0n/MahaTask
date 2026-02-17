"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LayoutDashboard, Users, Calendar as CalendarIcon, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span>MahaTask</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
            <Link href="#testimonials" className="hover:text-primary transition-colors">Stories</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-purple-500/5 -z-10" />
          <div className="container mx-auto px-4 md:px-6 text-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="max-w-3xl mx-auto space-y-8"
            >
              <motion.div variants={fadeIn}>
                <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                  ✨ The Ultimate Student Productivity Suite
                </Badge>
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white pb-2">
                Master Your Academic Journey with Ease
              </motion.h1>
              
              <motion.p variants={fadeIn} className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Stop juggling multiple apps. MahaTask combines task management, smart scheduling, and study groups into one cohesive platform tailored for students.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 text-lg rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
                    Start for Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full border-2">
                    Explore Features
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 100, rotateX: 10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-20 mx-auto max-w-5xl rounded-xl border bg-background/50 backdrop-blur shadow-2xl overflow-hidden perspective-1000 group"
            >
               <div className="bg-muted/50 border-b p-4 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="mx-auto text-xs font-mono text-muted-foreground opacity-50">mahatask.app/dashboard</div>
               </div>
               <div className="aspect-[16/9] relative bg-gradient-to-br from-background to-muted/30 p-8 grid grid-cols-4 gap-4">
                  {/* Mock Sidebar */}
                  <div className="col-span-1 h-full rounded-lg bg-card border border-border/50 p-4 hidden md:flex flex-col gap-4">
                     <div className="h-8 w-8 rounded-md bg-primary/20" />
                     <div className="space-y-2">
                        <div className="h-2 w-2/3 rounded bg-muted" />
                        <div className="h-2 w-full rounded bg-muted" />
                        <div className="h-2 w-1/2 rounded bg-muted" />
                     </div>
                  </div>
                  {/* Mock Content */}
                  <div className="col-span-4 md:col-span-3 h-full flex flex-col gap-4">
                     <div className="h-32 w-full rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 flex flex-col justify-center">
                        <div className="h-6 w-1/3 rounded bg-indigo-500/20 mb-2" />
                        <div className="h-3 w-1/2 rounded bg-indigo-500/10" />
                     </div>
                     <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="rounded-xl bg-card border border-border/50 p-4" />
                        <div className="rounded-xl bg-card border border-border/50 p-4" />
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">Everything you need to excel</h2>
              <p className="text-lg text-muted-foreground">
                We've built the tools that high-performing students rely on, all in one beautiful interface.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<LayoutDashboard className="w-6 h-6 text-indigo-500" />}
                title="Centralized Dashboard"
                description="Get a bird's-eye view of your assignments, exams, and daily schedule instantly."
              />
              <FeatureCard 
                icon={<CheckCircle2 className="w-6 h-6 text-green-500" />}
                title="Smart Task Management"
                description="Organize assignments with tags, priorities, and deadlines. Never miss a submission."
              />
              <FeatureCard 
                icon={<CalendarIcon className="w-6 h-6 text-orange-500" />}
                title="Academic Calendar"
                description="Sync your class schedule and exam dates. Visualise your week with clarity."
              />
              <FeatureCard 
                icon={<Users className="w-6 h-6 text-blue-500" />}
                title="Study Groups"
                description="Collaborate with peers, share notes, and chat in real-time within your study groups."
              />
              <FeatureCard 
                icon={<Zap className="w-6 h-6 text-yellow-500" />}
                title="Focus Mode"
                description="Minimize distractions and track your study sessions with built-in timers."
              />
               <FeatureCard 
                icon={<ShieldCheck className="w-6 h-6 text-purple-500" />}
                title="Secure & Private"
                description="Your academic data is encrypted and safe. You control who sees what."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-background z-0" />
           <div className="container mx-auto px-4 md:px-6 relative z-10 text-center text-white">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                <h2 className="text-3xl md:text-5xl font-bold">Ready to boost your GPA?</h2>
                <p className="text-indigo-200 text-lg">
                  Join thousands of students who are organizing their academic life with MahaTask.
                </p>
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-full mt-4">
                    Get Started Now
                  </Button>
                </Link>
              </motion.div>
           </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-background">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg">
            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
            <span>MahaTask</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Support</Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MahaTask. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full border-none shadow-lg bg-card/50 backdrop-blur hover:bg-card transition-colors">
        <CardContent className="p-6 space-y-4">
          <div className="p-3 w-fit rounded-lg bg-background border shadow-sm">
            {icon}
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}