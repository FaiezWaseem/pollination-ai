import React, { useState, useEffect } from 'react';
import { Settings, ChevronDown, Zap, Brain, Cpu, Sparkles, Search } from 'lucide-react';
import { pollinationAPI } from '../services/pollinationApi';

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (model: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ currentModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Predefined model info with icons and descriptions
  const modelInfo: Record<string, { name: string; description: string; icon: React.ComponentType<any>; color: string }> = {
    'openai': {
      name: 'OpenAI GPT',
      description: 'Advanced conversational AI with excellent reasoning',
      icon: Zap,
      color: 'text-green-600 dark:text-green-400'
    },
    'claude': {
      name: 'Claude',
      description: 'Anthropic\'s helpful, harmless, and honest AI',
      icon: Brain,
      color: 'text-orange-600 dark:text-orange-400'
    },
    'llama': {
      name: 'Llama',
      description: 'Meta\'s open-source language model',
      icon: Cpu,
      color: 'text-blue-600 dark:text-blue-400'
    },
    'mistral': {
      name: 'Mistral',
      description: 'Efficient and powerful European AI model',
      icon: Sparkles,
      color: 'text-purple-600 dark:text-purple-400'
    },
    'searchgpt': {
      name: 'SearchGPT',
      description: 'AI-powered search with real-time information',
      icon: Search,
      color: 'text-cyan-600 dark:text-cyan-400'
    }
  };

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const models = await pollinationAPI.getTextModels();
        setAvailableModels(models);
      } catch (error) {
        console.error('Failed to fetch models:', error);
        // Fallback to default models including SearchGPT
        setAvailableModels(['openai', 'claude', 'llama', 'mistral', 'searchgpt']);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const getCurrentModelInfo = () => {
    return modelInfo[currentModel] || {
      name: currentModel,
      description: 'AI Language Model',
      icon: Zap,
      color: 'text-gray-600 dark:text-gray-400'
    };
  };

  const currentInfo = getCurrentModelInfo();
  const CurrentIcon = currentInfo.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2 sm:px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        title="Select AI Model"
      >
        <CurrentIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${currentInfo.color}`} />
        <span className="font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
          {currentInfo.name}
        </span>
        <span className="font-medium text-gray-700 dark:text-gray-300 sm:hidden">
          {currentInfo.name.split(' ')[0]}
        </span>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select AI Model</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose the AI model for text generation
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-sm text-gray-500">Loading models...</span>
              </div>
            ) : (
              availableModels.map((model) => {
                const info = modelInfo[model] || {
                  name: model,
                  description: 'AI Language Model',
                  icon: Zap,
                  color: 'text-gray-600 dark:text-gray-400'
                };
                const Icon = info.icon;
                const isSelected = model === currentModel;

                return (
                  <button
                    key={model}
                    onClick={() => {
                      onModelChange(model);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start space-x-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      isSelected 
                        ? 'bg-blue-100 dark:bg-blue-800' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        isSelected 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : info.color
                      }`} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-sm font-medium truncate ${
                          isSelected 
                            ? 'text-blue-900 dark:text-blue-100' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {info.name}
                        </h4>
                        {isSelected && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {info.description}
                      </p>
                      {model === 'searchgpt' && (
                        <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1 font-medium">
                          ⚡ Real-time search enabled
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Model changes apply to new messages only
            </p>
            {availableModels.includes('searchgpt') && (
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                💡 SearchGPT provides real-time information and web search
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};