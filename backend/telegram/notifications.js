// Notifications helpers for sending messages to users or broadcasting

export const sendJobNotification = async (bot, chatId, job) => {
  const text = `New job posted: *${job.title || 'Untitled'}*\n${job.company || ''}\n${job.location || ''}\n${job.url || ''}`;
  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
};

export const broadcastJob = async (bot, chatIds = [], job) => {
  for (const id of chatIds) {
    try {
      await sendJobNotification(bot, id, job);
    } catch (err) {
      console.warn('Failed to notify', id, err.message);
    }
  }
};
