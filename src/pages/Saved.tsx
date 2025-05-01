
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useFeed } from '@/contexts/FeedContext';
import FeedCard from '@/components/FeedCard';

const Saved = () => {
  const { savedItems, toggleSaveItem, toggleReportItem, toggleShareItem } = useFeed();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter saved items based on search query
  const filteredItems = savedItems.filter(item => {
    if (searchQuery.trim() === '') return true;

    const query = searchQuery.toLowerCase();
    const content = item.content.toLowerCase();
    const title = item.title?.toLowerCase() || '';
    const author = item.author.toLowerCase();

    return content.includes(query) || title.includes(query) || author.includes(query);
  });

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Saved Content</h1>
          <p className="text-muted-foreground">
            Browse and manage your saved content
          </p>
        </div>

        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search saved items..."
            className="pl-8 w-full md:w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.length > 0 ? (
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
            <p className="text-muted-foreground">
              {savedItems.length === 0
                ? "You haven't saved any content yet. Browse the feed to find interesting content to save!"
                : "No saved content matches your search."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
