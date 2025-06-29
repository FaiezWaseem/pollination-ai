import React, { useRef, useEffect } from 'react';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import { MoreVertical, Zap, Image, MessageCircle, Hash, Paperclip, Menu } from 'lucide-react';

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
}

interface MessageType {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  imageUrl?: string;
  audioUrl?: string;
  attachedFiles?: AttachedFile[];
}

interface ChatInterfaceProps {
  messages: MessageType[];
  onSendMessage: (message: string, attachments?: File[]) => void;
  isTyping: boolean;
  currentChatTitle: string;
  currentModel: string;
  onModelChange: (model: string) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isTyping, 
  currentChatTitle,
  currentModel,
  onModelChange,
  onToggleSidebar,
  isSidebarOpen = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const suggestedPrompts = [
    {
      text: "Explain quantum computing in simple terms",
      icon: MessageCircle,
      category: "Learning"
    },
    {
      text: "/imagine a futuristic city at sunset",
      icon: Image,
      category: "Enhanced Image"
    },
    {
      text: "/raw a simple red apple on white background",
      icon: Hash,
      category: "Raw Image"
    },
    {
      text: "Help me write a professional email",
      icon: MessageCircle,
      category: "Writing"
    },
    {
      text: "/imagine a cute robot in a garden",
      icon: Image,
      category: "Enhanced Image"
    },
    {
      text: "/raw minimalist logo design",
      icon: Hash,
      category: "Raw Image"
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                {currentChatTitle}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                Powered by Pollination AI 
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:block">
              <ModelSelector 
                currentModel={currentModel}
                onModelChange={onModelChange}
              />
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* Mobile Model Selector */}
        <div className="sm:hidden mt-3 max-w-4xl mx-auto">
          <ModelSelector 
            currentModel={currentModel}
            onModelChange={onModelChange}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Start a conversation with Pollination AI
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6 sm:mb-8 text-sm sm:text-base px-4">
                I can help you with text generation, image creation, creative writing, problem-solving, and file analysis!
              </p>
              
              {/* Current Model Display */}
              <div className="mb-6">
                <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                    Currently using: <span className="font-semibold">{currentModel}</span>
                  </span>
                </div>
              </div>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-xs sm:text-sm">Text Generation</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Ask questions, get explanations, creative writing help</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Image className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-xs sm:text-sm">Enhanced Images</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Use "/imagine" for AI-enhanced image prompts</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Hash className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-xs sm:text-sm">Raw Images</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Use "/raw" for exact prompt without enhancement</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Paperclip className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-xs sm:text-sm">File Support</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Upload images, documents, and other files</p>
                </div>
              </div>
              
              {/* Suggested prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => onSendMessage(prompt.text)}
                    className="p-3 sm:p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        prompt.category === 'Enhanced Image' 
                          ? 'bg-purple-100 dark:bg-purple-900/20' 
                          : prompt.category === 'Raw Image'
                          ? 'bg-orange-100 dark:bg-orange-900/20'
                          : 'bg-blue-100 dark:bg-blue-900/20'
                      }`}>
                        <prompt.icon className={`w-4 h-4 ${
                          prompt.category === 'Enhanced Image'
                            ? 'text-purple-600 dark:text-purple-400'
                            : prompt.category === 'Raw Image'
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate">
                          {prompt.text}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{prompt.category}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <Message
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  imageUrl={message.imageUrl}
                  audioUrl={message.audioUrl}
                  attachedFiles={message.attachedFiles}
                />
              ))}
              
              {isTyping && (
                <Message
                  content=""
                  isUser={false}
                  timestamp=""
                  isTyping={true}
                />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
    </div>
  );
};