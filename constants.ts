import { MessageRole, type ChatMessage } from './types';

export const INITIAL_CHAT_MESSAGE: ChatMessage = {
  role: MessageRole.MODEL,
  text: `Welcome to **FinMentor AI**.\n\nI'm an AI financial analyst for the **Indian market (NSE/BSE)**. Use the "Analysis Mode" selector below to switch between standard search-powered responses or deep analysis for complex questions.`,
  timestamp: new Date(),
};

export const GEMINI_FLASH_MODEL = 'gemini-2.5-flash';
export const GEMINI_PRO_MODEL = 'gemini-2.5-pro';
export const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';