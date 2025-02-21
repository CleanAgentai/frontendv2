import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Menu, Megaphone, DollarSign, Users, Cog, Send, Bot, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Agent {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const agents: Agent[] = [
  {
    id: 'marketing',
    title: 'Marketing Agent',
    icon: <Megaphone className="h-8 w-8" />,
    color: 'bg-purple-100 text-purple-600',
    description: 'Expert in digital marketing, SEO, and content strategy'
  },
  {
    id: 'sales',
    title: 'Sales Agent',
    icon: <DollarSign className="h-8 w-8" />,
    color: 'bg-blue-100 text-blue-600',
    description: 'Specializes in lead conversion and sales optimization'
  },
  {
    id: 'hiring',
    title: 'Hiring Agent',
    icon: <Users className="h-8 w-8" />,
    color: 'bg-green-100 text-green-600',
    description: 'Assists with recruitment and HR processes'
  },
  {
    id: 'operations',
    title: 'Operations Agent',
    icon: <Cog className="h-8 w-8" />,
    color: 'bg-orange-100 text-orange-600',
    description: 'Helps optimize business operations and workflows'
  }
];

export default function Chat() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<{ id: string; title: string; timestamp: string; agent: Agent }[]>([
    {
      id: '1',
      title: 'Discussion about Q3 marketing strategy',
      timestamp: '30 minutes ago',
      agent: agents[0] // Marketing Agent
    },
    {
      id: '2',
      title: 'Sales pipeline review and lead qualification',
      timestamp: 'about 1 hour ago',
      agent: agents[1] // Sales Agent
    }
  ]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedAgent) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // Simulate agent response
    try {
      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `This is a simulated response from the ${selectedAgent.title}. In the actual implementation, this would be replaced with the AI agent's response.`,
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, agentResponse]);
        
        // Add to chat history if this is the first message
        if (messages.length === 0) {
          const newChat = {
            id: Date.now().toString(),
            title: inputMessage.slice(0, 30) + '...',
            timestamp: 'Just now',
            agent: selectedAgent
          };
          setChatHistory(prev => [newChat, ...prev]);
        }
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    }
  };

  const startNewChat = () => {
    setSelectedAgent(null);
    setMessages([]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredHistory = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadChat = (chat: typeof chatHistory[0]) => {
    setSelectedAgent(chat.agent);
    // Here you would typically load the chat messages for this conversation
    setMessages([
      {
        id: '1',
        role: 'user',
        content: 'Previous message would be loaded here',
        timestamp: new Date()
      }
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex relative">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={startNewChat}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search conversations..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-4">
          {filteredHistory.map((chat) => (
            <button
              key={chat.id}
              onClick={() => loadChat(chat)}
              className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer mb-2 text-left"
            >
              <div className={`p-2 rounded-lg ${chat.agent.color} mr-3`}>
                {chat.agent.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{chat.title}</p>
                <p className="text-sm text-gray-500">{chat.timestamp}</p>
            </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {selectedAgent ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${selectedAgent.color} mr-3`}>
                  {selectedAgent.icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedAgent.title}</h2>
                  <p className="text-sm text-gray-600">{selectedAgent.description}</p>
                </div>
              </div>
              <button
                onClick={startNewChat}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close chat"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
        </div>
        
            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
            <input
              type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
              placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
                  disabled={!inputMessage.trim()}
                  className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          // Agent Selection
          <div className="max-w-3xl mx-auto w-full p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Choose an Agent to Start Chat</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <div className={`p-4 rounded-full mb-4 ${agent.color}`}>
                    {agent.icon}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{agent.title}</h3>
                  <p className="text-gray-600 text-sm">{agent.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings Button and Panel */}
      <div className="absolute top-8 right-8">
        <button 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Settings"
        >
          <Menu className="h-6 w-6 text-gray-500" />
        </button>
        
        {isSettingsOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
            <button
              onClick={() => {/* Implement settings action */}}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Chat Settings
            </button>
            <button
              onClick={() => {/* Implement clear history */}}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Clear History
            </button>
            <button
              onClick={() => {/* Implement export chat */}}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Export Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 