// backend/controllers/donationController.js
import Donation from '../models/Donation.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/* ───────────────── LIST (paginated) ───────────────── */
export const listDonationsPaginated = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip  = (page - 1) * limit;

    const totalDonations = await Donation.countDocuments({});
    const totalPages     = Math.ceil(totalDonations / limit);

    const donations = await Donation.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    /* attach owner username */
    const donationsWithOwner = await Promise.all(
      donations.map(async (don) => {
        const owner = await User.findById(don.owner).lean();
        return {
          ...don.toObject(),
          ownerInfo: owner ? { _id: owner._id.toString(), username: owner.username } : null
        };
      })
    );

    res.json({ donations: donationsWithOwner, page, totalPages, totalDonations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────── GET helpers ───────────────── */
export const getUserDonations = async (req, res) => {
  try {
    const { userId } = req.params;
    const donations = await Donation.find({ owner: userId }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSingleDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    res.json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────── ADD donation ───────────────── */
export const addDonation = async (req, res) => {
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

    const donationData = {
      title,
      author,
      genre,
      bookShape,
      pages,
      description: description || '',
      owner: req.userId  // from verifyJWT
    };

    if (req.file) donationData.coverImage = `/uploads/${req.file.filename}`;

    const donation = new Donation(donationData);
    await donation.save();
    res.status(201).json({ message: 'Book donated', donation });
  } catch (err) {
    console.error('Error in addDonation:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────── DELETE donation ───────────────── */
export const deleteDonation = async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await Donation.findById(donationId);

    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (donation.owner.toString() !== req.userId)
      return res.status(403).json({ message: 'You do not own this donation' });

    await Donation.findByIdAndDelete(donationId);
    res.json({ message: 'Donation deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────── REQUEST donation ───────────────── */
export const requestDonation = async (req, res) => {
  try {
    const { donationId, reason } = req.body;
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    const messageText =
      `User ${req.userId} wants your donated book "${donation.title}"` +
      (reason ? ` for reason: "${reason}".` : '.');

    const notification = new Notification({
      user: donation.owner,
      type: 'donation_request',
      requester: req.userId,
      book: donationId,
      message: messageText,
      reason,
      status: 'pending'
    });
    await notification.save();

    res.json({ message: 'Donation request sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error requesting donation.' });
  }
};

/* ───────────────── UPDATE donation ───────────────── */
export const updateDonation = async (req, res) => {
  try {
    const donationId = req.params.id;
    const {
      title,
      author,
      genre,
      bookShape,
      pages,
      description
    } = req.body;

    const updateData = { title, author, genre, bookShape, pages, description };
    if (req.file) updateData.coverImage = `/uploads/${req.file.filename}`;

    const updated = await Donation.findByIdAndUpdate(donationId, updateData, { new: true });
    if (!updated)
      return res.status(404).json({ message: 'Donation not found or cannot update' });

    res.json({ message: 'Donation updated', donation: updated });
  } catch (err) {
    console.error('Error updating donation:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────────────── FIND nearest donations ───────────────── */
export const findNearestDonations = async (req, res) => {
  try {
    // still left here for compatibility—UI will drop this button
    res.status(400).json({ message: 'Deprecated: use user location instead' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error finding nearest donations' });
  }
};
