/**
 * Migration: Fix campaigns where:
 *   1. totalGoalAmount / softCapAmount were stored as Wei strings instead of ETH strings
 *   2. startDate / endDate were stored as bad strings (e.g. "2026-1-27T00:00:00")
 *
 * Uses lean() + raw updateOne to bypass Mongoose schema validation entirely.
 * Safe to run multiple times (idempotent).
 */

import mongoose from 'mongoose';
import { ethers } from 'ethers';
import 'dotenv/config';

const WEI_THRESHOLD = BigInt('1000000000000000'); // 0.001 ETH in Wei

/** Pad single-digit month/day: "2026-1-27T..." → "2026-01-27T..." */
function fixDateString(str) {
  if (!str || typeof str !== 'string') return null;
  // Match YYYY-M-D or YYYY-MM-D or YYYY-M-DD with optional time
  const m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(T.*)?$/);
  if (!m) return null;
  const [, year, month, day, time] = m;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}${time || 'T00:00:00'}`;
}

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  const db = mongoose.connection.db;
  const col = db.collection('campaigns');

  // Use raw find to avoid Mongoose validation on load
  const campaigns = await col.find({}).toArray();
  let fixed = 0;

  for (const c of campaigns) {
    const update = {};

    // ── Fix totalGoalAmount ──────────────────────────────────────────────
    try {
      const goalStr = String(c.totalGoalAmount || '0').split('.')[0];
      const goalBig = BigInt(goalStr);
      if (goalBig >= WEI_THRESHOLD) {
        const ethVal = ethers.formatEther(goalBig);
        console.log(`[${c._id}] totalGoalAmount: ${c.totalGoalAmount} → ${ethVal} ETH`);
        update.totalGoalAmount = ethVal;
      }
    } catch (_) { }

    // ── Fix softCapAmount ────────────────────────────────────────────────
    try {
      const softStr = String(c.softCapAmount || '0').split('.')[0];
      const softBig = BigInt(softStr);
      if (softBig >= WEI_THRESHOLD) {
        const ethVal = ethers.formatEther(softBig);
        console.log(`[${c._id}] softCapAmount: ${c.softCapAmount} → ${ethVal} ETH`);
        update.softCapAmount = ethVal;
      }
    } catch (_) { }

    try {
      const currStr = String(c.currentAmount || '0').split('.')[0];
      const currBig = BigInt(currStr);
      if (currBig >= WEI_THRESHOLD) {
        const ethVal = ethers.formatEther(currBig);
        console.log(`[${c._id}] currentAmount: ${c.currentAmount} → ${ethVal} ETH`);
        update.currentAmount = ethVal;
      }
    } catch (_) { }

    // ── Fix malformed startDate ──────────────────────────────────────────
    if (typeof c.startDate === 'string') {
      const fixed = fixDateString(c.startDate);
      const parsed = fixed ? new Date(fixed) : null;
      if (parsed && !isNaN(parsed)) {
        console.log(`[${c._id}] startDate: "${c.startDate}" → ${parsed.toISOString()}`);
        update.startDate = parsed;
      }
    }

    // ── Fix malformed endDate ────────────────────────────────────────────
    if (typeof c.endDate === 'string') {
      const fixed = fixDateString(c.endDate);
      const parsed = fixed ? new Date(fixed) : null;
      if (parsed && !isNaN(parsed)) {
        console.log(`[${c._id}] endDate:   "${c.endDate}" → ${parsed.toISOString()}`);
        update.endDate = parsed;
      }
    }

    if (Object.keys(update).length > 0) {
      await col.updateOne({ _id: c._id }, { $set: update });
      fixed++;
      console.log(`  ✓ Saved\n`);
    }
  }

  console.log(`\nDone. Fixed ${fixed} / ${campaigns.length} campaigns.`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});

