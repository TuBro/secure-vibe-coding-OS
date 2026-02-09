// Telegram Bridge for Secure Vibe Coding OS
// Listens for voice notes, transcribes them with OpenAI Whisper, saves to Convex
// NOW WITH VOICE RESPONSE (Te Ra talks back!)

import { Bot } from "grammy";
import OpenAI from "openai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { InputFile } from "grammy";

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
      language: "en",
    });

    return transcription.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}

/**
 * Generate Te Ra's voice response using OpenAI TTS
 */
async function generateVoiceResponse(text) {
  try {
    const mp3Path = path.join(TEMP_DIR, `response_${Date.now()}.mp3`);
    
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "shimmer", // shimmer is sharper and less "echo" than nova , clear, confident female voice
      input: text,
      speed: 1.5, // Slightly faster for that sharp, no-nonsense vibe
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(mp3Path, buffer);
    
    return mp3Path;
  } catch (error) {
    console.error("Error generating voice response:", error);
    throw error;
  }
}

/**
 * Generate Te Ra's witty response text
 */
function generateTeRaResponse(transcription) {
  const responses = [
    `Copy that, Boss. "${transcription}" is logged. What's next?`,
    `Got it. "${transcription}" saved to the system. Anything else?`,
    `Noted. "${transcription}" is in the books. Keep 'em coming.`,
    `Locked in. "${transcription}" captured. Site's looking sharp.`,
    `Chur. "${transcription}" saved. Foundation's solid, Boss.`,
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
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

  let voiceFilePath = null;
  let responseAudioPath = null;

  try {
    // Download the voice file
    voiceFilePath = await downloadTelegramFile(voice.file_id);
    console.log(`Downloaded file to ${voiceFilePath}`);

    // Transcribe with Whisper
    console.log("Transcribing with OpenAI Whisper...");
    const transcription = await transcribeAudio(voiceFilePath);
    console.log(`Transcription: ${transcription}`);

    // Save to Convex
    console.log("Saving to Convex...");
    const noteId = await saveNoteToConvex({
      text: transcription,
      telegramUserId: userId,
      telegramUsername: username,
      audioFileId: voice.file_id,
      audioDuration: voice.duration,
      timestamp: Date.now(),
    });

    // Generate Te Ra's response text
    const responseText = generateTeRaResponse(transcription);
    
    // Generate voice response
    console.log("Generating Te Ra's voice response...");
    responseAudioPath = await generateVoiceResponse(responseText);

    // Send voice response back to user
    await ctx.replyWithVoice(new InputFile(responseAudioPath));

    console.log(`Successfully processed note ${noteId}`);
  } catch (error) {
    console.error("Error processing voice note:", error);
    await ctx.reply(
      `❌ Sorry Boss, hit a snag. Error: ${error.message}`
    );
  } finally {
    // Clean up temp files
    if (voiceFilePath) cleanupFile(voiceFilePath);
    if (responseAudioPath) cleanupFile(responseAudioPath);
  }
});

// Handle /start command
bot.command("start", (ctx) => {
  ctx.reply(
    "Kia ora, Boss. Te Ra here. 🗣️\n\n" +
    "Send me a voice note—I'll transcribe it, log it, and talk back.\n\n" +
    "Sharp. Secure. No fluff."
  );
});

// Handle /help command
bot.command("help", (ctx) => {
  ctx.reply(
    "🎤 How it works:\n\n" +
    "1. Record your site note\n" +
    "2. Send it to me\n" +
    "3. I transcribe, save, and reply with voice\n\n" +
    "All logged in Convex. Let's build."
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
    console.log("✅ Te Ra is live and talking!");
    console.log("Send voice notes—she'll talk back.");
  },
});