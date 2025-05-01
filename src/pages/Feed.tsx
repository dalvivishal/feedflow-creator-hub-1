
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Twitter, RefreshCcw } from 'lucide-react';
import { useFeed } from '@/contexts/FeedContext';
import FeedCard from '@/components/FeedCard';

const Feed = () => {
  const { feedItems, isLoading, fetchFeed, toggleSaveItem, toggleReportItem, toggleShareItem } = useFeed();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSource, setActiveSource] = useState('all');

  useEffect(() => {
    if (feedItems.length === 0) {
      fetchFeed();
    }
  }, [fetchFeed, feedItems.length]);

  const filteredItems = feedItems.filter(item => {
    if (activeSource !== 'all' && item.source !== activeSource) {
      return false;
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const content = item.content.toLowerCase();
      const title = item.title?.toLowerCase() || '';
      const author = item.author.toLowerCase();

      return content.includes(query) ||
             title.includes(query) ||
             author.includes(query);
    }

    return true;
  });

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Content Feed</h1>
          <p className="text-muted-foreground">
            Discover and interact with content from multiple sources
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search feed..."
              className="pl-8 w-full md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchFeed()}
            disabled={isLoading}
          >
            <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveSource} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Sources</TabsTrigger>
          <TabsTrigger value="twitter">
            <Twitter size={16} className="mr-2" />
            Twitter
          </TabsTrigger>
          <TabsTrigger value="reddit">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16zm3.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-7 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm3.5 5c2.5 0 4.5-1.5 4.5-3h-9c0 1.5 2 3 4.5 3z" />
            </svg>
            Reddit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading feed...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                onSave={toggleSaveItem}
                onReport={toggleReportItem}
                onShare={toggleShareItem}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No content found matching your filters.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="twitter" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading Twitter content...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                onSave={toggleSaveItem}
                onReport={toggleReportItem}
                onShare={toggleShareItem}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No Twitter content found matching your filters.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reddit" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading Reddit content...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                onSave={toggleSaveItem}
                onReport={toggleReportItem}
                onShare={toggleShareItem}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No Reddit content found matching your filters.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Feed;
