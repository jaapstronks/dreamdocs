/**
 * LLM Abstraction Layer
 * Vendor-agnostic interface for chat completions.
 * Supports: Claude, OpenAI, Mistral
 */

/**
 * Message in a chat conversation
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Options for chat completion
 */
export interface ChatCompletionOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Chat completion result
 */
export interface ChatCompletionResult {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * LLM vendor type
 */
export type LLMVendor = 'claude' | 'openai' | 'mistral';

/**
 * Get configured LLM vendor
 */
export function getConfiguredVendor(): LLMVendor | null {
  if (process.env.CLAUDE_API_KEY) return 'claude';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.MISTRAL_API_KEY) return 'mistral';
  return null;
}

/**
 * Check if LLM is configured
 */
export function isLLMConfigured(): boolean {
  return getConfiguredVendor() !== null;
}

/**
 * Get default model for vendor
 */
function getDefaultModel(vendor: LLMVendor): string {
  switch (vendor) {
    case 'claude':
      return process.env.CLAUDE_MODEL || 'claude-3-5-haiku-20241022';
    case 'openai':
      return process.env.OPENAI_MODEL || 'gpt-4o-mini';
    case 'mistral':
      return process.env.MISTRAL_MODEL || 'mistral-small-latest';
  }
}

/**
 * Request chat completion from Claude
 */
async function requestClaude(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error('CLAUDE_API_KEY not set');

  const model = options.model || getDefaultModel('claude');

  // Extract system message
  const systemMessage = options.messages.find((m) => m.role === 'system');
  const chatMessages = options.messages.filter((m) => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
      system: systemMessage?.content,
      messages: chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} ${error}`);
  }

  const data = await response.json();

  return {
    content: data.content[0]?.text || '',
    model: data.model,
    usage: data.usage ? {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    } : undefined,
  };
}

/**
 * Request chat completion from OpenAI
 */
async function requestOpenAI(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const model = options.model || getDefaultModel('openai');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
      messages: options.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0]?.message?.content || '',
    model: data.model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  };
}

/**
 * Request chat completion from Mistral
 */
async function requestMistral(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('MISTRAL_API_KEY not set');

  const model = options.model || getDefaultModel('mistral');

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
      messages: options.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API error: ${response.status} ${error}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0]?.message?.content || '',
    model: data.model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  };
}

/**
 * Request chat completion using configured vendor
 */
export async function chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
  const vendor = getConfiguredVendor();

  if (!vendor) {
    throw new Error('No LLM configured. Set CLAUDE_API_KEY, OPENAI_API_KEY, or MISTRAL_API_KEY.');
  }

  switch (vendor) {
    case 'claude':
      return requestClaude(options);
    case 'openai':
      return requestOpenAI(options);
    case 'mistral':
      return requestMistral(options);
  }
}

/**
 * Simple helper for single-turn completions
 */
export async function complete(prompt: string, options: Partial<ChatCompletionOptions> = {}): Promise<string> {
  const result = await chatCompletion({
    messages: [{ role: 'user', content: prompt }],
    ...options,
  });
  return result.content;
}

/**
 * Helper for completions with a system prompt
 */
export async function completeWithSystem(
  systemPrompt: string,
  userPrompt: string,
  options: Partial<ChatCompletionOptions> = {}
): Promise<string> {
  const result = await chatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    ...options,
  });
  return result.content;
}
