// controllers/aiController.js
import Book from '../models/Book.js';
import Donation from '../models/Donation.js';

/**
 * Escape regex special characters in a string
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

/**
 * Handle AI-like recommendations requiring exact matches of
 * genre, author, or title anywhere in the user's sentence.
 */
export const handleDialogflow = async (req, res) => {
  try {
    const { question = '', scope } = req.body;
    const text = question.trim();
    if (!text) return res.status(400).json({ message: 'Question is required.' });

    const low = text.toLowerCase();
    // 1) Greeting detection
    const greetings = ['hi','hello','hey','سلام','مرحبا'];
    if (greetings.some(g => low === g || low.startsWith(g + ' '))) {
      return res.json({
        message: 'Hello! 👋 Please mention the exact genre, author, or book title in your question for recommendations.'
      });
    }

    // 2) Fetch distinct values from DB
    const [dbGenres, dbAuthors, dbTitles] = await Promise.all([
      Promise.all([Book.distinct('genre'), Donation.distinct('genre')])
        .then(arr => Array.from(new Set(arr.flat()))),
      Promise.all([Book.distinct('author'), Donation.distinct('author')])
        .then(arr => Array.from(new Set(arr.flat()))),
      Promise.all([Book.distinct('title'), Donation.distinct('title')])
        .then(arr => Array.from(new Set(arr.flat())))
    ]);

    // 3) Detect matches by exact substring
    let genreString = null;
    for (const g of dbGenres) {
      if (low.includes(g.toLowerCase())) {
        genreString = g;
        break;
      }
    }
    let authorString = null;
    for (const a of dbAuthors) {
      if (low.includes(a.toLowerCase())) {
        authorString = a;
        break;
      }
    }
    let titleString = null;
    for (const t of dbTitles) {
      if (low.includes(t.toLowerCase())) {
        titleString = t;
        break;
      }
    }

    // 4) Build our Mongo filter using substring regex
    let filter = {};
    if (genreString)  filter.genre  = new RegExp(escapeRegExp(genreString), 'i');
    if (authorString) filter.author = new RegExp(escapeRegExp(authorString), 'i');
    if (titleString)  filter.title  = new RegExp(escapeRegExp(titleString), 'i');

    // 5) Fallback to full-text regex if no field matched
    if (!genreString && !authorString && !titleString) {
      const regex = new RegExp(escapeRegExp(text), 'i');
      filter = {
        $or: [
          { title:       regex },
          { author:      regex },
          { genre:       regex },
          { description: regex }
        ]
      };
    }

    // 6) Query exchange and/or donation
    const tasks = [];
    if (!scope || scope === 'exchange') tasks.push(Book.find(filter).limit(5).lean());
    if (!scope || scope === 'donation') tasks.push(Donation.find(filter).limit(5).lean());
    const [books = [], donations = []] = await Promise.all(tasks);

    // 7) Combine and format
    const recommendations = [
      ...books.map(b => ({
        title: b.title,
        author: b.author,
        description: b.description,
        link: `/exchange/${b._id}`
      })),
      ...donations.map(d => ({
        title: d.title,
        author: d.author,
        description: d.description,
        link: `/donate/${d._id}`
      }))
    ];

    // 8) No-match messaging
    if (recommendations.length === 0) {
      if (titleString)  return res.json({ message: `Sorry, I couldn't find a book titled "${titleString}".`, recommendations: [] });
      if (genreString)  return res.json({ message: `Sorry, there are no books in the "${genreString}" genre.`, recommendations: [] });
      if (authorString) return res.json({ message: `Sorry, there are no books by "${authorString}".`, recommendations: [] });
      return res.json({ message: 'Sorry, no matching books found.', recommendations: [] });
    }

    // 9) Return successful recommendations
    return res.json({ message: '', recommendations });
  } catch (error) {
    console.error('AI recommendation error:', error);
    return res.status(500).json({ message: 'Server error in recommendations' });
  }
};
