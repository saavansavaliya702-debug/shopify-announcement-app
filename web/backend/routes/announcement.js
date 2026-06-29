import express from "express";
import Announcement from "../models/Announcement.js";
import { syncAnnouncementToShopify } from "../shopify/client.js";

const router = express.Router();

router.post("/announcement", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Announcement text is required." });
    }

    const shop = process.env.SHOPIFY_SHOP;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    const record = await Announcement.create({
      shop,
      text: text.trim(),
    });

    try {
      await syncAnnouncementToShopify(shop, accessToken, text.trim());
      record.syncedToShopify = true;
      await record.save();
    } catch (syncError) {
      console.error("Shopify metafield sync failed:", syncError);
      return res.status(207).json({
        record,
        warning: "Saved to database but failed to sync to Shopify.",
        details: syncError.message,
      });
    }

    return res.status(201).json({ record });
  } catch (error) {
    console.error("Error saving announcement:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/announcement/history", async (req, res) => {
  try {
    const shop = process.env.SHOPIFY_SHOP;
    const history = await Announcement.find({ shop })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.json({ history });
  } catch (error) {
    console.error("Error fetching history:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/announcement/current", async (req, res) => {
  try {
    const shop = process.env.SHOPIFY_SHOP;
    const latest = await Announcement.findOne({ shop }).sort({ createdAt: -1 });
    return res.json({ current: latest || null });
  } catch (error) {
    console.error("Error fetching current announcement:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
