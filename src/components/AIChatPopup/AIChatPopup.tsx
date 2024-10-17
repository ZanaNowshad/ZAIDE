import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface AIChatPopupProps {
  onClose: () => void;
}

interface Message {
  text: string;
  isUser: boolean;
}

const AIChatPopup: React.FC<AIChatPopupProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const userMessage: Message = { text: input, isUser: true };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');

      // Simulate AI response
      const aiResponse = await getAIResponse(input);
      const aiMessage: Message = { text: aiResponse, isUser: false };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    }
  };

  const getAIResponse = async (userInput: string): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple response logic (replace with actual AI integration)
    if (userInput.toLowerCase().includes('hello')) {
      return "Hello! How can I assist you with your coding today?";
    } else if (userInput.toLowerCase().includes('help')) {
      return "I'm here to help! What specific coding question do you have?";
    } else {
      return "I understand you're asking about coding. Could you please provide more details or specify your question?";
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-lg flex flex-col">
      <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <button onClick={onClose} className="text-white">
          <X size={20} />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.isUser ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${msg.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Ask the AI assistant..."
        />
      </form>
    </div>
  );
};

export default AIChatPopup;