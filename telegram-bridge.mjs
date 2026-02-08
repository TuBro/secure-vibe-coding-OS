// Telegram Bridge for Secure Vibe Coding OS
// Listens for voice notes, transcribes them with OpenAI Whisper, saves to Convex

import { Bot } from "grammy";
import OpenAI from "openai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Initialize clients
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Create temp directory for audio files
const TEMP_DIR = path.join(__dirname, "temp");
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Download file from Telegram servers
 */
async function downloadTelegramFile(fileId) {
  try {
    const file = await bot.api.getFile(fileId);
    const filePath = file.file_path;
    const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;

    const localPath = path.join(TEMP_DIR, `${fileId}.ogg`);
    const fileStream = fs.createWriteStream(localPath);

    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        response.pipe(fileStream);
        fileStream.on("finish", () => {
          fileStream.close();
          resolve(localPath);
        });
      }).on("error", (err) => {
        fs.unlink(localPath, () => {});
        reject(err);
      });
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

/**
 * Transcribe audio using OpenAI Whisper
 */
async function transcribeAudio(filePath) {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
      language: "en", // Change this if needed, or remove for auto-detection
    });

    return transcription.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}

/**
 * Save note to Convex
 */
async function saveNoteToConvex(noteData) {
  try {
    const noteId = await convex.mutation(api.notes.saveNote, noteData);
    return noteId;
  } catch (error) {
    console.error("Error saving to Convex:", error);
    throw error;
  }
}

/**
 * Clean up temporary file
 */
function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error cleaning up file:", error);
  }
}

// Handle voice messages
bot.on("message:voice", async (ctx) => {
  const voice = ctx.message.voice;
  const userId = ctx.from.id.toString();
  const username = ctx.from.username;

  console.log(`Received voice note from ${username || userId}`);

  try {
    // Send processing message
    await ctx.reply("🎤 Processing your voice note...");

    // Download the voice file
    const filePath = await downloadTelegramFile(voice.file_id);
    console.log(`Downloaded file to ${filePath}`);

    // Transcribe with Whisper
    console.log("Transcribing with OpenAI Whisper...");
    const transcription = await transcribeAudio(filePath);
    console.log(`Transcription: ${transcription}`);

    // Save to Convex
    console.log("Saving to Convex...");
    const noteId = await saveNoteToConvex({
      text: transcription,
      telegramUserId: userId,
      telegramUsername: username,
      audioFileId: voice.file_id,
      audioDuration: voice.duration,
    });

    // Clean up temp file
    cleanupFile(filePath);

    // Send success message with transcription
    await ctx.reply(
      `✅ Note saved!\n\n📝 Transcription:\n"${transcription}"\n\n🆔 Note ID: ${noteId}`
    );

    console.log(`Successfully processed note ${noteId}`);
  } catch (error) {
    console.error("Error processing voice note:", error);
    await ctx.reply(
      `❌ Sorry, I couldn't process your voice note. Error: ${error.message}`
    );
  }
});

// Handle /start command
bot.command("start", (ctx) => {
  ctx.reply(
    "👋 Welcome to Secure Vibe Coding OS Voice Notes!\n\n" +
    "Send me a voice message and I'll:\n" +
    "1. Transcribe it using AI\n" +
    "2. Save it to your notes\n\n" +
    "Just record and send!"
  );
});

// Handle /help command
bot.command("help", (ctx) => {
  ctx.reply(
    "🎤 How to use:\n\n" +
    "1. Tap and hold the microphone button\n" +
    "2. Record your voice note\n" +
    "3. Send it to me\n" +
    "4. I'll transcribe and save it automatically!\n\n" +
    "All your notes are saved securely in Convex."
  );
});

// Error handling
bot.catch((err) => {
  console.error("Bot error:", err);
});

// Start the bot
console.log("🤖 Starting Telegram bot...");
bot.start({
  onStart: () => {
    console.log("✅ Telegram bot is running!");
    console.log("Send voice notes to transcribe and save.");
  },
});
