import { useEffect, useState } from 'react'

export default function OutgoingMatchRequests({ token }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchRequests()
    // eslint-disable-next-line
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/match-requests/outgoing', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('매칭 요청 목록 조회 실패: ' + res.status)
      const data = await res.json()
      // snake_case로 변환
      const snakeData = data.map(req => ({
        id: req.id,
        mentor_id: req.mentor_id ?? req.mentorId,
        status: req.status
      }))
      setRequests(snakeData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/match-requests/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('요청 취소 실패: ' + res.status)
      setSuccess('요청이 취소되었습니다.')
      fetchRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1>보낸 매칭 요청</h1>
      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {requests.map(req => (
          <li key={req.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div>멘토 ID: {req.mentor_id}</div>
            <div>상태: {req.status}</div>
            {req.status === 'pending' && (
              <button onClick={() => handleCancel(req.id)}>요청 취소</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
