import { Buffer } from 'buffer';

export const encodeBase62 = (str: string) => {
  return Buffer.from(str).toString('base64');
};

export const decodeBase62 = (str: string) => {
  return Buffer.from(str, 'base64').toString('utf8');
};

export const getInviteUrl = (userId: string, chatUsername: string) => {
  const startAppCode = encodeBase62(`${userId}_${chatUsername}`);
  const message = `Hi, Join ${chatUsername} squad.`;
  const encodedMessage = encodeURIComponent(message.trim());
  return `https://t.me/share/url?url=${encodeURIComponent(
    `https://t.me/${
      import.meta.env.VITE_TELEGRAM_BOT_USERNAME
    }/play?startapp=${startAppCode}`
  )}&text=${encodedMessage}`;
};
