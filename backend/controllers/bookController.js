import Book         from '../models/Book.js';
import Notification from '../models/Notification.js';
import User         from '../models/User.js';

/* ───────────────── LIST (paginated) ───────────────── */
export const listExchangeBooksPaginated = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip  = (page - 1) * limit;

    const totalBooks = await Book.countDocuments({});
    const totalPages = Math.ceil(totalBooks / limit);

    const books = await Book.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const booksWithOwner = await Promise.all(
      books.map(async (book) => {
        const owner = await User.findById(book.owner).lean();
        return {
          ...book.toObject(),
          ownerInfo: owner
            ? { _id: owner._id.toString(), username: owner.username }
            : null
        };
      })
    );

    res.json({ books: booksWithOwner, page, totalPages, totalBooks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────── GET helpers ───────────────── */
export const getUserBooks = async (req, res) => {
  try {
    const { userId } = req.params;
    const books = await Book.find({ owner: userId }).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLastThreeBooks = async (req, res) => {
  try {
    const { userId } = req.params;
    const books = await Book.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(3);
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSingleBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const owner = await User.findById(book.owner).lean();
    const bookObj = book.toObject();
    if (owner)
      bookObj.ownerInfo = { _id: owner._id.toString(), username: owner.username };

    res.json(bookObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────── ADD book (no more per-book location!) ───────────────── */
export const addExchangeBook = async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      bookShape,
      pages,
      description
    } = req.body;

    if (!title || !author || !genre || !bookShape || !pages)
      return res.status(400).json({ message: 'Missing required fields.' });
    if (description && description.length > 200)
      return res
        .status(400)
        .json({ message: 'Description exceeds 200 characters.' });

    const data = {
      title,
      author,
      genre,
      bookShape,
      pages,
      description: description || '',
      owner: req.userId
    };

    if (req.file) data.coverImage = `/uploads/${req.file.filename}`;

    const newBook = new Book(data);
    await newBook.save();
    res.status(201).json({ message: 'Book added for exchange', book: newBook });
  } catch (err) {
    console.error('Error in addExchangeBook:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────── UPDATE & DELETE (unchanged) ───────────────── */
export const updateExchangeBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, genre, bookShape, pages, description } = req.body;

    const updateData = { title, author, genre, bookShape, pages, description };
    if (req.file) updateData.coverImage = `/uploads/${req.file.filename}`;

    const updated = await Book.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated)
      return res.status(404).json({ message: 'Book not found or cannot update' });

    res.json({ message: 'Book updated', book: updated });
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUserBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.userId;
    const book   = await Book.findById(bookId);

    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.owner.toString() !== userId)
      return res.status(403).json({ message: 'You do not own this book' });

    await Book.findByIdAndDelete(bookId);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────── REQUEST exchange (unchanged) ───────────────── */
export const requestExchange = async (req, res) => {
  try {
    const requesterId = req.userId;
    const { bookId, requesterBookId } = req.body;

    const [targetBook, userBook] = await Promise.all([
      Book.findById(bookId),
      Book.findById(requesterBookId)
    ]);

    if (!targetBook)
      return res.status(404).json({ message: 'Target book not found' });
    if (!userBook)
      return res.status(400).json({ message: 'Invalid requester book' });
    if (userBook.owner.toString() !== requesterId)
      return res
        .status(403)
        .json({ message: 'You do not own the requester book' });

    const messageText = 
      `User ${requesterId} wants to exchange their book "${userBook.title}" ` +
      `for your book "${targetBook.title}".`;

    await new Notification({
      user: targetBook.owner,
      type: 'exchange_request',
      requester: requesterId,
      book: bookId,
      requesterBook: requesterBookId,
      message: messageText,
      status: 'pending'
    }).save();

    res.json({ message: 'Exchange request sent successfully' });
  } catch (err) {
    console.error('Error in requestExchange:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────── FIND nearest (dynamic via User.reservedLocation) ───────────────── */
export const findNearestBooks = async (req, res) => {
  try {
    // 1) figure out the “search origin”:
    let lat, lng;
    if (req.query.latitude && req.query.longitude) {
      lat = parseFloat(req.query.latitude);
      lng = parseFloat(req.query.longitude);
    } else {
      // fallback to profile’s reservedLocation
      const me = await User.findById(req.userId).populate('reservedLocation');
      if (
        !me?.reservedLocation?.coordinates ||
        me.reservedLocation.coordinates.length !== 2
      ) {
        return res
          .status(400)
          .json({ message: 'No valid user location available' });
      }
      [ lng, lat ] = me.reservedLocation.coordinates;
    }

    // 2) grab *all* books with their owner’s location
    const all = await Book.find({})
      .populate({
        path: 'owner',
        select: 'reservedLocation username'
      })
      .lean();

    // 3) compute Haversine distance per-book, filter out any missing owner loc
    const withDist = all
      .map((b) => {
        const coords = b.owner?.reservedLocation?.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2) return null;
        const [ olng, olat ] = coords;
        const toRad = (x) => (x * Math.PI) / 180;
        const R = 6371e3; // metres
        const φ1 = toRad(lat);
        const φ2 = toRad(olat);
        const Δφ = toRad(olat - lat);
        const Δλ = toRad(olng - lng);
        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return {
          ...b,
          distance
        };
      })
      .filter((x) => x !== null);

    // 4) sort & limit
    withDist.sort((a, b) => a.distance - b.distance);
    const nearest = withDist.slice(0, 20);

    res.json({ books: nearest });
  } catch (err) {
    console.error('Error finding nearest books:', err);
    res
      .status(500)
      .json({ message: 'Server error finding nearest books' });
  }
};
