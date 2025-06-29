import React from 'react';
import { Plus, MessageCircle, Trash2, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  isActive: boolean;
}

interface ChatSidebarProps {
  chats: Chat[];
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onCloseSidebar?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  chats, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat,
  onCloseSidebar
}) => {
  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent chat selection when clicking delete
    if (window.confirm('Are you sure you want to delete this chat?')) {
      onDeleteChat(chatId);
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Pollination AI</h1>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <UserMenu />
            {/* Mobile close button */}
            {onCloseSidebar && (
              <button
                onClick={onCloseSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No chats yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Start a new conversation to begin chatting with Pollination AI
            </p>
          </div>
        ) : (
          <div className="p-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`relative group mb-1 rounded-lg transition-all duration-200 ${
                  chat.isActive ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''
                }`}
              >
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className="w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      chat.isActive 
                        ? 'bg-blue-100 dark:bg-blue-800' 
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                    }`}>
                      <MessageCircle className={`w-4 h-4 ${
                        chat.isActive 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <h3 className={`font-medium text-sm mb-1 truncate ${
                        chat.isActive 
                          ? 'text-blue-900 dark:text-blue-100' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {chat.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{chat.timestamp}</p>
                    </div>
                  </div>
                </button>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="absolute top-3 right-3 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded transition-all duration-200"
                  title="Delete chat"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Connected to Pollination AI</span>
        </div>
        {chats.length > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {chats.length} chat{chats.length !== 1 ? 's' : ''} saved locally
          </p>
        )}
      </div>
    </div>
  );
};