import React from 'react';
import { type ChatMessage as Message, MessageRole } from '../types';
import { User, Bot } from './Icons';
import MarkdownRenderer from '../utils/markdownParser';

interface ChatMessageProps {
  message: Message;
  theme: 'dark' | 'light';
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, theme }) => {
  const { role, text, image, timestamp } = message;
  const isUser = role === MessageRole.USER;
  
  const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3/4 p-4 rounded-xl shadow-lg animate-fade-in ${isUser 
          ? 'bg-emerald-700 text-white rounded-br-none' 
          : `${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'} rounded-tl-none border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`
        }`}
      >
        <div className="flex items-center mb-2">
          {isUser ? <User size={16} className="mr-2" /> : <Bot size={16} className="mr-2 text-emerald-400" />}
          <strong className={`text-sm ${isUser ? 'text-white' : 'dark:text-emerald-400 text-gray-800'}`}>{isUser ? 'You' : 'FinMentor AI'}</strong>
        </div>

        {image && (
          <img 
            src={image} 
            alt="Generated Visualization" 
            className="my-3 max-w-full h-auto rounded-lg shadow-md"
            style={{ maxHeight: '40vh', objectFit: 'contain' }}
          />
        )}
        
        {text && (
          <div className="text-base leading-relaxed">
            <MarkdownRenderer text={text} />
          </div>
        )}
        <span className={`block text-xs mt-2 text-right ${isUser ? 'text-emerald-200' : 'dark:text-gray-400 text-gray-500'}`}>{timeString}</span>
      </div>
    </div>
  );
};

export default ChatMessage;
