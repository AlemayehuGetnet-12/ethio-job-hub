// centralize command handling so other services can reuse it

export const handleStart = async (bot, msg) => {
  const chatId = msg.chat.id;
  const name = msg.from?.first_name || 'there';
  const text = `Hello ${name}! Welcome to EthioJobs Connect.\nAvailable commands:\n/jobs - list jobs\n/health - backend status\n/web - open jobs page\n/myid - show your chat id`;
  await bot.sendMessage(chatId, text);
};

export const handleHealth = async (bot, msg, fetchHealth) => {
  const chatId = msg.chat.id;
  try {
    const res = await fetchHealth();
    await bot.sendMessage(chatId, `Backend status: ${JSON.stringify(res)}`);
  } catch (err) {
    await bot.sendMessage(chatId, `Backend unreachable: ${err.message}`);
  }
};

export const handleJobs = async (bot, msg, fetchJobs, limit = 5) => {
  const chatId = msg.chat.id;
  try {
    const jobs = await fetchJobs(limit);
    if (!jobs || jobs.length === 0) {
      await bot.sendMessage(chatId, 'No jobs found.');
      return;
    }
    const preview = jobs.slice(0, limit).map((j, i) => `${i + 1}. ${j.title || 'Untitled'}${j.company ? ' - ' + j.company : ''}`).join('\n');
    await bot.sendMessage(chatId, `Latest jobs:\n${preview}`);
  } catch (err) {
    await bot.sendMessage(chatId, `Failed to fetch jobs: ${err.message}`);
  }
};

export const handleMyId = async (bot, msg) => {
  const chatId = msg.chat.id;
  const user = msg.from || {};
  const name = user.first_name || user.username || 'there';
  const text = `Hello ${name}! Your Telegram chat id is:\n${chatId}\n\nCopy this numeric id into the EthioJobs dashboard → Alerts & integrations → Telegram subscriptions to receive job alerts.`;
  try {
    await bot.sendMessage(chatId, text);
  } catch (err) {
    console.error('Failed to send myid response:', err.message || err);
  }
};
