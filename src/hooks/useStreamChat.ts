// src/hooks/useStreamChat.ts
import { useState, useCallback, useRef } from 'react';

export function useStreamChat() {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (userPrompt: string) => {
    if (!userPrompt.trim()) return;
    setLoading(true);
    setAnswer('');

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    // 请求本地FastAPI后端代理接口
    const res = await fetch(`http://127.0.0.1:8000/api/stream/chat?q=${encodeURIComponent(userPrompt)}`, {
      method: 'GET',
      signal: ctrl.signal
    });

    if (!res.body) throw new Error('无返回流');
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const dataStr = line.replace('data: ', '');
        if (dataStr === '[DONE]') continue;
        try {
          const json = JSON.parse(dataStr);
          const content = json.choices?.[0]?.delta?.content || '';
          if (content) {
            setAnswer(prev => prev + content);
          }
        } catch (e) {
          // 忽略解析异常片段
        }
      }
    }
    setLoading(false);
  }, []);

  const stop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const clear = () => {
    abortRef.current?.abort();
    setLoading(false);
    setAnswer('');
  };

  return { loading, answer, send, stop, clear };
}