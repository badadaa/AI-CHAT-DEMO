import { useEffect, useRef, useState } from 'react'
import { useStreamChat } from './hooks/useStreamChat'
import './App.css'

const SUGGESTIONS = [
  { tag: '解释', text: '用三句话讲清什么是流式输出' },
  { tag: '写作', text: '帮我写一段更克制的产品介绍' },
  { tag: '决定', text: '我该如何更冷静地做一个选择' },
]

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [history, setHistory] = useState<{ q: string; a: string }[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const { loading, answer, send, stop, clear } = useStreamChat()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const hasConversation = Boolean(currentQuestion) || history.length > 0

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [answer, currentQuestion, history.length, loading])

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [prompt])

  const submit = (text = prompt) => {
    const value = text.trim()
    if (!value || loading) return
    if (currentQuestion) {
      setHistory((prev) => [...prev, { q: currentQuestion, a: answer }])
    }
    setCurrentQuestion(value)
    setPrompt('')
    send(value)
  }

  const reset = () => {
    clear()
    setHistory([])
    setCurrentQuestion('')
    setPrompt('')
    inputRef.current?.focus()
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="mark" />
          <div className="brand-copy">
            <div className="brand-name">拾光</div>
            <div className="brand-status">
              <span className="dot" />
              在线
            </div>
          </div>
        </div>
        <button className="ghost" type="button" onClick={reset}>
          新对话
        </button>
      </header>

      <main className="stage">
        {!hasConversation ? (
          <section className="empty">
            <h1>今晚想聊点什么</h1>
            <p>把问题说清楚，答案会慢慢长出来。回车发送，Shift + 回车换行。</p>
            <div className="chips">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item.text}
                  className="chip"
                  type="button"
                  onClick={() => submit(item.text)}
                >
                  <span>{item.tag}</span>
                  {item.text}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <div className="messages" ref={listRef}>
            {history.map((turn, index) => (
              <article className="turn" key={`${index}-${turn.q}`}>
                <div className="user">{turn.q}</div>
                <div className="assistant">
                  <div className="avatar" />
                  <div className="answer">{turn.a}</div>
                </div>
              </article>
            ))}
            <article className="turn">
              <div className="user">{currentQuestion}</div>
              <div className="assistant">
                <div className="avatar" />
                <div className="answer">
                  {answer || (loading ? <span className="thinking">正在组织语言…</span> : '')}
                  {loading && <span className="caret" />}
                </div>
              </div>
            </article>
          </div>
        )}

        <div className="composer-wrap">
          <div className="composer">
            <textarea
              ref={inputRef}
              rows={1}
              value={prompt}
              placeholder="写下一句你真正想问的话"
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit()
                }
              }}
            />
            {loading ? (
              <button className="send stop" type="button" onClick={stop} aria-label="停止输出">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <rect x="2" y="2" width="10" height="10" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                className="send"
                type="button"
                onClick={() => submit()}
                disabled={!prompt.trim()}
                aria-label="发送"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
          <div className="hint">克制一点提问，回答会更干净。</div>
        </div>
      </main>
    </div>
  )
}
