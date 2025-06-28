import { useState } from 'react'

export default function Signup({ onGoLogin }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSignup = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const snakeForm = {
        email: form.email,
        password: form.password,
        name: form.name,
        role: form.role
      }
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snakeForm)
      })
      if (res.status === 201) {
        setSuccess('회원가입이 완료되었습니다. 로그인 해주세요.')
        setForm({ email: '', password: '', name: '', role: '' })
      } else {
        const data = await res.json()
        throw new Error(data.error || '회원가입 실패')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1>회원가입</h1>
      <input name="email" placeholder="이메일" value={form.email} onChange={handleChange} />
      <input name="password" type="password" placeholder="패스워드" value={form.password} onChange={handleChange} />
      <input name="name" placeholder="이름" value={form.name} onChange={handleChange} />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="">역할 선택</option>
        <option value="mentor">멘토</option>
        <option value="mentee">멘티</option>
      </select>
      <button onClick={handleSignup} disabled={loading} style={{ padding: '8px 20px', fontSize: 16 }}>
        회원가입
      </button>
      <button type="button" onClick={onGoLogin} style={{ background: 'none', color: '#007bff', border: 'none', cursor: 'pointer', marginTop: 8 }}>
        로그인 화면으로 돌아가기
      </button>
      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: 'red' }}>에러: {error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  )
}
