import dotenv from 'dotenv';
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

import TelegramBot from 'node-telegram-bot-api';

// Export a mutable binding for the running bot instance so other modules can send messages
export let botInstance = null;

export const registerCommands = async (bot) => {
  const commands = [
    { command: 'start', description: 'Show welcome message' },
    { command: 'health', description: 'Check backend connectivity' },
    { command: 'jobs', description: 'List recent jobs' },
    { command: 'web', description: 'Open jobs page' },
    { command: 'myid', description: 'Get your Telegram chat id' },
  ];

  if (typeof bot.setMyCommands === 'function') {
    await bot.setMyCommands(commands).catch(() => {});
  }
};

async function fetchBackend(path) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(`Request failed ${res.status} ${res.statusText}${text ? ': ' + text : ''}`);
  }
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function startBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('TELEGRAM_BOT_TOKEN is not set; bot will not start.');
    return null;
  }

  const bot = new TelegramBot(token, { polling: true });
  // expose the running bot instance for other modules to use
  botInstance = bot;
  await registerCommands(bot);

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from?.first_name || 'there';
    const text = `Hello ${name}! Welcome to EthioJobs Connect.\nAvailable commands:\n/jobs - list jobs\n/health - backend status\n/web - open jobs page`;
    await bot.sendMessage(chatId, text);
  });

  bot.onText(/\/health/, async (msg) => {
    const chatId = msg.chat.id;
    try {
      const data = await fetchBackend('/health');
      await bot.sendMessage(chatId, `Backend status: ${JSON.stringify(data)}`);
    } catch (err) {
      await bot.sendMessage(chatId, `Backend unreachable: ${err.message}`);
    }
  });

  bot.onText(/\/jobs(\s+(\d+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const limit = match && match[2] ? Number(match[2]) : 5;
    try {
      const data = await fetchBackend(`/api/jobs?limit=${limit}`);
      const jobs = Array.isArray(data?.jobs) ? data.jobs : (Array.isArray(data) ? data : []);
      if (!jobs || jobs.length === 0) {
        await bot.sendMessage(chatId, 'No jobs found.');
        return;
      }
      const preview = jobs.slice(0, limit).map((j, i) => `${i + 1}. ${j.title || 'Untitled'}${j.company ? ' - ' + j.company : ''}`).join('\n');
      await bot.sendMessage(chatId, `Latest jobs:\n${preview}`);
    } catch (err) {
      await bot.sendMessage(chatId, `Failed to fetch jobs: ${err.message}`);
    }
  });

  // Handle /link <code> pairing command
  bot.onText(/\/link\s+(\S+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const code = match && match[1] ? match[1].trim() : null;
    if (!code) {
      await bot.sendMessage(chatId, 'Usage: /link <code> — get a code from the EthioJobs dashboard and send it here to pair your account.');
      return;
    }

    try {
      const PairingCode = (await import('../models/PairingCode.js')).default;
      const TelegramSubscription = (await import('../models/TelegramSubscription.js')).default;
      const pc = await PairingCode.findOne({ code, used: false, expiresAt: { $gt: new Date() } });
      if (!pc) {
        await bot.sendMessage(chatId, 'Invalid or expired pairing code. Please generate a new code in your EthioJobs dashboard.');
        return;
      }

      // create or update subscription for the linked user
      await TelegramSubscription.findOneAndUpdate(
        { chatId: String(chatId) },
        { chatId: String(chatId), user: pc.user, active: true },
        { upsert: true, new: true }
      );

      pc.used = true;
      pc.usedAt = new Date();
      pc.linkedChatId = String(chatId);
      await pc.save();

      await bot.sendMessage(chatId, 'Success! Your Telegram chat has been linked to your EthioJobs account. You will now receive job alerts matching your subscriptions.');

    } catch (err) {
      console.error('Failed to process /link:', err);
      await bot.sendMessage(chatId, 'An error occurred while processing your pairing request. Please try again later.');
    }
  });

  // Handle deep link via /start link_<code>
  bot.onText(/\/start\s+(\S+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const payload = match && match[1] ? match[1].trim() : null;
    if (!payload) return; // nothing to do

    if (payload.startsWith('link_')) {
      const code = payload.slice(5);
      try {
        const PairingCode = (await import('../models/PairingCode.js')).default;
        const TelegramSubscription = (await import('../models/TelegramSubscription.js')).default;
        const pc = await PairingCode.findOne({ code, used: false, expiresAt: { $gt: new Date() } });
        if (!pc) {
          await bot.sendMessage(chatId, 'Invalid or expired pairing code in start link. Please generate a new code in your EthioJobs dashboard.');
          return;
        }

        await TelegramSubscription.findOneAndUpdate(
          { chatId: String(chatId) },
          { chatId: String(chatId), user: pc.user, active: true },
          { upsert: true, new: true }
        );

        pc.used = true;
        pc.usedAt = new Date();
        pc.linkedChatId = String(chatId);
        await pc.save();

        await bot.sendMessage(chatId, 'Success! Your Telegram chat has been linked via deep link to your EthioJobs account.');
      } catch (err) {
        console.error('Failed to process deep link pairing:', err);
        await bot.sendMessage(chatId, 'An error occurred while processing your pairing request. Please try again later.');
      }
    }
  });

  bot.onText(/\/web/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, `Open the shared jobs page: ${FRONTEND_URL}/jobs`);
  });

  // /myid - reply with the numeric chat id and brief instructions
  bot.onText(/\/myid/, async (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from?.first_name || msg.from?.username || 'there';
    const text = `Hello ${name}! Your Telegram chat id is:\n${chatId}\n\nCopy this id into EthioJobs dashboard → Alerts & integrations → Telegram subscriptions to receive job alerts.`;
    try {
      await bot.sendMessage(chatId, text);
    } catch (err) {
      console.error('Failed to send /myid response:', err.message || err);
    }
  });

  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'Send /start to see available commands.');
  });

  console.log('Telegram bot started via backend/telegram/bot.js');
  return bot;
}
