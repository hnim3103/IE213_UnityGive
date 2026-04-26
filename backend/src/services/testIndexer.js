import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "../config/db.js";
import { initBlockchainListener } from "./blockchainService.js";

const testIndexer = async () => {
    try {
        console.log("Connecting to DB...");
        await connectDB();
        
        console.log("Initializing Indexer...");
        await initBlockchainListener();
        
        console.log("Indexer initialized. Press Ctrl+C to stop.");
        
        // Keep process alive to listen for events
        setInterval(() => {}, 1000);
        
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
};

testIndexer();
