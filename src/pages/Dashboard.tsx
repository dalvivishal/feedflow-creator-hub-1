
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, BookmarkCheck, Clock, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useFeed } from '@/contexts/FeedContext';
import StatsCard from '@/components/StatsCard';
import CreditActivity from '@/components/CreditActivity';
import FeedCard from '@/components/FeedCard';
import { creditTransaction, fetchUserProfile } from "@/lib/api";
import Cookies from 'js-cookie';

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const {
    feedItems,
    savedItems,
    fetchFeed,
    toggleSaveItem,
    toggleReportItem,
    toggleShareItem
  } = useFeed();
  const [creditsAwarded, setCreditsAwarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const savedUser = Cookies.get('feedflow_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);

          setUser({
            ...parsedUser,
            lastLogin: new Date(parsedUser.lastLogin),
          });

          const latestUser = await fetchUserProfile();
          const updatedUser = {
            ...latestUser,
            lastLogin: new Date(latestUser.lastLogin),
          };

          setUser(updatedUser);
          Cookies.set('feedflow_user', JSON.stringify(updatedUser));

        } catch (error) {
          console.error('Failed to parse user cookie or fetch user', error);
          Cookies.remove('feedflow_user');
          Cookies.remove('feedflow_token');
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, [setUser]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    if (feedItems.length === 0) {
      fetchFeed();
    }
  }, [feedItems.length]);

  useEffect(() => {
    const awardCredits = async () => {
      if (!user || user.profileComplete) {
        return;
      }

      const awarded = localStorage.getItem(`credits_awarded_${user.id}`);
      if (awarded) {
        return;
      }

      try {
        await creditTransaction(20, "profile_completion", "Profile completion bonus");
        localStorage.setItem(`credits_awarded_${user.id}`, 'true');
        setCreditsAwarded(true);

        setUser(prevUser => {
          if (!prevUser) return prevUser;
          const updatedUser = {
            ...prevUser,
            credits: prevUser.credits + 20,
          };

          // Cookies.set('feedflow_user', JSON.stringify(updatedUser), { expires: 7 });
          const map = new Map(Object.entries(updatedUser));
          const mapStr = JSON.stringify(Array.from(map.entries()));
          Cookies.set('feedflow_user', mapStr);
          return updatedUser;
        });

      } catch (error) {
        console.error("Failed to award credits:", error);
      }
    };

    awardCredits();
  }, [user, setUser]);

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground">
          Track your activity, manage saved content, and view your credit balance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <StatsCard
          title="Total Credits"
          value={user.credits}
          icon={<CreditCard size={20} />}
          description="Available to redeem"
        />
        <StatsCard
          title="Saved Content"
          value={savedItems.length}
          icon={<BookmarkCheck size={20} />}
          description="Items in your collection"
        />
        <StatsCard
          title="Daily Streak"
          value="3 days"
          icon={<Clock size={20} />}
          description="Keep logging in daily"
          trend={{ value: 20, isPositive: true }}
        />
        <StatsCard
          title="Feed Sources"
          value="2"
          icon={<BarChart3 size={20} />}
          description="Twitter, Reddit"
        />
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-3">
        <div className="col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Recent Feed</CardTitle>
                <CardDescription>Latest content from your feed sources</CardDescription>
              </div>
              <Link to="/feed">
                <Button variant="outline" size="sm">View all</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedItems.slice(0, 2).map(item => (
                  <FeedCard
                    key={item.id}
                    item={item}
                    onSave={toggleSaveItem}
                    onReport={toggleReportItem}
                    onShare={toggleShareItem}
                  />
                ))}
                {feedItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading feed items...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <CreditActivity />
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Saved Content</CardTitle>
            <CardDescription>
              Content you've bookmarked for later
            </CardDescription>
          </CardHeader>
          <CardContent>
            {savedItems.length > 0 ? (
              <div className="space-y-4">
                {savedItems.slice(0, 2).map(item => (
                  <FeedCard
                    key={item.id}
                    item={item}
                    onSave={toggleSaveItem}
                    onReport={toggleReportItem}
                    onShare={toggleShareItem}
                  />
                ))}
                {savedItems.length > 2 && (
                  <div className="text-center mt-4">
                    <Link to="/saved">
                      <Button variant="outline">View all saved items</Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                You haven't saved any content yet. Browse the feed to find interesting content to save!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
