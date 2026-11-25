'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { BookOpenText, Plus, RotateCcw, Square } from 'lucide-react'
import { AchievementToast, type AchievementNotice } from '@/components/achievement-toast'
import { GameResultDialog } from '@/components/game-result-dialog'
import { GameRulesDialog } from '@/components/game-rules-dialog'

type Player = { id: number; name: string; score: number; disabled: boolean; letterOpens: number; currentStreak: number }
type GameState = { revealed: boolean[]; players: Player[]; selectedPlayerId: number | null; winnerId: number | null; answerRevealed: boolean }

const defaultLetters = ['M', 'Ơ', 'Đ', 'Â', 'Y', 'M', 'A', 'H', 'U', 'P']
const defaultSolution = ['M', 'Ỡ', 'Đ', 'Ấ', 'Y', 'M', 'À', 'H', 'Ú', 'P']

function getStreakTitle(count: number) {
  if (count === 1) return 'Mở'
  if (count === 2) return 'Double kill'
  if (count === 3) return 'Triple kill'
  if (count === 4) return 'Quadra kill'
  if (count === 5) return 'Penta kill'
  return 'Mega kill'
}

export default function Page() {
  const letters = defaultLetters
  const solution = defaultSolution
  const [revealed, setRevealed] = useState<boolean[]>(Array(defaultLetters.length).fill(false))
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const [winnerId, setWinnerId] = useState<number | null>(null)
  const [answerRevealed, setAnswerRevealed] = useState(false)
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [history, setHistory] = useState<GameState[]>([])
  const [achievementNotice, setAchievementNotice] = useState<AchievementNotice | null>(null)
  const notificationId = useRef(0)
  const playerRows = useRef(new Map<number, HTMLLIElement>())
  const previousPositions = useRef(new Map<number, number>())
  const orderedPlayers = useMemo(() => [...players].sort((a, b) => Number(a.disabled) - Number(b.disabled) || b.score - a.score || a.id - b.id), [players])

  useLayoutEffect(() => {
    const nextPositions = new Map<number, number>()
    orderedPlayers.forEach((player) => {
      const row = playerRows.current.get(player.id)
      if (!row) return
      row.getAnimations().forEach((animation) => animation.cancel())
      const nextTop = row.offsetTop
      const previousTop = previousPositions.current.get(player.id)
      nextPositions.set(player.id, nextTop)
      if (previousTop === undefined || Math.abs(previousTop - nextTop) < 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      row.animate(
        [{ transform: `translateY(${previousTop - nextTop}px)` }, { transform: 'translateY(0)' }],
        { duration: 360, easing: 'cubic-bezier(.2,.75,.25,1)' },
      )
    })
    previousPositions.current = nextPositions
  }, [orderedPlayers])

  useEffect(() => {
    if (!achievementNotice) return
    const timeoutId = window.setTimeout(() => setAchievementNotice(null), 2800)
    return () => window.clearTimeout(timeoutId)
  }, [achievementNotice])

  function record(next: GameState) {
    setHistory((previous) => [...previous, {
      revealed: [...revealed],
      players: players.map((player) => ({ ...player })),
      selectedPlayerId,
      winnerId,
      answerRevealed,
    }])
    setRevealed(next.revealed)
    setPlayers(next.players)
    setSelectedPlayerId(next.selectedPlayerId)
    setWinnerId(next.winnerId)
    setAnswerRevealed(next.answerRevealed)
  }

  function addPlayer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName || answerRevealed) return
    const newPlayer = { id: Date.now(), name: cleanName, score: 0, disabled: false, letterOpens: 0, currentStreak: 0 }
    record({
      revealed,
      players: [...players.map((player) => ({ ...player, currentStreak: 0 })), newPlayer],
      selectedPlayerId: newPlayer.id,
      winnerId,
      answerRevealed,
    })
    setName('')
  }

  function selectPlayer(id: number) {
    if (winnerId !== null || answerRevealed) return
    const nextPlayers = id === selectedPlayerId
      ? players
      : players.map((player) => player.currentStreak === 0 ? player : { ...player, currentStreak: 0 })
    if (id !== selectedPlayerId) setAchievementNotice(null)
    record({ revealed, players: nextPlayers, selectedPlayerId: id, winnerId, answerRevealed })
  }

  function stopPlayer(id: number) {
    const player = players.find((item) => item.id === id)
    if (!player || player.disabled || answerRevealed) return
    record({
      revealed,
      players: players.map((item) => item.id === id ? { ...item, disabled: true } : item),
      selectedPlayerId: selectedPlayerId === id ? null : selectedPlayerId,
      winnerId,
      answerRevealed,
    })
  }

  function openLetterBox(letterIndex: number) {
    const activePlayer = players.find((player) => player.id === selectedPlayerId && !player.disabled)
    if (revealed[letterIndex] || !activePlayer || winnerId !== null) return

    const nextRevealed = [...revealed]
    nextRevealed[letterIndex] = true
    const nextStreak = activePlayer.currentStreak + 1
    const streakTitle = getStreakTitle(nextStreak)
    const isFirstBoardOpen = revealed.every((isRevealed) => !isRevealed)
    const isLastLetter = nextRevealed.every(Boolean)
    const notificationTitle = isFirstBoardOpen
      ? 'Chiến công đầu'
      : isLastLetter
        ? 'Quét sạch'
        : activePlayer.currentStreak === 0
          ? 'Mở'
          : streakTitle

    record({
      revealed: nextRevealed,
      players: players.map((player) => player.id === activePlayer.id
        ? { ...player, score: player.score + 1, letterOpens: player.letterOpens + 1, currentStreak: nextStreak }
        : player),
      selectedPlayerId,
      winnerId,
      answerRevealed,
    })

    setAchievementNotice({
      id: ++notificationId.current,
      title: notificationTitle,
      playerName: activePlayer.name,
      letter: letters[letterIndex],
    })
  }

  function revealAnswer() {
    const activePlayer = players.find((player) => player.id === selectedPlayerId && !player.disabled)
    if (!activePlayer || winnerId !== null || answerRevealed) return
    const unopenedLetterPoints = revealed.filter((isRevealed) => !isRevealed).length
    record({
      revealed: Array(defaultLetters.length).fill(true),
      players: players.map((player) => player.id === activePlayer.id
        ? { ...player, score: player.score + 3 + unopenedLetterPoints }
        : player),
      selectedPlayerId,
      winnerId: activePlayer.id,
      answerRevealed: true,
    })
  }

  function undo() {
    const previous = history[history.length - 1]
    if (!previous) return
    setRevealed(previous.revealed)
    setPlayers(previous.players)
    setSelectedPlayerId(previous.selectedPlayerId)
    setWinnerId(previous.winnerId)
    setAnswerRevealed(previous.answerRevealed)
    setResultDialogOpen(false)
    setAchievementNotice(null)
    setHistory((items) => items.slice(0, -1))
  }

  function playAgain() {
    setRevealed(Array(defaultLetters.length).fill(false))
    setPlayers([])
    setSelectedPlayerId(null)
    setWinnerId(null)
    setAnswerRevealed(false)
    setResultDialogOpen(false)
    setAchievementNotice(null)
    setName('')
    setHistory([])
  }

  const highestScore = players.reduce((highest, player) => Math.max(highest, player.score), Number.NEGATIVE_INFINITY)
  const topScorerNames = players.filter((player) => player.score === highestScore).map((player) => player.name)
  const answeringPlayer = players.find((player) => player.id === winnerId)
  const canReset = history.length > 0 || revealed.some(Boolean) || players.some((player) => player.score > 0 || player.disabled) || answerRevealed

  return (
    <main className="game-shell">
      {winnerId !== null && <div className="fireworks" aria-hidden="true">{['firework-one', 'firework-two', 'firework-three', 'firework-four', 'firework-five', 'firework-six'].map((burst) => <span className={`firework ${burst}`} key={burst}>{Array.from({ length: 18 }, (_, index) => <i className="firework-spark" key={index} style={{ '--spark-angle': `${index * 20}deg` } as React.CSSProperties} />)}</span>)}</div>}
      <header className="topbar">
        <div className="topbar-actions">
          <button className="undo-button" type="button" onClick={undo} disabled={!history.length} aria-label="Hoàn tác thao tác gần nhất"><RotateCcw size={16} /> <span>Hoàn tác</span></button>
          <button className="utility-button" type="button" onClick={() => setRulesDialogOpen(true)} aria-haspopup="dialog"><BookOpenText size={15} /><span>Luật chơi</span></button>
        </div>
      </header>

      <section className="game-content">
        <div className="puzzle" aria-label={`Đã mở ${revealed.filter(Boolean).length} trên ${defaultLetters.length} chữ cái`}>
          {letters.map((letter, letterIndex) => {
            const displayedLetter = answerRevealed ? solution[letterIndex] : letter
            return (
              <button
                className={`letter-tile${revealed[letterIndex] ? ' is-revealed' : ''}${answerRevealed ? ' answer-reveal' : ''}`}
                key={letterIndex}
                type="button"
                onClick={() => openLetterBox(letterIndex)}
                disabled={!selectedPlayerId || winnerId !== null || revealed[letterIndex]}
                aria-label={revealed[letterIndex] ? `Chữ cái ${displayedLetter}` : !selectedPlayerId ? 'Chọn người chơi để mở chữ cái' : `Mở chữ cái thứ ${letterIndex + 1}`}
                aria-pressed={revealed[letterIndex]}
                style={{ '--letter-index': letterIndex } as React.CSSProperties}
              >
                <span>{revealed[letterIndex] ? displayedLetter : ''}</span>
              </button>
            )
          })}
        </div>

        <section className="players-panel" aria-labelledby="players-heading">
          <div className="players-header">
            <h2 id="players-heading">Người chơi <span className="player-count">{players.length.toString().padStart(2, '0')}</span></h2>
            <button className="answer-button" type="button" onClick={answerRevealed ? () => setResultDialogOpen(true) : revealAnswer} disabled={!answerRevealed && (!players.some((player) => player.id === selectedPlayerId && !player.disabled) || winnerId !== null)}>{answerRevealed ? 'Xem kết quả' : 'Trả lời'}</button>
          </div>
          {players.length > 0 ? (
            <ol className={`player-list${orderedPlayers.length > 4 ? ' is-scrollable' : ''}`}>
              {orderedPlayers.map((player, index) => (
                <li className={`player-row${player.disabled ? ' is-disabled' : ''}${selectedPlayerId === player.id ? ' is-selected' : ''}`} key={player.id} ref={(element) => {
                  if (element) playerRows.current.set(player.id, element)
                  else playerRows.current.delete(player.id)
                }}>
                  <span className="player-rank">{String(index + 1).padStart(2, '0')}</span>
                  <button className="player-select" type="button" onClick={() => selectPlayer(player.id)} disabled={player.disabled || winnerId !== null || answerRevealed} aria-pressed={selectedPlayerId === player.id}>
                    <span className="player-name">{player.name}</span>
                    {selectedPlayerId === player.id && winnerId === null ? <span className="player-status">ĐANG CHƠI</span> : player.disabled ? <span className="player-status">ĐÃ TẠM DỪNG</span> : null}
                  </button>
                  <span className="player-score">{player.score}<small> ĐIỂM</small><span className="player-open-count">{player.letterOpens} ô mở</span></span>
                  {!player.disabled && !answerRevealed && <button className="stop-button" type="button" onClick={() => stopPlayer(player.id)} aria-label={`Tạm dừng ${player.name}`} title="Tạm dừng người chơi"><Square size={15} fill="currentColor" /></button>}
                </li>
              ))}
            </ol>
          ) : <div className="empty-state"><span className="empty-dash">—</span><span>Chưa có người chơi. Hãy thêm người chơi bên dưới.</span></div>}

          <form className="add-player-form" onSubmit={addPlayer}>
            <label className="sr-only" htmlFor="player-name">Tên người chơi</label>
            <input id="player-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nhập tên người chơi..." maxLength={32} disabled={answerRevealed} />
            <button className="add-button" type="submit" disabled={answerRevealed || !name.trim()}><Plus size={17} /><span>Thêm người chơi</span></button>
          </form>
        </section>
      </section>
      <footer className="app-footer">
        <div className="footer-marquee">
          <div className="footer-marquee__track">
            <span className="footer-marquee__copy">f Dầu f Mỡ ai lỡ f My Quốc Phong Long vô 1 nhóm 🤔<br />Ai? Nà Ai?</span>
          </div>
        </div>
      </footer>
      {achievementNotice && <AchievementToast key={achievementNotice.id} notice={achievementNotice} />}
      <GameRulesDialog open={rulesDialogOpen} onOpenChange={setRulesDialogOpen} />
      <GameResultDialog
        open={resultDialogOpen}
        onOpenChange={setResultDialogOpen}
        topScorerNames={topScorerNames}
        answeringPlayerName={answeringPlayer?.name ?? '—'}
      />
    </main>
  )
}
