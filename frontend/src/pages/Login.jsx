import { useState } from 'react'

export default function Login({ onLogin, onGoSignup }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const snakeForm = {
        email: form.email,
        password: form.password
      }
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snakeForm)
      })
      if (!res.ok) throw new Error('서버 오류: ' + res.status)
      const data = await res.json()
      onLogin(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1>로그인</h1>
      <input name="email" placeholder="이메일" value={form.email} onChange={handleChange} />
      <input name="password" type="password" placeholder="패스워드" value={form.password} onChange={handleChange} />
      <button onClick={handleLogin} disabled={loading} style={{ padding: '8px 20px', fontSize: 16 }}>
        로그인
      </button>
      <button type="button" onClick={onGoSignup} style={{ background: 'none', color: '#007bff', border: 'none', cursor: 'pointer', marginTop: 8 }}>
        회원가입 하기
      </button>
      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: 'red' }}>에러: {error}</p>}
    </div>
  )
}
