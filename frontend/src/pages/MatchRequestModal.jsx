import { useState } from 'react'

export default function MatchRequestModal({ mentor, menteeId, token, onClose, onSuccess }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSend = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/match-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mentor_id: mentor.id,
          mentee_id: menteeId,
          message
        })
      })
      if (!res.ok) throw new Error('매칭 요청 실패: ' + res.status)
      setSuccess('매칭 요청이 전송되었습니다.')
      onSuccess && onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mentor) return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 12, minWidth: 320 }}>
        <h2>멘토에게 매칭 요청</h2>
        <div>멘토: <b>{mentor.profile.name}</b></div>
        <textarea placeholder="요청 메시지" value={message} onChange={e => setMessage(e.target.value)} style={{ width: '100%', minHeight: 60, marginTop: 8 }} />
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button onClick={handleSend} disabled={loading}>요청 보내기</button>
          <button onClick={onClose}>닫기</button>
        </div>
        {loading && <p>로딩 중...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </div>
    </div>
  )
}
