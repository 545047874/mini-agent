import { FinishReason } from "./api.js"

export type Role = 'system' | 'user' | 'assistant'

export type Message = {
    role: Role
    content: string
}

export interface Usage {
  promptTokens: number
  completionTokens: number
  cacheHitTokens: number
}

export interface ChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}


export interface ChatResult {
  content: string
  finishReason: FinishReason
  usage: Usage
  model: string
}