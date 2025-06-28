import { useState } from 'react'

export default function Profile({ token }) {
  const [form, setForm] = useState({
    name: '',
    bio: '',
    skills: '', // 쉼표로 구분
    image: null,
    role: 'mentee' // 기본값: 멘티
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = e => {
    const { name, value, files } = e.target
    if (name === 'image') {
      setForm(prev => ({ ...prev, image: files[0] }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const body = {
        name: form.name,
        bio: form.bio,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        image: null, // 실제 구현 시 base64 인코딩 필요
        role: form.role
      }
      // snake_case로 변환
      const snakeBody = {
        name: body.name,
        bio: body.bio,
        skills: body.skills,
        image: body.image,
        role: body.role
      }
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(snakeBody)
      })
      if (!res.ok) throw new Error('프로필 저장 실패: ' + res.status)
      setSuccess('프로필이 저장되었습니다.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1>프로필 등록/수정</h1>
      <input name="name" placeholder="이름" value={form.name} onChange={handleChange} />
      <input name="bio" placeholder="소개글" value={form.bio} onChange={handleChange} />
      <input name="skills" placeholder="기술 스택 (쉼표로 구분)" value={form.skills} onChange={handleChange} />
      <select name="role" value={form.role} onChange={handleChange} disabled={form.role === 'mentor'}>
        <option value="mentee">멘티</option>
        <option value="mentor">멘토</option>
      </select>
      <input name="image" type="file" accept="image/png, image/jpeg" onChange={handleChange} />
      <button onClick={handleSave} disabled={loading} style={{ padding: '8px 20px', fontSize: 16 }}>
        프로필 저장
      </button>
      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: 'red' }}>에러: {error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  )
}
