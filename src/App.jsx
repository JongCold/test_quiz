import { useState, useEffect } from 'react'
import quizData from './data/quiz-bank.json'

function App() {
  const [view, setView] = useState('home') // home, quiz, result
  const [selectedCategory, setSelectedCategory] = useState('')
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [userAnswer, setUserAnswer] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [wrongAnswers, setWrongAnswers] = useState([])

  const categories = [
    "AI 기본법",
    "국내 AI 규제/지침",
    "국외 AI 규제/지침",
    "국내외 공통된 규제/지침",
    "AI-MASTER 인증",
    "각종 AI 관련 가이드 및 규제"
  ]

  const shuffleArray = (array) => {
    const newArr = [...array]
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]]
    }
    return newArr
  }

  const startQuiz = (category) => {
    setSelectedCategory(category)
    // 필터링 및 셔플 (기획상 30문제이나 현재 데이터가 적을 경우 전체 사용)
    let filtered = quizData.filter(q => q.category === category)
    if (filtered.length === 0) filtered = quizData // Fallback if category empty
    
    const shuffled = shuffleArray(filtered).slice(0, 30)
    setQuestions(shuffled)
    setCurrentIndex(0)
    setScore(0)
    setWrongAnswers([])
    setUserAnswer(null)
    setShowExplanation(false)
    setView('quiz')
  }

  const handleOptionClick = (idx) => {
    if (showExplanation) return
    setUserAnswer(idx)
    setShowExplanation(true)
    
    if (idx === questions[currentIndex].answer) {
      setScore(prev => prev + 1)
    } else {
      setWrongAnswers(prev => [...prev, questions[currentIndex]])
    }
  }

  const handleDescriptiveSubmit = (text) => {
    if (showExplanation) return
    setUserAnswer(text)
    setShowExplanation(true)
    // 서술형은 자가 채점 또는 단순 완료 처리 (기획상 해설 노출 강조)
    setScore(prev => prev + 1) // 우선 정답 처리
  }

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1)
      setUserAnswer(null)
      setShowExplanation(false)
    } else {
      setView('result')
    }
  }

  const resetQuiz = () => {
    setView('home')
  }

  return (
    <div className="container">
      {view === 'home' && (
        <div className="home-view">
          <header style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1>AI 법령 퀴즈 마스터</h1>
            <p>AI 필기 시험 완벽 대비</p>
          </header>
          
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>학습 유형을 선택하세요:</p>
            {categories.map(cat => (
              <div key={cat} className="glass category-card" onClick={() => startQuiz(cat)}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{cat}</h3>
                <p style={{ fontSize: '0.85rem' }}>{cat} 관련 집중 심화 문제</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'quiz' && (
        <div className="quiz-view">
          <div className="quiz-header">
            <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>{selectedCategory}</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="question-box">
            <div className="question-text">{questions[currentIndex].question}</div>
            
            {questions[currentIndex].type === 'objective' ? (
              <div className="option-list">
                {questions[currentIndex].options.map((opt, idx) => {
                  let className = "option-item"
                  if (showExplanation) {
                    if (idx === questions[currentIndex].answer) className += " correct"
                    else if (userAnswer === idx) className += " wrong"
                  }
                  return (
                    <div key={idx} className={className} onClick={() => handleOptionClick(idx)}>
                      <span className="idx" style={{ opacity: 0.5 }}>{idx + 1}.</span>
                      <span className="txt">{opt}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="descriptive-input">
                <textarea 
                  className="glass" 
                  style={{ width: '100%', padding: '16px', color: 'white', borderRadius: '12px', minHeight: '120px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}
                  placeholder="답안을 작성해보세요..."
                  disabled={showExplanation}
                />
                {!showExplanation && (
                  <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => handleDescriptiveSubmit("done")}>
                    정답 확인하기
                  </button>
                )}
              </div>
            )}

            {showExplanation && (
              <div className="explanation-box">
                <p style={{ color: 'var(--text-main)', marginBottom: '8px' }}>
                  <strong>정답:</strong> {
                    questions[currentIndex].type === 'objective' 
                      ? questions[currentIndex].options[questions[currentIndex].answer] 
                      : questions[currentIndex].answer
                  }
                </p>
                <p style={{ fontSize: '0.95rem' }}>{questions[currentIndex].explanation}</p>
                <div className="source-tag">출처: {questions[currentIndex].source}</div>
                
                <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={nextQuestion}>
                  {currentIndex + 1 === questions.length ? '결과 보기' : '다음 문제'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'result' && (
        <div className="result-view" style={{ textAlign: 'center' }}>
          <h1>학습 완료!</h1>
          <p>수고하셨습니다. 학습 결과를 확인하세요.</p>
          
          <div className="result-stats">
            <div className="glass stat-card">
              <div className="stat-value">{Math.round((score / questions.length) * 100)}</div>
              <div className="stat-label">점수</div>
            </div>
            <div className="glass stat-card">
              <div className="stat-value">{score}/{questions.length}</div>
              <div className="stat-label">맞힌 문제</div>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <button className="btn btn-primary" onClick={resetQuiz}>다시 시작하기</button>
            <button className="btn btn-glass" onClick={resetQuiz}>홈으로 이동</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
