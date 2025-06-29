export interface TextGenerationOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system?: string;
}

export interface ImageGenerationOptions {
  model?: 'flux' | 'flux-realism' | 'any-dark' | 'flux-anime' | 'flux-3d' | 'turbo';
  seed?: number;
  width?: number;
  height?: number;
  nologo?: boolean;
  enhancePrompt?: boolean; // New option to control prompt enhancement
}

export interface AudioGenerationOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
  }>;
}

class PollinationAPI {
  private baseTextUrl = 'https://text.pollinations.ai';
  private baseImageUrl = 'https://image.pollinations.ai';

  async generateText(prompt: string, options: TextGenerationOptions = {}): Promise<string> {
    try {
      const model = options.model || 'openai';
      
      // Handle SearchGPT differently - it uses GET API
      if (model === 'searchgpt') {
        return this.generateSearchGPTResponse(prompt);
      }
      
      console.log(model, prompt);
      const response = await fetch(`${this.baseTextUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: options.system || 'You are a helpful AI assistant powered by Pollination AI. Provide clear, informative, and engaging responses.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Text generation error:', error);
      throw new Error('Failed to generate text response');
    }
  }

  // Special method for SearchGPT GET API
  private async generateSearchGPTResponse(prompt: string): Promise<string> {
    try {
      // Encode the prompt for URL
      const encodedPrompt = encodeURIComponent(prompt);
      const url = `${this.baseTextUrl}/${encodedPrompt}?model=searchgpt`;
      
      console.log('SearchGPT GET request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain, application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SearchGPT API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // SearchGPT might return plain text or JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || data.content || data.response || 'Sorry, I could not generate a response.';
      } else {
        // Plain text response
        const text = await response.text();
        return text || 'Sorry, I could not generate a response.';
      }
    } catch (error) {
      console.error('SearchGPT generation error:', error);
      throw new Error('Failed to generate SearchGPT response');
    }
  }

  // New method for generating text with full conversation history
  async generateTextWithHistory(
    currentPrompt: string, 
    conversationHistory: ConversationMessage[], 
    options: TextGenerationOptions = {}
  ): Promise<string> {
    try {
      const model = options.model || 'openai';
      
      // Handle SearchGPT differently - it uses GET API and doesn't support conversation history
      if (model === 'searchgpt') {
        // For SearchGPT, just use the current prompt since it doesn't support conversation history
        return this.generateSearchGPTResponse(currentPrompt);
      }
      
      console.log('Sending to API:', {
        model: model,
        messages: conversationHistory,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
      });
      
      const response = await fetch(`${this.baseTextUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: conversationHistory, // Use the full conversation history
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Text generation with history error:', error);
      throw new Error('Failed to generate text response');
    }
  }

  async generateImage(prompt: string, options: ImageGenerationOptions = {}): Promise<string> {
    try {
      // Use original prompt or enhance it based on the enhancePrompt option
      const finalPrompt = options.enhancePrompt !== false 
        ? this.enhanceImagePrompt(prompt) 
        : prompt;
      
      // Infer the best model based on prompt content
      const model = this.inferImageModel(finalPrompt, options.model);
      
      // Build the image URL with proper encoding
      const baseUrl = `${this.baseImageUrl}/prompt/${encodeURIComponent(finalPrompt)}`;
      
      const params = new URLSearchParams();
      params.append('width', (options.width || 1024).toString());
      params.append('height', (options.height || 1024).toString());
      params.append('model', model);
      params.append('nologo', 'true');
      
      if (options.seed) {
        params.append('seed', options.seed.toString());
      }

      const imageUrl = `${baseUrl}?${params.toString()}`;
      
      console.log('Generated image URL:', imageUrl);
      console.log('Prompt enhancement:', options.enhancePrompt !== false ? 'enabled' : 'disabled');
      
      // Return the URL directly - the browser will handle loading
      return imageUrl;
    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error('Failed to generate image');
    }
  }

  private enhanceImagePrompt(prompt: string): string {
    // If prompt is very short, add some enhancement
    if (prompt.length < 20) {
      const enhancements = [
        'highly detailed',
        'beautiful',
        'professional quality',
        'vibrant colors',
        'sharp focus'
      ];
      return `${prompt}, ${enhancements.join(', ')}`;
    }
    return prompt;
  }

  private inferImageModel(prompt: string, preferredModel?: string): string {
    if (preferredModel) return preferredModel;

    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('anime') || lowerPrompt.includes('manga') || lowerPrompt.includes('cartoon')) {
      return 'flux-anime';
    }
    if (lowerPrompt.includes('3d') || lowerPrompt.includes('render') || lowerPrompt.includes('sculpture')) {
      return 'flux-3d';
    }
    if (lowerPrompt.includes('dark') || lowerPrompt.includes('gothic') || lowerPrompt.includes('horror')) {
      return 'any-dark';
    }
    if (lowerPrompt.includes('realistic') || lowerPrompt.includes('photo') || lowerPrompt.includes('portrait')) {
      return 'flux-realism';
    }
    if (lowerPrompt.includes('quick') || lowerPrompt.includes('fast') || lowerPrompt.includes('simple')) {
      return 'turbo';
    }
    
    return 'flux'; // Default model
  }

  // Helper method to detect if user wants image generation
  isImageRequest(message: string): boolean {
    const imageKeywords = [
      '/imagine', 'generate image', 'create image', 'draw', 'paint', 'sketch',
      'show me', 'picture of', 'image of', 'photo of', 'illustration of'
    ];
    
    const lowerMessage = message.toLowerCase();
    return imageKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  // Helper method to clean prompt for image generation
  cleanImagePrompt(message: string): string {
    return message
      .replace(/^\/imagine\s*/i, '')
      .replace(/^(generate|create|draw|paint|sketch|show me)\s*(an?\s*)?(image|picture|photo|illustration)\s*(of\s*)?/i, '')
      .trim();
  }

  // Helper method to check if user wants raw prompt (no enhancement)
  isRawImageRequest(message: string): boolean {
    const rawKeywords = ['/raw', '--raw', 'exact prompt', 'no enhancement', 'raw prompt'];
    const lowerMessage = message.toLowerCase();
    return rawKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  // Helper method to clean raw image prompt
  cleanRawImagePrompt(message: string): string {
    return message
      .replace(/^\/imagine\s*/i, '')
      .replace(/^\/raw\s*/i, '')
      .replace(/--raw\s*/i, '')
      .replace(/\s*(exact prompt|no enhancement|raw prompt)\s*/i, '')
      .replace(/^(generate|create|draw|paint|sketch|show me)\s*(an?\s*)?(image|picture|photo|illustration)\s*(of\s*)?/i, '')
      .trim();
  }

  async getTextModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseTextUrl}/models`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // If the API returns an array of objects, extract the name property
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0].name) {
        return data.map((model: any) => model.name);
      }
      
      // If it's already an array of strings, return as is
      if (Array.isArray(data)) {
        return data;
      }
      
      // Fallback to default models including SearchGPT
      return ['openai', 'claude', 'llama', 'mistral', 'searchgpt'];
    } catch (error) {
      console.error('Error fetching text models:', error);
      return ['openai', 'claude', 'llama', 'mistral', 'searchgpt'];
    }
  }

  async getImageModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseImageUrl}/models`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // If the API returns an array of objects, extract the name property
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0].name) {
        return data.map((model: any) => model.name);
      }
      
      // If it's already an array of strings, return as is
      if (Array.isArray(data)) {
        return data;
      }
      
      // Fallback to default models
      return ['flux', 'flux-realism', 'any-dark', 'flux-anime', 'flux-3d', 'turbo'];
    } catch (error) {
      console.error('Error fetching image models:', error);
      return ['flux', 'flux-realism', 'any-dark', 'flux-anime', 'flux-3d', 'turbo'];
    }
  }
}

export const pollinationAPI = new PollinationAPI();