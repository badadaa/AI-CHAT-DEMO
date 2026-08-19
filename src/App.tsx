import { useState } from 'react';
import { Input, Button, Card } from 'antd';
import { useStreamChat } from './hooks/useStreamChat';

export default function App() {
  const [key, setKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const { loading, answer, send, stop } = useStreamChat(key);

  return (
    <div style={{ maxWidth:700, margin:'40px auto', padding:'0 20px' }}>
      <Card title="AI对话Demo(纯前端)">
        <div>
          <div>填入DeepSeek API‑Key：</div>
          <Input.Password value={key} onChange={e=>setKey(e.target.value)} placeholder="sk‑xxx"/>
        </div>
        <div style={{marginTop:16}}>
          <Input.TextArea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={3} placeholder="输入你的问题"/>
        </div>
        <div style={{marginTop:10}}>
          <Button type="primary" onClick={()=>send(prompt)} loading={loading}>发送</Button>
          <Button danger onClick={stop} style={{marginLeft:8}}>停止输出</Button>
        </div>
        <div style={{marginTop:20, whiteSpace:'pre‑wrap'}}>
          <h4>AI回答：</h4>
          <div>{answer}</div>
        </div>
      </Card>
    </div>
  )
}