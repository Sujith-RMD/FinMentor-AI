import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Content } from '@google/genai';
import { MessageRole, type ChatMessage as Message, AnalysisMode } from '../types';
import * as geminiService from '../services/geminiService';
import { INITIAL_CHAT_MESSAGE } from '../constants';
import ChatMessage from './ChatMessage';
import { Send, Loader, RefreshCw } from './Icons';

interface ChatProps {
  theme: 'dark' | 'light';
}

const Chat: React.FC<ChatProps> = ({ theme }) => {
  const [input, setInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Message[]>([INITIAL_CHAT_MESSAGE]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>(AnalysisMode.STANDARD);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatHistory, isLoading]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const queryText = input.trim();
    setInput('');
    setIsLoading(true);
    setChatHistory(prev => [...prev, { role: MessageRole.USER, text: queryText, timestamp: new Date() }]);

    const recentHistory = chatHistory
      .slice(-5)
      .map((msg): Content => ({ role: msg.role, parts: [{ text: msg.text }] }));
      
    const apiHistory: Content[] = [...recentHistory, { role: "user", parts: [{ text: queryText }] }];
    
    let responseText = '';
    switch (analysisMode) {
      case AnalysisMode.DEEP:
        responseText = await geminiService.generateDeepAnalysis(apiHistory);
        break;
      case AnalysisMode.STANDARD:
      default:
        responseText = await geminiService.generateStandardResponse(apiHistory);
        break;
    }
    
    const botMessage: Message = {
      role: MessageRole.MODEL,
      text: responseText,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, botMessage]);
    setIsLoading(false);
  }, [input, isLoading, chatHistory, analysisMode]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleStartOver = () => {
    setChatHistory([INITIAL_CHAT_MESSAGE]);
    setInput('');
  };

  const handleGetMarketUpdate = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setChatHistory(prev => [...prev, {role: MessageRole.USER, text: "Give me the latest market update.", timestamp: new Date()}]);
    const prompt = `Act as FinMentor AI. Use your search tool to find the top 3-5 Indian financial market news stories from today. Summarize them concisely for a retail investor. For each story, provide: a **Headline**, a **Brief Summary**, and **"Why it matters"**. Format as plain text with markdown. Start with: "**Here is your Indian Market Update for today:**"`;
    
    const responseText = await geminiService.generateStandardResponse([{ role: "user", parts: [{ text: prompt }] }]);
    const botMessage: Message = { role: MessageRole.MODEL, text: responseText, timestamp: new Date() };
    setChatHistory(prev => [...prev, botMessage]);
    setIsLoading(false);
  }, [isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full max-h-full">
      <header className={`flex items-center justify-between p-4 dark:bg-gray-800 dark:border-b dark:border-gray-700 dark:text-white bg-white/80 backdrop-blur-md border-b border-gray-200 text-gray-800`}>
        <div className="flex-1">
          <h3 className="font-semibold dark:text-emerald-400 text-gray-800">AI Chat</h3>
          <p className="text-xs dark:text-gray-400 text-gray-500">Ask about investing, savings, or your goals!</p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleGetMarketUpdate} disabled={isLoading} className="hidden sm:flex items-center gap-2 text-sm px-3 py-1.5 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50">
            <span className="text-base">✨</span> Market Update
          </button>
          <button onClick={handleStartOver} disabled={isLoading} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50">
            <RefreshCw size={14} /> New Chat
          </button>
        </div>
      </header>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {chatHistory.map((msg, index) => (
          <ChatMessage key={index} message={msg} theme={theme} />
        ))}
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader className="animate-spin" size={20} />
              <span>FinMentor is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 dark:bg-gray-800 dark:border-t dark:border-gray-700 bg-white/80 backdrop-blur-md border-t border-gray-200">
        <div className="flex justify-center mb-2">
            <div className="flex items-center text-xs sm:text-sm p-1 rounded-full dark:bg-gray-900 bg-gray-200">
                {Object.values(AnalysisMode).map(mode => (
                    <button 
                        key={mode} 
                        onClick={() => setAnalysisMode(mode)}
                        className={`px-3 py-1 rounded-full transition-colors ${analysisMode === mode ? 'bg-emerald-600 text-white' : 'dark:text-gray-300 text-gray-600'}`}
                    >
                        {mode}
                    </button>
                ))}
            </div>
        </div>
        <div className="flex items-center gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="💬 Ask a financial question..." className="flex-1 px-5 py-3 rounded-full dark:bg-gray-900 dark:text-white dark:border dark:border-gray-600 bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" disabled={isLoading}/>
          <button onClick={handleSend} disabled={!input.trim() || isLoading} className={`p-3 rounded-full text-white transition-all duration-300 ${!input.trim() || isLoading ? 'bg-gray-400' : 'bg-gradient-to-br from-emerald-500 to-green-600 hover:shadow-lg hover:scale-105'}`}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;