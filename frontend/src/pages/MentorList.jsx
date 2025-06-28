import { useEffect, useState } from 'react'

export default function MentorList({ token, onRequestMatch }) {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [skill, setSkill] = useState('')
  const [orderBy, setOrderBy] = useState('')
  const [myRole, setMyRole] = useState(null)

  useEffect(() => {
    fetchMentors()
    fetchMyRole()
    // eslint-disable-next-line
  }, [])

  const fetchMentors = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = '/api/mentors'
      const params = []
      if (skill) params.push(`skill=${encodeURIComponent(skill)}`)
      if (orderBy) params.push(`orderBy=${orderBy}`)
      if (params.length) url += '?' + params.join('&')
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (!res.ok) throw new Error('멘토 목록 조회 실패: ' + res.status)
      const data = await res.json()
      setMentors(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 내 역할 조회
  const fetchMyRole = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      setMyRole(data.role)
    } catch {}
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1>멘토 리스트</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input placeholder="기술 스택으로 검색" value={skill} onChange={e => setSkill(e.target.value)} />
        <select value={orderBy} onChange={e => setOrderBy(e.target.value)}>
          <option value="">정렬 없음</option>
          <option value="skill">기술 스택</option>
          <option value="name">이름</option>
        </select>
        <button onClick={fetchMentors}>검색/정렬</button>
      </div>
      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {mentors.map(mentor => (
          <li key={mentor.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div><b>{mentor.profile.name}</b> ({mentor.email})</div>
            <div>기술: {mentor.profile.skills?.join(', ')}</div>
            <div>소개: {mentor.profile.bio}</div>
            <button onClick={() => onRequestMatch(mentor)} style={{ marginTop: 8 }} disabled={myRole === 'mentor'}>
              매칭 요청
            </button>
            {myRole === 'mentor' && <div style={{ color: 'gray', fontSize: 12 }}>멘토는 매칭 요청을 보낼 수 없습니다.</div>}
          </li>
        ))}
      </ul>
    </div>
  )
}
