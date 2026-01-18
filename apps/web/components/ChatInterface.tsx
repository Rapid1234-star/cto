'use client';

import { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { ChatMessage } from 'shared-types';

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    // Add user message to UI
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      session_id: sessionId || '',
      user_id: '',
      role: 'user',
      content: userMessage,
      embedding_id: null,
      created_at: new Date().toISOString(),
    }]);

    try {
      let assistantMessage = '';
      
      // Add placeholder for assistant message
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        session_id: sessionId || '',
        user_id: '',
        role: 'assistant',
        content: '',
        embedding_id: null,
        created_at: new Date().toISOString(),
      }]);

      // Stream the response
      await apiClient.streamMessage(userMessage, sessionId, (chunk) => {
        assistantMessage += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = assistantMessage;
          return newMessages;
        });
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        session_id: sessionId || '',
        user_id: '',
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        embedding_id: null,
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-cosmic-bg">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-2xl mb-4">Welcome to ThinkCompanion</p>
            <p>Start a conversation to begin your journey.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-cosmic-primary text-white'
                    : 'bg-cosmic-surface border border-cosmic-border text-gray-100'
                }`}
              >
                {message.content || (
                  <span className="text-gray-400 animate-pulse">Thinking...</span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-cosmic-border p-6">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-cosmic-surface border border-cosmic-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cosmic-primary"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-cosmic-primary hover:bg-cosmic-secondary rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
