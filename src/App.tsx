import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatInterface } from './components/ChatInterface';
import { SignInForm } from './components/SignInForm';
import { pollinationAPI } from './services/pollinationApi';

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  isActive: boolean;
}

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

// Local storage keys
const CHATS_STORAGE_KEY = 'pollination-chats';
const MESSAGES_STORAGE_KEY = 'pollination-messages';

const ChatApp: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Initialize chats from localStorage or empty array for first-time users
  const [chats, setChats] = useState<Chat[]>(() => {
    if (!user) return [];
    
    try {
      const savedChats = localStorage.getItem(`${CHATS_STORAGE_KEY}-${user.id}`);
      return savedChats ? JSON.parse(savedChats) : [];
    } catch (error) {
      console.error('Error loading chats from localStorage:', error);
      return [];
    }
  });

  // Initialize messages from localStorage or empty array
  const [messages, setMessages] = useState<MessageType[]>(() => {
    if (!user) return [];
    
    try {
      const activeChat = chats.find(chat => chat.isActive);
      if (!activeChat) return [];
      
      const savedMessages = localStorage.getItem(`${MESSAGES_STORAGE_KEY}-${user.id}-${activeChat.id}`);
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
      return [];
    }
  });

  const [isTyping, setIsTyping] = useState(false);
  const [activeChat, setActiveChat] = useState(() => {
    const activeChat = chats.find(chat => chat.isActive);
    return activeChat?.id || '';
  });
  const [currentModel, setCurrentModel] = useState('openai');

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (user && chats.length > 0) {
      try {
        localStorage.setItem(`${CHATS_STORAGE_KEY}-${user.id}`, JSON.stringify(chats));
      } catch (error) {
        console.error('Error saving chats to localStorage:', error);
      }
    }
  }, [chats, user]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (user && activeChat && messages.length > 0) {
      try {
        localStorage.setItem(`${MESSAGES_STORAGE_KEY}-${user.id}-${activeChat}`, JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving messages to localStorage:', error);
      }
    }
  }, [messages, user, activeChat]);

  // Load chats when user changes (sign in/out)
  useEffect(() => {
    if (user) {
      try {
        const savedChats = localStorage.getItem(`${CHATS_STORAGE_KEY}-${user.id}`);
        if (savedChats) {
          const parsedChats = JSON.parse(savedChats);
          setChats(parsedChats);
          
          // Set active chat
          const activeChat = parsedChats.find((chat: Chat) => chat.isActive);
          if (activeChat) {
            setActiveChat(activeChat.id);
            
            // Load messages for active chat
            const savedMessages = localStorage.getItem(`${MESSAGES_STORAGE_KEY}-${user.id}-${activeChat.id}`);
            if (savedMessages) {
              setMessages(JSON.parse(savedMessages));
            } else {
              setMessages([]);
            }
          } else {
            setActiveChat('');
            setMessages([]);
          }
        } else {
          // First time user - start with empty state
          setChats([]);
          setMessages([]);
          setActiveChat('');
        }
      } catch (error) {
        console.error('Error loading user data from localStorage:', error);
        setChats([]);
        setMessages([]);
        setActiveChat('');
      }
    } else {
      // User signed out - clear state
      setChats([]);
      setMessages([]);
      setActiveChat('');
    }
  }, [user]);

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      lastMessage: 'Start a conversation...',
      timestamp: 'Just now',
      isActive: true,
    };

    // Deactivate all existing chats and add new one
    const updatedChats = chats.map(chat => ({ ...chat, isActive: false })).concat(newChat);
    setChats(updatedChats);
    setMessages([]);
    setActiveChat(newChatId);
    
    // Close sidebar on mobile after creating new chat
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectChat = (chatId: string) => {
    // Update active chat
    const updatedChats = chats.map(chat => ({ ...chat, isActive: chat.id === chatId }));
    setChats(updatedChats);
    setActiveChat(chatId);
    
    // Load messages for selected chat
    if (user) {
      try {
        const savedMessages = localStorage.getItem(`${MESSAGES_STORAGE_KEY}-${user.id}-${chatId}`);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Error loading messages for chat:', error);
        setMessages([]);
      }
    }
    
    // Close sidebar on mobile after selecting chat
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    // Remove chat from list
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    
    // If deleted chat was active, activate the first remaining chat or clear
    if (activeChat === chatId) {
      if (updatedChats.length > 0) {
        updatedChats[0].isActive = true;
        setActiveChat(updatedChats[0].id);
        
        // Load messages for new active chat
        if (user) {
          try {
            const savedMessages = localStorage.getItem(`${MESSAGES_STORAGE_KEY}-${user.id}-${updatedChats[0].id}`);
            setMessages(savedMessages ? JSON.parse(savedMessages) : []);
          } catch (error) {
            console.error('Error loading messages for new active chat:', error);
            setMessages([]);
          }
        }
      } else {
        setActiveChat('');
        setMessages([]);
      }
    }
    
    setChats(updatedChats);
    
    // Remove messages from localStorage
    if (user) {
      try {
        localStorage.removeItem(`${MESSAGES_STORAGE_KEY}-${user.id}-${chatId}`);
      } catch (error) {
        console.error('Error removing messages from localStorage:', error);
      }
    }
  };

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
    console.log('Model changed to:', model);
  };

  const processAttachedFiles = async (files: File[]): Promise<AttachedFile[]> => {
    const processedFiles: AttachedFile[] = [];
    
    for (const file of files) {
      const attachedFile: AttachedFile = {
        name: file.name,
        size: file.size,
        type: file.type
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        try {
          const preview = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          attachedFile.preview = preview;
          attachedFile.url = preview; // For now, use preview as URL
        } catch (error) {
          console.error('Error generating image preview:', error);
        }
      } else {
        // For non-image files, create a blob URL
        try {
          attachedFile.url = URL.createObjectURL(file);
        } catch (error) {
          console.error('Error creating blob URL:', error);
        }
      }

      processedFiles.push(attachedFile);
    }

    return processedFiles;
  };

  // Helper function to build conversation history for AI context
  const buildConversationHistory = (currentMessages: MessageType[], newUserMessage: string, attachedFiles?: AttachedFile[]) => {
    const conversationMessages = [];
    
    // Add system message
    conversationMessages.push({
      role: 'system',
      content: `You are a helpful AI assistant powered by Pollination AI using the ${currentModel} model. You have access to the full conversation history and can reference previous messages to provide contextual responses. Provide clear, informative, and engaging responses. You can help with various tasks including answering questions, creative writing, problem-solving, and more. Be conversational and helpful.

Key capabilities:
- Text generation and conversation
- Image generation (when users use /imagine or /raw commands)
- Image analysis and discussion (when users upload images)
- File analysis and discussion
- Contextual responses based on conversation history

Remember to:
- Reference previous parts of the conversation when relevant
- Maintain context and continuity
- Be helpful and engaging
- Acknowledge when users refer to earlier messages or topics
- When users attach files, acknowledge them and provide relevant analysis or discussion about the files
- For images, describe what you see and provide insights or answer questions about them`
    });

    // Add recent conversation history (last 10 messages to avoid token limits)
    const recentMessages = currentMessages.slice(-10);
    
    for (const msg of recentMessages) {
      if (msg.isUser) {
        // For user messages, check if there are attached files
        if (msg.attachedFiles && msg.attachedFiles.length > 0) {
          // Build content array for multimodal messages
          const contentArray = [];
          
          // Add text content
          if (msg.content) {
            contentArray.push({ type: 'text', text: msg.content });
          }
          
          // Add image content for image files
          msg.attachedFiles.forEach(file => {
            if (file.type.startsWith('image/') && file.url) {
              contentArray.push({
                type: 'image_url',
                image_url: { url: file.url }
              });
            }
          });
          
          // Add file descriptions for non-image files
          const nonImageFiles = msg.attachedFiles.filter(file => !file.type.startsWith('image/'));
          if (nonImageFiles.length > 0) {
            const fileDescriptions = nonImageFiles.map(file => 
              `- ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)}KB)`
            ).join('\n');
            contentArray.push({
              type: 'text',
              text: `[User also attached ${nonImageFiles.length} non-image file(s):\n${fileDescriptions}]`
            });
          }
          
          conversationMessages.push({
            role: 'user',
            content: contentArray
          });
        } else {
          // Regular text message
          conversationMessages.push({
            role: 'user',
            content: msg.content
          });
        }
      } else {
        // For AI messages, include the text content (skip images as they're generated separately)
        if (msg.content && !msg.imageUrl) {
          conversationMessages.push({
            role: 'assistant',
            content: msg.content
          });
        } else if (msg.imageUrl) {
          // For image messages, add a brief note about the image generation
          conversationMessages.push({
            role: 'assistant',
            content: '[Generated an image based on user request]'
          });
        }
      }
    }

    // Add the new user message with attached files
    if (attachedFiles && attachedFiles.length > 0) {
      const contentArray = [];
      
      // Add text content
      if (newUserMessage) {
        contentArray.push({ type: 'text', text: newUserMessage });
      }
      
      // Add image content for image files
      attachedFiles.forEach(file => {
        if (file.type.startsWith('image/') && file.url) {
          contentArray.push({
            type: 'image_url',
            image_url: { url: file.url }
          });
        }
      });
      
      // Add file descriptions for non-image files
      const nonImageFiles = attachedFiles.filter(file => !file.type.startsWith('image/'));
      if (nonImageFiles.length > 0) {
        const fileDescriptions = nonImageFiles.map(file => 
          `- ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)}KB)`
        ).join('\n');
        contentArray.push({
          type: 'text',
          text: `[User also attached ${nonImageFiles.length} non-image file(s):\n${fileDescriptions}]`
        });
      }
      
      conversationMessages.push({
        role: 'user',
        content: contentArray
      });
    } else {
      // Regular text message
      conversationMessages.push({
        role: 'user',
        content: newUserMessage
      });
    }

    console.log('Built conversation history:', conversationMessages);
    return conversationMessages;
  };

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    // If no active chat, create one first
    if (!activeChat) {
      handleNewChat();
      // Wait for state to update
      setTimeout(() => {
        handleSendMessage(content, attachments);
      }, 100);
      return;
    }

    // Process attached files
    const processedFiles = attachments ? await processAttachedFiles(attachments) : [];

    const userMessage: MessageType = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: 'Just now',
      attachedFiles: processedFiles
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Update chat list with new message
    const lastMessage = content || (processedFiles.length > 0 ? `📎 ${processedFiles.length} file(s)` : 'Message');
    const updatedChats = chats.map(chat =>
      chat.id === activeChat
        ? { ...chat, lastMessage, timestamp: 'Just now' }
        : chat
    );
    setChats(updatedChats);

    try {
      // Check if this is a raw image request
      const isRawImageRequest = pollinationAPI.isRawImageRequest(content);
      
      if (isRawImageRequest) {
        // For raw images, generate the image and display it directly with markdown
        const imagePrompt = pollinationAPI.cleanRawImagePrompt(content);
        
        console.log('Generating raw image with prompt:', imagePrompt);
        
        const imageUrl = await pollinationAPI.generateImage(imagePrompt, { 
          width: 1024, 
          height: 1024,
          nologo: true,
          enhancePrompt: false // Disable enhancement for raw requests
        });

        console.log('Generated raw image URL:', imageUrl);

        // Create a markdown response with the image - no AI text generation
        const markdownContent = `![${imagePrompt}](${imageUrl})

**Raw Image Generated**  
Prompt: "${imagePrompt}"  
Size: 1024x1024px  
Enhancement: Disabled`;

        const aiMessage: MessageType = {
          id: (Date.now() + 1).toString(),
          content: markdownContent,
          isUser: false,
          timestamp: 'Just now',
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Set typing indicator for non-raw requests
        setIsTyping(true);
        
        // Check if this is a regular image generation request
        const isImageRequest = pollinationAPI.isImageRequest(content);
        
        if (isImageRequest) {
          const imagePrompt = pollinationAPI.cleanImagePrompt(content);
          
          console.log('Generating enhanced image with prompt:', imagePrompt);
          
          // Build conversation history for context
          const conversationHistory = buildConversationHistory(updatedMessages, content, processedFiles);
          
          // Generate both text response and image
          const [textResponse, imageUrl] = await Promise.all([
            pollinationAPI.generateTextWithHistory(
              `The user wants to generate an image with this prompt: "${imagePrompt}". The prompt will be enhanced for better results. Provide a brief, encouraging response about the image generation and describe what they might expect to see. Keep it under 100 words. Consider the conversation context when crafting your response.`,
              conversationHistory,
              { model: currentModel }
            ),
            pollinationAPI.generateImage(imagePrompt, { 
              width: 1024, 
              height: 1024,
              nologo: true,
              enhancePrompt: true // Enable enhancement for regular requests
            })
          ]);

          console.log('Generated enhanced image URL:', imageUrl);

          const aiMessage: MessageType = {
            id: (Date.now() + 1).toString(),
            content: textResponse,
            isUser: false,
            timestamp: 'Just now',
            imageUrl: imageUrl,
          };

          setMessages(prev => [...prev, aiMessage]);
        } else {
          // Regular text generation with conversation history
          const conversationHistory = buildConversationHistory(updatedMessages, content, processedFiles);
          
          console.log('Sending conversation history to AI:', conversationHistory);
          
          const aiResponse = await pollinationAPI.generateTextWithHistory(
            content,
            conversationHistory,
            { model: currentModel }
          );

          const aiMessage: MessageType = {
            id: (Date.now() + 1).toString(),
            content: aiResponse,
            isUser: false,
            timestamp: 'Just now',
          };

          setMessages(prev => [...prev, aiMessage]);
        }
      }

      // Update chat title if it's a new chat
      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChat && chat.title === 'New Chat'
            ? { ...chat, title: content.slice(0, 30) + (content.length > 30 ? '...' : '') }
            : chat
        )
      );
    } catch (error) {
      console.error('Error generating response:', error);
      
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while processing your request. Please try again. If you were trying to generate an image, make sure your prompt is descriptive and try again.',
        isUser: false,
        timestamp: 'Just now',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const currentChat = chats.find(chat => chat.id === activeChat);

  if (!isAuthenticated) {
    return <SignInForm />;
  }

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900 relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
        w-80 lg:w-80
      `}>
        <ChatSidebar
          chats={chats}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
      </div>
      
      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          currentChatTitle={currentChat?.title || 'Pollination AI Chat'}
          currentModel={currentModel}
          onModelChange={handleModelChange}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;