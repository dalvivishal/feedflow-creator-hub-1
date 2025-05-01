
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookmarkCheck, Share2, BarChart3, CreditCard } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      title: "Credit Points System",
      description: "Earn credits for daily logins, completing your profile, and interacting with content.",
      icon: <CreditCard className="w-10 h-10 text-brand-purple" />,
    },
    {
      title: "Multi-Source Feed",
      description: "Access content from Twitter and Reddit in a single, unified feed.",
      icon: <BarChart3 className="w-10 h-10 text-brand-purple" />,
    },
    {
      title: "Save Content",
      description: "Bookmark interesting content to revisit later.",
      icon: <BookmarkCheck className="w-10 h-10 text-brand-purple" />,
    },
    {
      title: "Share & Engage",
      description: "Share interesting content and engage with your followers.",
      icon: <Share2 className="w-10 h-10 text-brand-purple" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container px-4 py-20 md:py-32">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              ✨ Your social content, simplified
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                Manage Your Social Presence with{" "}
                <span className="text-brand-purple">FeedFlow</span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Aggregate content from multiple sources, earn credits, and manage your online presence all in one place.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">Login</Button>
              </Link>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            <div className="relative aspect-video bg-muted">
              <img
                src="https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b"
                alt="FeedFlow Dashboard Preview"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white font-bold text-lg">
                Your Dashboard
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-16 md:py-24">
        <div className="space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Powerful Features for Creators
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Designed to help you manage your social presence and maximize engagement.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-16">
        <div className="rounded-lg bg-primary/5 px-6 py-12 md:px-12 md:py-16 text-center">
          <div className="mx-auto max-w-[700px] space-y-6">
            <h2 className="text-3xl font-bold">Ready to streamline your content management?</h2>
            <p className="text-muted-foreground md:text-lg">
              Sign up now and start earning credits while managing your social media presence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button size="lg">Create Account</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">Log In</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container px-4 py-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="h-8 w-8 rounded-full bg-brand-purple flex items-center justify-center">
              <span className="font-bold text-white">F</span>
            </div>
            <span className="font-bold text-xl">FeedFlow</span>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="#" className="hover:text-foreground">Terms</Link>
            <Link to="#" className="hover:text-foreground">Privacy</Link>
            <Link to="#" className="hover:text-foreground">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
