
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, BarChart3, Home, Bookmark, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4 md:py-2">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-brand-purple flex items-center justify-center">
              <span className="font-bold text-white">F</span>
            </div>
            <span className="hidden font-bold text-xl sm:inline-block">FeedFlow</span>
          </Link>
        </div>

        {user ? (
          <>
            <div className="hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-6">
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/feed"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/feed' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Feed
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location.pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </nav>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full border px-3 py-1">
                  <span className="text-xs font-bold">Credits:</span>
                  <span className="text-xs font-medium">{user.credits}</span>
                </div>
                <div className="relative inline-block">
                  <Avatar>
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <button
                    onClick={logout}
                    className="absolute -bottom-1 -right-1 rounded-full bg-muted p-0.5 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <LogOut size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile navigation */}
            <button
              className="inline-flex md:hidden items-center justify-center rounded-md p-2 text-muted-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link to="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && isMobile && user && (
        <div className="fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container flex flex-col py-6 gap-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full border px-3 py-1">
                <span className="text-xs font-bold">Credits:</span>
                <span className="text-xs font-medium">{user.credits}</span>
              </div>
            </div>

            <nav className="flex flex-col gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={18} />
                Dashboard
              </Link>
              <Link
                to="/feed"
                className="flex items-center gap-2 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 size={18} />
                Feed
              </Link>
              <Link
                to="/saved"
                className="flex items-center gap-2 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bookmark size={18} />
                Saved Items
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  Admin
                </Link>
              )}
            </nav>

            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
