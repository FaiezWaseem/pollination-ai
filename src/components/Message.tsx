import React, { useState } from 'react';
import { Bot, User, Copy, ThumbsUp, ThumbsDown, Image as ImageIcon, Download, RefreshCw, File, FileText, FileImage, FileVideo, FileAudio, ExternalLink } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
}

interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp: string;
  isTyping?: boolean;
  imageUrl?: string;
  audioUrl?: string;
  attachedFiles?: AttachedFile[];
}

export const Message: React.FC<MessageProps> = ({ 
  content, 
  isUser, 
  timestamp, 
  isTyping = false, 
  imageUrl, 
  audioUrl,
  attachedFiles = []
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    console.error('Image failed to load:', imageUrl);
  };

  const retryImageLoad = () => {
    if (retryCount < 3) {
      setImageLoading(true);
      setImageError(false);
      setRetryCount(prev => prev + 1);
      
      // Force reload by adding timestamp
      const img = new Image();
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      img.src = `${imageUrl}&retry=${Date.now()}`;
    }
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    
    try {
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `pollination-image-${Date.now()}.png`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download image:', error);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return FileImage;
    if (type.startsWith('video/')) return FileVideo;
    if (type.startsWith('audio/')) return FileAudio;
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileDownload = (file: AttachedFile) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`flex items-start space-x-2 sm:space-x-3 mb-4 sm:mb-6 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
          : 'bg-gradient-to-r from-green-500 to-teal-500'
      }`}>
        {isUser ? (
          <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        ) : (
          <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-full sm:max-w-3xl ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`group relative ${
          isUser 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
        } rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm max-w-full`}>
          {isTyping ? (
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</span>
            </div>
          ) : (
            <>
              {/* Attached Files */}
              {attachedFiles.length > 0 && (
                <div className="mb-3">
                  <div className="grid grid-cols-1 gap-2">
                    {attachedFiles.map((file, index) => {
                      const Icon = getFileIcon(file.type);
                      const isImage = file.type.startsWith('image/');
                      
                      return (
                        <div
                          key={index}
                          className={`flex items-center space-x-2 p-2 rounded-lg border ${
                            isUser 
                              ? 'bg-white/10 border-white/20' 
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          {isImage && file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded flex-shrink-0"
                            />
                          ) : (
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded flex-shrink-0 ${
                              isUser 
                                ? 'bg-white/20' 
                                : 'bg-gray-100 dark:bg-gray-600'
                            }`}>
                              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                isUser 
                                  ? 'text-white' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs sm:text-sm font-medium truncate ${
                              isUser 
                                ? 'text-white' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {file.name}
                            </p>
                            <p className={`text-xs ${
                              isUser 
                                ? 'text-white/70' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                          {file.url && (
                            <button
                              onClick={() => handleFileDownload(file)}
                              className={`p-1 rounded hover:bg-opacity-20 transition-colors flex-shrink-0 ${
                                isUser 
                                  ? 'text-white hover:bg-white' 
                                  : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600'
                              }`}
                              title="Download file"
                            >
                              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Text Content */}
              {content && (
                <div className={`text-sm leading-relaxed ${
                  isUser ? 'text-white' : ''
                }`}>
                  {isUser ? (
                    // User messages: plain text with white color
                    <div className="text-white whitespace-pre-wrap break-words">
                      {content}
                    </div>
                  ) : (
                    // AI messages: rendered markdown
                    <MarkdownRenderer 
                      content={content}
                      className="ai-message-content"
                    />
                  )}
                </div>
              )}

              {/* Image Content */}
              {imageUrl && (
                <div className="mt-3">
                  {imageLoading && !imageError && (
                    <div className="flex items-center justify-center w-full h-48 sm:h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border-2 border-dashed border-blue-200 dark:border-gray-500">
                      <div className="text-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Generating your image...</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This may take a few moments</p>
                      </div>
                    </div>
                  )}
                  
                  {imageError ? (
                    <div className="flex items-center justify-center w-full h-48 sm:h-64 bg-red-50 dark:bg-red-900/20 border-2 border-dashed border-red-200 dark:border-red-800 rounded-lg">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-red-400 mx-auto mb-3" />
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">Image failed to load</p>
                        <p className="text-xs text-red-500 dark:text-red-400 mb-3">
                          {retryCount < 3 ? 'Click retry to try again' : 'Maximum retries reached'}
                        </p>
                        {retryCount < 3 && (
                          <button
                            onClick={retryImageLoad}
                            className="inline-flex items-center space-x-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-xs"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Retry ({3 - retryCount} left)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative group">
                      <img
                        src={imageUrl}
                        alt="Generated by Pollination AI"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        className={`max-w-full h-auto rounded-lg shadow-lg transition-all duration-300 ${
                          imageLoading ? 'opacity-0' : 'opacity-100'
                        } hover:shadow-xl`}
                        style={{ display: imageLoading ? 'none' : 'block' }}
                        crossOrigin="anonymous"
                      />
                      
                      {/* Image Actions */}
                      {!imageLoading && !imageError && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={downloadImage}
                            className="p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-colors backdrop-blur-sm"
                            title="Download image"
                          >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      )}
                      
                      {/* Image info overlay */}
                      {!imageLoading && !imageError && (
                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                            Generated by Pollination AI
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Audio Content */}
              {audioUrl && (
                <div className="mt-3">
                  <audio controls className="w-full max-w-sm">
                    <source src={audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </>
          )}

          {/* Actions for AI messages */}
          {!isUser && !isTyping && (content || imageUrl || attachedFiles.length > 0) && (
            <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Copy message"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                title="Like message"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Dislike message"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-2">
          {timestamp}
        </p>
      </div>
    </div>
  );
};