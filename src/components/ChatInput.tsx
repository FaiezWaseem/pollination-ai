import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Image, Zap, Hash, X, File, FileText, FileImage, FileVideo, FileAudio } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: File[]) => void;
  disabled?: boolean;
}

interface AttachedFile {
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachedFiles.length > 0) && !disabled) {
      onSendMessage(message.trim(), attachedFiles.map(af => af.file));
      setMessage('');
      setAttachedFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const getFileType = (file: File): AttachedFile['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'document';
    return 'other';
  };

  const getFileIcon = (type: AttachedFile['type']) => {
    switch (type) {
      case 'image': return FileImage;
      case 'video': return FileVideo;
      case 'audio': return FileAudio;
      case 'document': return FileText;
      default: return File;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newAttachedFiles: AttachedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = getFileType(file);
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      const attachedFile: AttachedFile = {
        file,
        type: fileType
      };

      // Generate preview for images
      if (fileType === 'image') {
        try {
          const preview = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          attachedFile.preview = preview;
        } catch (error) {
          console.error('Error generating image preview:', error);
        }
      }

      newAttachedFiles.push(attachedFile);
    }

    setAttachedFiles(prev => [...prev, ...newAttachedFiles]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Quick action buttons
  const quickActions = [
    {
      label: 'Generate Image',
      action: () => setMessage('/imagine '),
      icon: Image,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Raw Image (No Enhancement)',
      action: () => setMessage('/raw '),
      icon: Hash,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      label: 'Ask AI',
      action: () => setMessage(''),
      icon: Zap,
      color: 'text-green-600 dark:text-green-400'
    }
  ];

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Quick Actions - Mobile Toggle */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="sm:hidden text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {showQuickActions ? 'Hide' : 'Show'} quick actions
          </button>
          <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">Quick actions:</span>
        </div>

        {/* Quick Actions */}
        <div className={`${showQuickActions ? 'flex' : 'hidden'} sm:flex items-center space-x-2 mb-3 overflow-x-auto pb-2 sm:pb-0`}>
          {quickActions.map((action, index) => (
            <button
              key={index}
              type="button"
              onClick={action.action}
              className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap ${action.color}`}
            >
              <action.icon className="w-3 h-3" />
              <span className="hidden sm:inline">{action.label}</span>
              <span className="sm:hidden">{action.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Attached Files ({attachedFiles.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {attachedFiles.map((attachedFile, index) => {
                const Icon = getFileIcon(attachedFile.type);
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    {attachedFile.preview ? (
                      <img
                        src={attachedFile.preview}
                        alt={attachedFile.file.name}
                        className="w-8 h-8 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {attachedFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(attachedFile.file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachedFile(index)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div 
          className={`flex items-end space-x-2 sm:space-x-3 ${isDragOver ? 'ring-2 ring-blue-500 ring-opacity-50 rounded-lg' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-2 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Attach files"
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.csv,.json,.xml,.html,.css,.js,.ts,.py,.java,.cpp,.c,.h,.md,.rtf"
          />

          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                attachedFiles.length > 0 
                  ? "Add a message to your files..." 
                  : "Type your message here..."
              }
              disabled={disabled}
              rows={1}
              className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed overflow-y-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
              style={{ maxHeight: '120px' }}
            />
            
            {/* Voice input button */}
            <button
              type="button"
              className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Voice input"
            >
              <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={(!message.trim() && attachedFiles.length === 0) || disabled}
            className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 sm:p-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="truncate">
            {isDragOver 
              ? "Drop files here to attach them" 
              : "Press Enter to send, Shift+Enter for new line"
            }
          </span>
          <span className="ml-2 flex-shrink-0">{message.length}/2000</span>
        </div>
      </form>
    </div>
  );
};