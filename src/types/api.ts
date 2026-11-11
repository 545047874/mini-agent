export interface DeepSeekRawResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: DeepSeekChoice[];
  usage: DeepSeekUsage;
  system_fingerprint: string;
}

export type FinishReason = 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'other'

export interface DeepSeekChoice {
  index: number;
  message: DeepSeekMessage;
  logprobs: null | Record<string, unknown>; // 通常为 null
  finish_reason: FinishReason; // 使用严格的联合类型
}

export interface DeepSeekMessage {
  role: string;
  content: string;
}

export interface DeepSeekUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details: {
    cached_tokens: number;
  };
  prompt_cache_hit_tokens: number;
  prompt_cache_miss_tokens: number;
}