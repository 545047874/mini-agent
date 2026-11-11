import { writeFile, mkdir } from 'node:fs/promises'

const key = process.env.DEEPSEEK_API_KEY
if (!key) throw new Error('DEEPSEEK_API_KEY 未设置')

// 测试 deepseek-reasoner
const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [{ role: 'user', content: '说一句你好' }],
    }),
})

const json = await res.json()
await writeFile(`out/chat.json`, JSON.stringify(json, null, 2))


// obj 格式如下
const response = {
    /* 本次请求 id
     作用：排障时用来对日志
    */
    "id": "e56e6c68-cbfd-4d3d-be17-fb2922f32904",
    "object": "chat.completion",
    "created": 1794303319,
    /* 实际服务的模型
     你请求的和返回的可能不一致（别名/路由）
    */
    "model": "deepseek-flash",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                /* 正文
                唯一进入下一轮历史的东西
                */
                "content": "你好！很高兴见到你，有什么我可以帮你的吗？😊",
                /* 推理过程（deepseek-reasoner 才有）	要不要进历史、要不要给用户看，是产品决策*/
                "reasoning_content": ""
            },
            "logprobs": null,
            /*结束原因
             循环的分支开关，后面细说
                stop — 正常说完了
                length — 撞到 max_tokens，话没说完
                content_filter — 被拦截
                tool_calls — 模型要求调工具（W2 的主角）
                insufficient_system_resource — 服务端资源不足，可重试
             */
            "finish_reason": "stop"
        }
    ],
    "usage": {
        /* 输入 token	计费 + 压缩触发阈值*/
        "prompt_tokens": 33,
        /* 输出 token	计费 + 压缩触发阈值*/
        "completion_tokens": 15,
        "total_tokens": 48,
        "prompt_tokens_details": {
            "cached_tokens": 0
        },
        "completion_tokens_details": {
            "reasoning_tokens": 0
        },
        /* 命中前缀缓存的 token	⭐ 决定你 prompt 能不能乱序*/
        "prompt_cache_hit_tokens": 0,
        /* 未命中的部分	两者相加 ≈ prompt_tokens*/
        "prompt_cache_miss_tokens": 33
    },
    "system_fingerprint": "bc19ba97cbe016479903222bb1578db6"
}