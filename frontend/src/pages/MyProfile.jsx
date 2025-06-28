import { useEffect, useState } from 'react'

export default function MyProfile({ token }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('내 정보 조회 실패: ' + res.status)
      const data = await res.json()
      setProfile(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>로딩 중...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!profile) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1>내 정보</h1>
      <div>이메일: {profile.email}</div>
      <div>이름: {profile.profile?.name}</div>
      <div>역할: {profile.role}</div>
      <div>소개: {profile.profile?.bio}</div>
      {profile.profile?.skills && <div>기술: {profile.profile.skills.join(', ')}</div>}
      <div>
        <img src={profile.profile?.imageUrl || (profile.role === 'mentor' ? 'https://placehold.co/500x500.jpg?text=MENTOR' : 'https://placehold.co/500x500.jpg?text=MENTEE')} alt="프로필" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
      </div>
    </div>
  )
}
