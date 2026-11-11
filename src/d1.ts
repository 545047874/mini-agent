import { writeFile, mkdir } from 'node:fs/promises'

const run = process.argv[2]
const key = process.env.DEEPSEEK_API_KEY

if (!key) throw new Error('DEEPSEEK_API_KEY 未设置')

await mkdir('out', { recursive: true })
const ENDPOINT = 'https://api.deepseek.com/chat/completions'

type Msg = { role: 'system' | 'user' | 'assistant'; content: string }

async function call(messages: Msg[], extra: Record<string, unknown> = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'deepseek-chat', messages, ...extra }),
  })
  const json = await res.json()
  if (!json.choices) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`)
  const c = json.choices[0]

  const source = JSON.stringify(json, null, 2)
  return {
    status: res.status,
    text: c.message.content as string,
    finish: c.finish_reason as string,
    usage: json.usage as { prompt_tokens: number; completion_tokens: number },
    source
  }
}

if (run === 'max') {
  const r = await call([{ role: 'user', content: '用三句话介绍杭州。' }], { max_tokens: 5 })
  console.log('status =', r.status)
  console.log('finish =', r.finish)
  console.log('text   =', JSON.stringify(r.text))

   await writeFile(`out/max.json`, r.source)
}

if (run === 'system') {
  const q = '介绍一下你自己'
  const a = await call([{ role: 'user', content: q }])
  const b = await call([{ role: 'system', content: '你只回答一个字' }, { role: 'user', content: q }])
  console.log('无 system:', a.text.slice(0, 60))
  console.log('有 system:', b.text.slice(0, 60))
   await writeFile(`out/system-a.json`, a.source)
   await writeFile(`out/system-b.json`, b.source)
}

if (run === 'multi') {
  const r = await call([
    { role: 'user', content: '我叫小明' },
    { role: 'user', content: '我叫什么？' },
  ])
  console.log('status =', r.status)
  console.log('text   =', r.text.slice(0, 100))
    await writeFile(`out/multi.json`, r.source)
}

if (run === 'usage') {
  const history: Msg[] = []
  let prev = 0
  for (const q of ['你好', '用一句话介绍杭州', '再补充两点', '总结以上']) {
    history.push({ role: 'user', content: q })
    const r = await call(history)
    history.push({ role: 'assistant', content: r.text })
    console.log(`${q.padEnd(10)} prompt=${r.usage.prompt_tokens} (+${r.usage.prompt_tokens - prev}) completion=${r.usage.completion_tokens}`)
    prev = r.usage.prompt_tokens
    await writeFile(`out/usage-${q}.json`, r.source)
  }
}

if (run === 'temp') { 
  /* temperature 0 vs 1.5，各跑 3 次 */
  for (const t of [0, 1.5]) {
    for (let i = 0; i < 3; i++) {
        const r = await call([
            { role: 'user', content: '给一家开在写字楼楼下的咖啡店起 8 个名字。只输出名字，每行一个，不要解释。' },
        ], {temperature: t})
        await writeFile(`out/temp-${t}-${i}.json`, r.source)
    }
  }
}
