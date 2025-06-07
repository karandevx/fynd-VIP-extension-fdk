import React, { useState, useRef, useEffect } from "react";

const Dashboard = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ai-analyst");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputMessage]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://asia-south1.workflow.boltic.app/35d18e55-a6ed-4b67-a841-6001219b35dd/get-mongodb-query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: userMessage.content,
          }),
          signal: AbortSignal.timeout(120000)
        }
      );
      
      const data = await response.json();

      const aiMessage = {
        type: "ai",
        content: data.reply || "I'm sorry, I couldn't process your request at the moment.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        type: "error",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content) => {
    // Handle code blocks and formatting
    return content.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />;
      return (
        <div key={index} className="mb-1 last:mb-0">
          {line}
        </div>
      );
    });
  };

  const clearChat = () => {
    setMessages([]);
  };

  const sidebarItems = [
    {
      id: "configure",
      label: "Configure",
      icon: "⚙️",
    },
    {
      id: "vips",
      label: "VIPs",
      icon: "👥",
    },
    {
      id: "campaigns",
      label: "Campaigns",
      icon: "⭐",
    },
    {
      id: "ai-analyst",
      label: "AI Analyst",
      icon: "🤖",
      active: true,
    },
  ];

  const exampleQuestions = [
    "Show me VIP customer trends this month",
    "What's the performance of our latest campaign?",
    "Find customers with highest engagement",
    "Analyze customer behavior patterns"
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl flex flex-col h-screen md:h-[90vh] bg-white/80 shadow-xl rounded-2xl border border-gray-100 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/90 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-bold text-lg text-gray-800 tracking-tight">AI Analyst</span>
          </div>
          <button
            onClick={clearChat}
            className="text-xs px-3 py-1 rounded-md bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-700 font-medium transition-all"
          >
            Clear chat
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-0 py-6 flex flex-col gap-0 scroll-smooth custom-scrollbar bg-gradient-to-b from-white/90 to-blue-50">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  AI Analyst at Your Service
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  I'm here to help you analyze your VIP customers, campaigns, and business data.<br />
                  Ask me anything or try one of the examples below.
                </p>
              </div>
              <div className="w-full space-y-3">
                <p className="text-sm font-medium text-gray-700 mb-3">Try asking:</p>
                {exampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-100">
                        <svg className="w-3 h-3 text-gray-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{question}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`w-full px-0 md:px-4 py-2 flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`w-full md:w-auto max-w-2xl flex items-end gap-2 animate-fade-in ${
                    message.type === "user"
                      ? "flex-row-reverse"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.type === "user" ? "bg-blue-600" : "bg-gradient-to-br from-blue-500 to-purple-600"} text-white text-lg shadow-sm`}>
                    {message.type === "user" ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <span>🤖</span>
                    )}
                  </div>
                  {/* Message Content */}
                  <div
                    className={`rounded-xl px-5 py-3 text-base leading-relaxed shadow-sm ${
                      message.type === "user"
                        ? "bg-blue-600 text-white rounded-br-2xl rounded-tr-2xl"
                        : message.type === "ai"
                        ? "bg-gray-50 text-gray-900 rounded-bl-2xl rounded-tl-2xl border border-gray-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                    style={{ maxWidth: '90vw', wordBreak: 'break-word' }}
                  >
                    {formatMessage(message.content)}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="w-full px-0 md:px-4 py-2 flex justify-start">
              <div className="w-full md:w-auto max-w-2xl flex items-end gap-2 animate-fade-in">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-sm">
                  <span>🤖</span>
                </div>
                <div className="rounded-xl px-5 py-3 bg-gray-50 text-gray-900 border border-gray-200 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                    <span className="ml-2 text-sm text-gray-500">AI is typing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="w-full px-2 md:px-4 py-4 bg-white/95 border-t border-gray-100 flex items-center gap-3 sticky bottom-0 z-20"
          style={{ boxShadow: '0 -2px 16px 0 rgba(0,0,0,0.03)' }}
        >
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Message AI Analyst..."
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none shadow-sm max-h-32"
            style={{ minHeight: '44px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="flex-shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-500 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;