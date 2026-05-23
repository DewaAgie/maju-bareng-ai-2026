import { useState, useRef, useEffect } from 'react';
import { sendChatMessageApi } from '../api/chatbot.api';
import { MessageCircle, X, Send, Trash2, Bot } from 'lucide-react';

const STARTER_PROMPTS = [
  'What are some tips for intermittent fasting?',
  'How much water should I drink on workout days?',
  'What foods help with muscle recovery?',
  'How do I start a 16:8 fasting schedule?',
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!hasOpened) setHasOpened(true);
  };

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', text: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await sendChatMessageApi({ message: text.trim(), history });
      const botReply = res.data.data.reply;
      const botMessage = { role: 'bot', text: botReply, timestamp: new Date() };
      setMessages((prev) => [...prev, botMessage]);

      setHistory((prev) => [
        ...prev,
        { role: 'user', parts: [{ text: text.trim() }] },
        { role: 'model', parts: [{ text: botReply }] },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: "Sorry, I'm having trouble connecting. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setHistory([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Panel */}
      <div className={`
        fixed bottom-20 right-6 z-50 w-[380px] h-[520px] 
        max-sm:bottom-0 max-sm:right-0 max-sm:w-full max-sm:h-full max-sm:rounded-none
        bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl shadow-black/50
        flex flex-col overflow-hidden
        transform transition-all duration-300 origin-bottom-right
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
      `}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Bot size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">CoreBot</h3>
            <p className="text-[10px] text-white/70">Wellness Assistant</p>
          </div>
          <button onClick={handleClear} className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors" title="Clear chat">
            <Trash2 size={14} />
          </button>
          <button onClick={handleToggle} className="p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700/50 shrink-0">
          <p className="text-[10px] text-gray-400 text-center">
            CoreBot answers wellness & fasting questions only. Not a substitute for medical advice.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-4">
                <Bot size={28} className="text-indigo-400" />
              </div>
              <h4 className="text-sm font-medium text-gray-300 mb-1">Welcome to CoreBot!</h4>
              <p className="text-xs text-gray-500 mb-4">Ask me about wellness, fitness, or fasting tips.</p>
              <div className="space-y-2 w-full">
                {STARTER_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-xs text-gray-300 hover:bg-gray-800 hover:border-indigo-500/30 transition-all duration-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {msg.role === 'bot' && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 mt-1">
                  <Bot size={12} className="text-indigo-400" />
                </div>
              )}
              <div className={`
                max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                }
              `}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 animate-fade-in">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 mt-1">
                <Bot size={12} className="text-indigo-400" />
              </div>
              <div className="bg-gray-800 rounded-xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-gray-400" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-gray-400" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-gray-400" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-gray-700/50 shrink-0">
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about wellness..."
              disabled={isLoading}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder:text-gray-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 disabled:opacity-50 transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={handleToggle}
        className={`
          fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full
          bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/25
          hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200
        `}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!hasOpened && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-pink-500 animate-pulse" />
        )}
      </button>
    </>
  );
}
