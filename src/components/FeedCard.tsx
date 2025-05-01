
import { useState } from 'react';
import { format } from 'date-fns';
import { Share, Bookmark, BookmarkCheck, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FeedItem } from '@/contexts/FeedContext';

type FeedCardProps = {
  item: FeedItem;
  onSave: (id: string) => void;
  onReport: (id: string) => void;
  onShare: (id: string) => void;
};

const FeedCard = ({ item, onSave, onReport, onShare }: FeedCardProps) => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  console.log("item", item);
  const handleShare = () => {
    setIsSharing(true);
    onShare(item.id);

    toast({
      title: "Link copied!",
      description: "The content link has been copied to your clipboard.",
      duration: 2000,
    });

    setTimeout(() => setIsSharing(false), 1000);
  };

  const handleReport = () => {
    onReport(item.id);

    toast({
      title: "Content reported",
      description: "Thank you for keeping our community safe.",
      duration: 2000,
    });
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md animate-fade-in">
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center space-y-0">
        <div className="flex items-center gap-2">
          <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
            item.source === 'twitter' ? 'bg-blue-400' : 'bg-orange-500'
          }`}>
            <span className="text-xs font-bold text-white">
              {item.source === 'twitter' ? 'T' : 'R'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">{item.author}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(item?.timestamp || item.reportedAt), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
        {item.isReported ? (
          <span className="text-xs text-muted-foreground italic">Reported</span>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReport}
            className="h-8 w-8 p-0"
            disabled={item.isReported}
          >
            <Flag className="h-4 w-4" />
            <span className="sr-only">Report</span>
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {item.title && (
          <h3 className="font-semibold mb-1 line-clamp-2">{item.title}</h3>
        )}
        <p className="text-sm line-clamp-3">{item.content}</p>

        {item.imageUrl && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img
              src={item.imageUrl}
              alt="Post content"
              className="w-full h-40 object-cover"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-2 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => window.open(item.url, '_blank')}
        >
          {item.source === 'twitter' ? 'View Tweet' : 'View Post'}
        </Button>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            disabled={isSharing}
            className="h-8 w-8 p-0"
          >
            <Share className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSave(item.id)}
            className="h-8 w-8 p-0"
          >
            {item.isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            <span className="sr-only">
              {item.isSaved ? 'Unsave' : 'Save'}
            </span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FeedCard;
