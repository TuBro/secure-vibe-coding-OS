# Telegram Voice Notes Bridge Setup

This guide will help you set up the Telegram bot that transcribes voice notes and saves them to Convex.

## Features

- 🎤 Listens for voice messages on Telegram
- 🤖 Transcribes audio using OpenAI Whisper
- 💾 Saves transcriptions to Convex database
- ✅ Sends confirmation with transcription text

## Prerequisites

1. Telegram account
2. OpenAI API key
3. Running Convex project

## Step 1: Create Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the prompts:
   - Choose a name for your bot (e.g., "My Voice Notes Bot")
   - Choose a username (must end in 'bot', e.g., "my_voice_notes_bot")
4. BotFather will give you a **bot token** that looks like:
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
5. Copy this token

## Step 2: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Copy the API key (starts with `sk-`)
5. **Important:** Add credits to your OpenAI account to use Whisper API

## Step 3: Configure Environment Variables

Edit your `.env.local` file and add:

```bash
# Telegram Bot Token (from Step 1)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# OpenAI API Key (from Step 2)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## Step 4: Deploy Convex Schema

The bot requires the notes schema to be deployed. Run:

```bash
npx convex dev
```

This will deploy the new `notes` table to Convex.

## Step 5: Start the Telegram Bot

Run the bot with:

```bash
node telegram-bridge.mjs
```

You should see:
```
🤖 Starting Telegram bot...
✅ Telegram bot is running!
Send voice notes to transcribe and save.
```

## Step 6: Test the Bot

1. Open Telegram and search for your bot username
2. Send `/start` to begin
3. Tap and hold the microphone button
4. Record a voice message
5. Send it to the bot
6. The bot will:
   - Send "🎤 Processing your voice note..."
   - Transcribe the audio
   - Save it to Convex
   - Reply with "✅ Note saved!" and show the transcription

## Bot Commands

- `/start` - Welcome message with instructions
- `/help` - Show help information

## View Your Notes

You can query notes from Convex:

```javascript
// Get notes by Telegram user ID
const notes = await convex.query(api.notes.getNotesByTelegramUser, {
  telegramUserId: "YOUR_TELEGRAM_USER_ID",
  limit: 10
});

// Get all recent notes
const recentNotes = await convex.query(api.notes.getRecentNotes, {
  limit: 50
});
```

## Troubleshooting

### Bot doesn't respond
- Check that `TELEGRAM_BOT_TOKEN` is correct
- Verify the bot is running (`node telegram-bridge.mjs`)
- Check console for error messages

### Transcription fails
- Verify `OPENAI_API_KEY` is valid
- Ensure you have credits in your OpenAI account
- Check that the audio file downloaded correctly

### Can't save to Convex
- Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Ensure Convex schema is deployed (`npx convex dev`)
- Check Convex dashboard for errors

## Production Deployment

For production, consider:

1. **Process Manager**: Use PM2 or similar to keep the bot running
   ```bash
   pm2 start telegram-bridge.mjs --name telegram-bot
   ```

2. **Error Monitoring**: Add error tracking (Sentry, etc.)

3. **Rate Limiting**: Add rate limits to prevent abuse

4. **User Authentication**: Link Telegram users to your app's users

5. **Multi-language Support**: Remove or modify the `language: "en"` parameter in Whisper API call for auto-detection

## Cost Considerations

- **OpenAI Whisper**: $0.006 per minute of audio
- **Telegram API**: Free
- **Convex**: Free tier includes 1M writes/month

## Security Notes

- Keep your bot token secret
- Never commit `.env.local` to git
- Consider adding user authentication
- Validate audio file sizes to prevent abuse
- Monitor API usage and costs

## Next Steps

- Add user authentication to link Telegram users with app users
- Create a web interface to view and search notes
- Add support for other message types (text, documents)
- Implement note editing and deletion via Telegram commands
- Add search functionality within Telegram
