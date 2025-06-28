import { useState } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import MentorList from './pages/MentorList'
import MatchRequestModal from './pages/MatchRequestModal'
import IncomingMatchRequests from './pages/IncomingMatchRequests'
import OutgoingMatchRequests from './pages/OutgoingMatchRequests'
import MyProfile from './pages/MyProfile'
import './App.css'

function App() {
  const [view, setView] = useState('login')
  const [token, setToken] = useState(() => localStorage.getItem('jwtToken') || '')
  const [menteeId, setMenteeId] = useState(null)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [history, setHistory] = useState([])

  // 화면 이동 시 history에 이전 화면 저장
  const goTo = (nextView) => {
    setHistory((prev) => [...prev, view])
    setView(nextView)
  }
  // 뒤로 가기
  const goBack = () => {
    setView((prev) => {
      const last = history[history.length - 1]
      setHistory((h) => h.slice(0, -1))
      return last || 'login'
    })
  }

  // 로그인 성공 시 토큰 저장 및 프로필 화면 이동
  const handleLogin = (data) => {
    if (data.token) {
      setToken(data.token)
      localStorage.setItem('jwtToken', data.token)
      try {
        const payload = JSON.parse(atob(data.token.split('.')[1]))
        setMenteeId(payload.sub)
      } catch {}
      setHistory([])
      setView('profile')
    }
  }

  // 로그아웃
  const handleLogout = () => {
    setToken('')
    localStorage.removeItem('jwtToken')
    setHistory([])
    setView('login')
  }

  // 멘토 매칭 요청 버튼 클릭 시
  const handleRequestMatch = (mentor) => {
    setSelectedMentor(mentor)
    setShowMatchModal(true)
  }

  // 각 화면에 뒤로가기 버튼 추가
  const renderBackButton = () => (
    <button onClick={goBack} style={{ marginBottom: 16 }}>&larr; 뒤로가기</button>
  )

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 12 }}>
      {token && (
        <button onClick={handleLogout} style={{ position: 'absolute', top: 24, right: 24 }}>로그아웃</button>
      )}
      {view === 'login' && (
        <Login onLogin={handleLogin} onGoSignup={() => goTo('signup')} />
      )}
      {view === 'signup' && (
        <>
          {renderBackButton()}
          <Signup onGoLogin={() => goTo('login')} />
        </>
      )}
      {view === 'profile' && (
        <>
          <Profile token={token} />
          <button style={{ marginTop: 24 }} onClick={() => goTo('mentors')}>멘토 리스트 보기</button>
          <button style={{ marginTop: 8 }} onClick={() => goTo('incoming')}>받은 매칭 요청</button>
          <button style={{ marginTop: 8 }} onClick={() => goTo('outgoing')}>보낸 매칭 요청</button>
          <button style={{ marginTop: 8 }} onClick={() => goTo('me')}>내 정보 조회</button>
        </>
      )}
      {view === 'mentors' && (
        <>
          {renderBackButton()}
          <MentorList token={token} onRequestMatch={handleRequestMatch} />
        </>
      )}
      {view === 'incoming' && (
        <>
          {renderBackButton()}
          <IncomingMatchRequests token={token} />
        </>
      )}
      {view === 'outgoing' && (
        <>
          {renderBackButton()}
          <OutgoingMatchRequests token={token} />
        </>
      )}
      {view === 'me' && (
        <>
          {renderBackButton()}
          <MyProfile token={token} />
        </>
      )}
      {showMatchModal && (
        <MatchRequestModal mentor={selectedMentor} menteeId={menteeId} token={token} onClose={() => setShowMatchModal(false)} />
      )}
    </div>
  )
}

export default App
