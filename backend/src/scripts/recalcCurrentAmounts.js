/**
 * Backfill Script: Recalculate currentAmount for all campaigns
 * by summing all confirmed Donation documents.
 *
 * - Handles donations stored with amount in Wei (large integers)
 * - Handles legacy donations stored with amount as ETH float strings
 * - Always writes currentAmount back as a Wei string (canonical standard)
 * - Safe to run multiple times (idempotent)
 *
 * Run with:
 *   node --experimental-vm-modules src/scripts/recalcCurrentAmounts.js
 *   OR add to package.json: "recalc": "node src/scripts/recalcCurrentAmounts.js"
 */

import mongoose from 'mongoose';
import { ethers } from 'ethers';
import 'dotenv/config';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse any stored amount (Wei string or ETH float string) → BigInt Wei */
function parseToWei(value) {
  if (value === undefined || value === null) return 0n;
  const str = value.toString().trim();
  if (!str || str === '0') return 0n;
  if (str.includes('.')) {
    // ETH float → Wei
    return ethers.parseEther(str);
  }
  return BigInt(str);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function recalc() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  const db = mongoose.connection.db;
  const donations = db.collection('donations');
  const campaigns = db.collection('campaigns');

  // 1. Load all confirmed donations
  const confirmedDonations = await donations
    .find({ status: 'confirmed' })
    .toArray();

  console.log(`📦 Found ${confirmedDonations.length} confirmed donation(s)\n`);

  if (confirmedDonations.length === 0) {
    console.log('Nothing to do.');
    await mongoose.disconnect();
    return;
  }

  // 2. Group and sum Wei per campaign
  const totalsMap = new Map(); // campaignId (string) → BigInt Wei

  for (const donation of confirmedDonations) {
    const key = donation.campaignId?.toString();
    if (!key) continue;

    let amountWei;
    try {
      amountWei = parseToWei(donation.amount);
    } catch (e) {
      console.warn(`  ⚠️  Could not parse amount "${donation.amount}" for donation ${donation._id} — skipping`);
      continue;
    }

    totalsMap.set(key, (totalsMap.get(key) ?? 0n) + amountWei);
  }

  console.log(`🗂️  Campaigns with donations: ${totalsMap.size}\n`);

  // 3. Update each campaign
  let updated = 0;
  let skipped = 0;

  for (const [campaignIdStr, totalWei] of totalsMap) {
    let campaignObjId;
    try {
      campaignObjId = new mongoose.Types.ObjectId(campaignIdStr);
    } catch {
      console.warn(`  ⚠️  Invalid campaignId "${campaignIdStr}" — skipping`);
      skipped++;
      continue;
    }

    const campaign = await campaigns.findOne({ _id: campaignObjId });
    if (!campaign) {
      console.warn(`  ⚠️  Campaign ${campaignIdStr} not found in DB — skipping`);
      skipped++;
      continue;
    }

    const oldAmount = campaign.currentAmount ?? '0';
    const newAmountStr = totalWei.toString(); // Wei string

    console.log(`  Campaign: ${campaign.title || campaignIdStr}`);
    console.log(`    Old currentAmount : ${oldAmount}`);
    console.log(`    New currentAmount : ${newAmountStr}  (${ethers.formatEther(totalWei)} ETH)`);

    // Also check if goal is reached and update status if needed
    let statusUpdate = {};
    try {
      const goalWei = parseToWei(campaign.totalGoalAmount);
      if (goalWei > 0n && totalWei >= goalWei && campaign.status === 'ACTIVE') {
        statusUpdate.status = 'COMPLETED';
        console.log(`    Status            : ACTIVE → COMPLETED (goal reached)`);
      }
    } catch (e) {
      console.warn(`    ⚠️  Could not compare goal: ${e.message}`);
    }

    await campaigns.updateOne(
      { _id: campaignObjId },
      { $set: { currentAmount: newAmountStr, ...statusUpdate } }
    );

    console.log(`    ✓ Saved\n`);
    updated++;
  }

  // 4. Reset campaigns with no confirmed donations (safety check)
  const allCampaigns = await campaigns.find({}).toArray();
  let reset = 0;
  for (const c of allCampaigns) {
    const key = c._id.toString();
    if (!totalsMap.has(key)) {
      const current = (c.currentAmount ?? '0').toString();
      // Only reset if it's non-zero (avoid unnecessary writes)
      if (current !== '0' && current !== '') {
        console.log(`  Campaign "${c.title || key}": no confirmed donations, resetting currentAmount to "0"`);
        await campaigns.updateOne({ _id: c._id }, { $set: { currentAmount: '0' } });
        reset++;
      }
    }
  }

  console.log('─'.repeat(60));
  console.log(`✅ Done.`);
  console.log(`   Updated : ${updated} campaign(s)`);
  console.log(`   Reset   : ${reset} campaign(s) with no confirmed donations`);
  console.log(`   Skipped : ${skipped} (bad data)`);

  await mongoose.disconnect();
}

recalc().catch(err => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
