import { DeepSeekRawResponse, FinishReason } from './types/api.js'
import type { ChatOptions, ChatResult, Message, Usage } from './types/local.js'

const ENDPOINT = 'https://api.deepseek.com/chat/completions'
const DEFAULT_MODEL = 'deepseek-chat'

export async function chat(messages: Message[], opts: ChatOptions = {}): Promise<ChatResult> {
    const key = process.env.DEEPSEEK_API_KEY
    if (!key) throw new Error('DEEPSEEK_API_KEY 未设置')

    const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: opts.model ?? DEFAULT_MODEL, messages, ...opts }),
    })
    const json: DeepSeekRawResponse = await res.json()
    if (!json.choices) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`)
    return {
        content: json.choices[0].message.content,
        finishReason: mapFinish(json.choices[0].finish_reason),
        usage: {
            promptTokens: json.usage.prompt_tokens,
            completionTokens: json.usage.completion_tokens,
            cacheHitTokens: json.usage.prompt_cache_hit_tokens
        },
        model: json.model
    }
}

function mapFinish(v: string): FinishReason {
  switch (v) {
    case 'stop':
    case 'length':
    case 'content_filter':
    case 'tool_calls':
      return v
    default:
      console.warn(`未知 finish_reason: ${v}`)   // 库层唯一允许的可观测输出
      return 'other'
  }
}