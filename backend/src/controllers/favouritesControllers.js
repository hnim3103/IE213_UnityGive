import Favorite from "../models/Favourite.js";
import Campaign from "../models/Campaign.js";

// Adds a favorite for the authenticated user. Expects body { campaignId }
export const addFavorite = async (req, res) => {
  const userId = req.user?.id;
  const { campaignId } = req.body;
  if (!userId || !campaignId) return res.status(400).json({ message: "campaignId required" });

  try {
    const fav = new Favorite({ userId, campaignId });
    await fav.save();
    return res.status(201).json(fav);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Already favorited" });
    console.error(error);
    return res.status(500).json({ message: "Unable to add favorite" });
  }
};

// Returns favorites for authenticated user (populated campaigns)
export const getFavoritesByUser = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(400).json({ message: "user not identified" });

  try {
    const favs = await Favorite.find({ userId }).populate({ path: 'campaignId', model: Campaign });
    const campaigns = favs.map(f => f.campaignId).filter(Boolean);
    return res.json({ favorites: favs, campaigns });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch favorites" });
  }
};

// Removes favorite for authenticated user. Expects body { campaignId }
export const removeFavorite = async (req, res) => {
  const userId = req.user?.id;
  const { campaignId } = req.body;
  if (!userId || !campaignId) return res.status(400).json({ message: "campaignId required" });

  try {
    const removed = await Favorite.findOneAndDelete({ userId, campaignId });
    if (!removed) return res.status(404).json({ message: "Favorite not found" });
    return res.json({ message: "Removed", removed });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to remove favorite" });
  }
};
