
const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const FeedItem = require('../models/FeedItem');
const SavedItem = require('../models/SavedItem');
const ReportedItem = require('../models/ReportedItem');
const CreditTransaction = require('../models/CreditTransaction');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// const RAPID_API_KEY = process.env.RAPID_API_KEY;
const formatTwitterData = (twitterData) => {
  return twitterData.map(tweet => ({
    source: 'twitter',
    author: tweet.user.screen_name,
    content: tweet.text,
    url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
    imageUrl: tweet.entities.media ? tweet.entities.media[0].media_url : undefined,
    timestamp: new Date(tweet.created_at)
  }));
};

const formatRedditData = (redditData) => {
  return redditData.map(post => ({
    source: 'reddit',
    author: post.data.author,
    title: post.data.title,
    content: post.data.selftext || post.data.title,
    url: `https://reddit.com${post.data.permalink}`,
    imageUrl: post.data.thumbnail !== 'self' && post.data.thumbnail !== 'default'
      ? post.data.thumbnail
      : undefined,
    timestamp: new Date(post.data.created_utc * 1000)
  }));
};

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    let feedItems = await FeedItem.find().sort({ timestamp: -1 }).limit(20);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const hasRecentItems = feedItems.some(item => new Date(item.timestamp) > oneHourAgo);

    if (feedItems.length === 0 || !hasRecentItems) {

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://twitter-x.p.rapidapi.com/user/tweetsandreplies?user_id=44196397&limit=5',
        headers: {
          'x-rapidapi-key': 'e4befd028cmsh84efe0813b6273bp141073jsnafb087fcef77',
          'x-rapidapi-host': 'twitter-x.p.rapidapi.com'
        }
      };

      let twitterData = [];

      try {
        const response = await axios.request(config);
        const entries = response.data.data.user_result.result.timeline_response.timeline.instructions
          .flatMap(instruction => [instruction.entry || []])
          .filter(Boolean);

        twitterData = entries.map(entry => {
          const tweetResult = entry?.content?.content?.tweetResult?.result;
          const legacy = tweetResult?.legacy;
          const user = tweetResult?.core?.user_result?.result?.legacy;

          if (legacy && user) {
            return {
              id_str: legacy.id_str || tweetResult.rest_id,
              user: { screen_name: `@${user.screen_name}` },
              text: legacy.full_text,
              created_at: new Date(legacy.created_at).toISOString(),
              entities: legacy.extended_entities
                ? { media: legacy.extended_entities.media.map(m => ({ media_url: m.media_url_https })) }
                : {}
            };
          }
        }).filter(Boolean);
      } catch (error) {
        console.error('Twitter fetch error:', error);
      }

      const redditConfig = {
        method: 'GET',
        url: 'https://reddit34.p.rapidapi.com/getPopularPosts',
        params: { sort: 'new' },
        headers: {
          'x-rapidapi-key': 'e0c3864f6dmsh7a6cc0ab98ffffcp1954bbjsnc64427d79270',
          'x-rapidapi-host': 'reddit34.p.rapidapi.com'
        }
      };

      let redditData = [];
      try {
        const response = await axios.request(redditConfig);
        const posts = response.data?.data?.children || [];

        redditData = posts.map(post => {
          const data = post.data;

          return {
            id_str: data.id,
            user: { screen_name: `@${data.author}` },
            text: data.selftext || data.title || '',
            created_at: new Date(data.created_utc * 1000).toISOString(),
            entities: {
              media: data.thumbnail && data.thumbnail.startsWith('http')
                ? [{ media_url: data.thumbnail }]
                : []
            }
          };
        });

        // console.log(redditData);
      } catch (error) {
        console.error('Reddit API fetch error:', error.message);
      }

      const formattedTwitter = formatTwitterData(twitterData);
      const formattedReddit = formatRedditData(redditData);
      const combinedFeed = [...formattedTwitter, ...formattedReddit];

      try {
        await Promise.all(
          combinedFeed.map(item =>
            FeedItem.updateOne(
              { url: item.url },
              { $set: item },
              { upsert: true }
            )
          )
        );
      } catch (error) {
        console.log("error insert :", error.message);
      }

      feedItems = await FeedItem.find().sort({ timestamp: -1 }).limit(20);
    }

    const savedItems = await SavedItem.find({ userId }).select('feedItemId');
    const reportedItems = await ReportedItem.find({ userId }).select('feedItemId');
    const savedItemIds = savedItems.map(item => item.feedItemId.toString());
    const reportedItemIds = reportedItems.map(item => item.feedItemId.toString());

    const feedWithFlags = feedItems.map(item => ({
      id: item._id,
      source: item.source,
      author: item.author,
      content: item.content,
      title: item.title,
      url: item.url,
      imageUrl: item.imageUrl,
      timestamp: item.timestamp,
      isSaved: savedItemIds.includes(item._id.toString()),
      isReported: reportedItemIds.includes(item._id.toString())
    }));

    return res.json(feedWithFlags);
  } catch (error) {
    console.error('Get feed error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/save/:itemId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const feedItem = await FeedItem.findById(itemId);
    if (!feedItem) {
      return res.status(404).json({ error: 'Feed item not found' });
    }

    const existingSave = await SavedItem.findOne({ userId, feedItemId: itemId });

    if (existingSave) {
      await SavedItem.findByIdAndDelete(existingSave._id);
      return res.json({ message: 'Item unsaved successfully', isSaved: false });
    } else {
      const savedItem = new SavedItem({
        userId,
        feedItemId: itemId
      });

      await savedItem.save();

      const user = await User.findById(userId);
      user.credits += 5;
      await user.save();

      const creditTransaction = new CreditTransaction({
        userId,
        amount: 5,
        type: 'save_item',
        description: `Saved content from ${feedItem.source}`
      });

      await creditTransaction.save();

      return res.status(201).json({ message: 'Item saved successfully', isSaved: true });
    }
  } catch (error) {
    console.error('Save item error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/report/:itemId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { reason } = req.body;

    const feedItem = await FeedItem.findById(itemId);
    if (!feedItem) {
      return res.status(404).json({ error: 'Feed item not found' });
    }

    const existingReport = await ReportedItem.findOne({ userId, feedItemId: itemId });

    if (existingReport) {
      return res.status(400).json({ error: 'Item already reported' });
    }

    const reportedItem = new ReportedItem({
      userId,
      feedItemId: itemId,
      reason: reason || 'Inappropriate content'
    });

    await reportedItem.save();

    const user = await User.findById(userId);
    user.credits += 2;
    await user.save();

    const creditTransaction = new CreditTransaction({
      userId,
      amount: 2,
      type: 'report_item',
      description: `Reported content from ${feedItem.source}`
    });

    await creditTransaction.save();

    return res.status(201).json({ message: 'Item reported successfully' });
  } catch (error) {
    console.error('Report item error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/saved', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const savedItems = await SavedItem.find({ userId })
      .populate('feedItemId')
      .sort({ savedAt: -1 });

    const formattedItems = savedItems.map(item => ({
      id: item.feedItemId._id,
      source: item.feedItemId.source,
      author: item.feedItemId.author,
      content: item.feedItemId.content,
      title: item.feedItemId.title,
      url: item.feedItemId.url,
      imageUrl: item.feedItemId.imageUrl,
      timestamp: item.feedItemId.timestamp,
      isSaved: true,
      isReported: false
    }));

    return res.json(formattedItems);
  } catch (error) {
    console.error('Get saved items error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/share/:itemId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const feedItem = await FeedItem.findById(itemId);
    if (!feedItem) {
      return res.status(404).json({ error: 'Feed item not found' });
    }

    const user = await User.findById(userId);
    user.credits += 3;
    await user.save();

    const creditTransaction = new CreditTransaction({
      userId,
      amount: 3,
      type: 'share_item',
      description: `Shared content from ${feedItem.source}`
    });

    await creditTransaction.save();

    return res.json({ message: 'Share recorded successfully' });
  } catch (error) {
    console.error('Share item error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN ROUTES

// Get all reported items (admin only)
router.get('/reported', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reportedItems = await ReportedItem.find()
      .populate('feedItemId')
      .populate('userId', 'name email')
      .sort({ reportedAt: -1 });

    return res.json(reportedItems);
  } catch (error) {
    console.error('Get reported items error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
