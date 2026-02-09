import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  BarChart3,
  Users,
  MessageSquare,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Data-Driven Insights',
      description:
        'Comprehensive dashboards and visualizations to track and analyze faculty performance metrics.',
    },
    {
      icon: MessageSquare,
      title: 'Anonymous Feedback',
      description:
        'Secure and anonymous student feedback system ensuring honest and constructive responses.',
    },
    {
      icon: Users,
      title: 'Faculty Management',
      description:
        'Complete faculty profile management with department assignments and course tracking.',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description:
        'Secure authentication with role-based permissions for admins and faculty members.',
    },
    {
      icon: Zap,
      title: 'Real-Time Analytics',
      description:
        'Instant performance metrics and trend analysis for immediate decision-making.',
    },
    {
      icon: CheckCircle2,
      title: 'Quality Metrics',
      description:
        'Standardized evaluation criteria covering teaching quality, communication, and more.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">FIQ Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/feedback/submit">
              <Button variant="ghost" size="sm">
                Submit Feedback
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute inset-0 opacity-30">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="hero-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-border" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#hero-grid)" />
          </svg>
        </div>
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
              </span>
              Empowering Academic Excellence
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Faculty Instructional{' '}
              <span className="text-gradient">Quality Dashboard</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              A comprehensive platform for evaluating, analyzing, and visualizing faculty
              teaching performance using academic data and student feedback.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/feedback/submit">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Submit Feedback
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Comprehensive Quality Assessment
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to evaluate and improve instructional quality across
              your institution.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="dashboard-card group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="border-y border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">95%</p>
              <p className="mt-2 text-sm text-muted-foreground">Response Rate</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-accent">500+</p>
              <p className="mt-2 text-sm text-muted-foreground">Faculty Members</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-success">4.5</p>
              <p className="mt-2 text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-warning">50+</p>
              <p className="mt-2 text-sm text-muted-foreground">Departments</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl bg-primary p-8 sm:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/30" />
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to Improve Teaching Quality?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Join hundreds of institutions using FIQ Dashboard to enhance
                instructional quality and student outcomes.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                FIQ Dashboard
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Faculty Instructional Quality Dashboard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
