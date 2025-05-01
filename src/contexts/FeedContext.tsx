
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import { fetchSavedItem, fetchReportedItem, saveItem, reportItem, shareItem } from '@/lib/api';

type FeedSource = 'twitter' | 'reddit';

export type FeedItem = {
  id: string;
  source: FeedSource;
  author: string;
  content: string;
  title?: string;
  url: string;
  imageUrl?: string;
  timestamp?: Date;
  reportedAt?: Date;
  isSaved: boolean;
  isReported: boolean;
};

type FeedContextType = {
  feedItems: FeedItem[];
  savedItems: FeedItem[];
  reportedItems: FeedItem[];
  isLoading: boolean;
  fetchFeed: () => Promise<void>;
  toggleSaveItem: (id: string) => void;
  toggleReportItem: (id: string) => void;
  toggleShareItem: (id: string) => void;
};

const FeedContext = createContext<FeedContextType>({
  feedItems: [],
  savedItems: [],
  reportedItems: [],
  isLoading: false,
  fetchFeed: async () => { },
  toggleSaveItem: () => { },
  toggleReportItem: () => { },
  toggleShareItem: () => { },
});


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const token = Cookies.get('feedflow_token') || '';
export const FeedProvider = ({ children }: { children: ReactNode }) => {
  const { user, updateCredits } = useAuth();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [savedItems, setSavedItems] = useState<FeedItem[]>([]);
  const [reportedItems, setReportedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved and reported items from localStorage on mount
  useEffect(() => {
    if (!user) return;

    const loadSavedItems = async () => {
      try {
        const savedItemsData = await fetchSavedItem();
        if (savedItemsData) {
          setSavedItems(savedItemsData.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          })));
        }

        const reportedItemsData = await fetchReportedItem();
        if (reportedItemsData) {
          setReportedItems(reportedItemsData.map((item: any) => ({
            ...item,
            timestamp: new Date(item.reportedAt)
          })));
        }
      } catch (error) {
        console.error('Error loading saved items', error);
      }
    };

    loadSavedItems();
  }, [user]);

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const mockFeed = await res.json();
      const updatedFeed = mockFeed.map(item => ({
        ...item,
        isSaved: savedItems.some(saved => saved.id === item.id),
        isReported: reportedItems.some(reported => reported.id === item.id)
      }));

      setFeedItems(updatedFeed);
    } catch (error) {
      console.error('Error fetching feed', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleSaveItem = async (id: string) => {
    if (!user) return;

    const updatedFeed = feedItems.map(item => {
      if (item.id === id) {
        const newSavedState = !item.isSaved;
        if (newSavedState) {
          updateCredits(5, "save_item", "Save Content Bonus");
        }

        return { ...item, isSaved: newSavedState };
      }
      return item;
    });

    await saveItem(id);
    setFeedItems(updatedFeed);

    const itemToToggle = updatedFeed.find(item => item.id === id);
    if (!itemToToggle) return;

    let newSavedItems;
    if (itemToToggle.isSaved) {
      newSavedItems = [...savedItems, itemToToggle];
    } else {
      newSavedItems = savedItems.filter(item => item.id !== id);
    }

    setSavedItems(newSavedItems);
    localStorage.setItem(`feedflow_saved_${user.id}`, JSON.stringify(newSavedItems));
  };

  const toggleReportItem = async (id: string) => {
    if (!user) return;

    const updatedFeed = feedItems.map(item => {
      if (item.id === id) {
        updateCredits(2, "report_item", "Report Item Bonus");
        return { ...item, isReported: true };
      }
      return item;
    });

    await reportItem(id);
    setFeedItems(updatedFeed);

    const reportedItem = updatedFeed.find(item => item.id === id);
    if (!reportedItem) return;

    const newReportedItems = [...reportedItems, reportedItem];
    setReportedItems(newReportedItems);
    localStorage.setItem(`feedflow_reported_${user.id}`, JSON.stringify(newReportedItems));
  };

  const toggleShareItem = async (id: string) => {
    const item = feedItems.find(item => item.id === id);
    if (item) {
      updateCredits(3, "share_item", "Share Item Bonus");

      await shareItem(id);
      navigator.clipboard.writeText(item.url)
        .then(() => {
          console.log('Link copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy link', err);
        });
    }
  };

  return (
    <FeedContext.Provider
      value={{
        feedItems,
        savedItems,
        reportedItems,
        isLoading,
        fetchFeed,
        toggleSaveItem,
        toggleReportItem,
        toggleShareItem,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
};

export const useFeed = () => useContext(FeedContext);
