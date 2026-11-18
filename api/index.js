import mongoose from "mongoose";
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected && mongoose.connection.readyState !== 1) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
}
