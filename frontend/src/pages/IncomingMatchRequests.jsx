import { useEffect, useState } from 'react'

export default function IncomingMatchRequests({ token }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [myRole, setMyRole] = useState(null)

  useEffect(() => {
    fetchMyRole()
    // eslint-disable-next-line
  }, [])

  const fetchMyRole = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      setMyRole(data.role)
      if (data.role === 'mentor') fetchRequests()
    } catch {}
  }

  const fetchRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/match-requests/incoming', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('매칭 요청 목록 조회 실패: ' + res.status)
      const data = await res.json()
      setRequests(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id, action) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/match-requests/${id}/${action}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('요청 처리 실패: ' + res.status)
      setSuccess(`요청이 ${action === 'accept' ? '수락' : '거절'}되었습니다.`)
      fetchRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (myRole === null) return <p>로딩 중...</p>
  if (myRole === 'mentee') return <p>멘티는 받은 매칭 요청이 없습니다.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1>받은 매칭 요청</h1>
      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {requests.map(req => (
          <li key={req.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div>멘티 ID: {req.menteeId}</div>
            <div>메시지: {req.message}</div>
            <div>상태: {req.status}</div>
            {req.status === 'pending' && (
              <>
                <button onClick={() => handleAction(req.id, 'accept')}>수락</button>
                <button onClick={() => handleAction(req.id, 'reject')}>거절</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
