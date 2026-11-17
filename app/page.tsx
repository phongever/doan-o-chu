'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Crown, Plus, RotateCcw, Square } from 'lucide-react'

type Player = { id: number; name: string; score: number; disabled: boolean }
type GameState = { revealed: boolean[]; players: Player[]; selectedPlayerId: number | null; winnerId: number | null; answerRevealed: boolean }

const letters = ['M', 'Ơ', 'Đ', 'Â', 'Y', 'M', 'A', 'H', 'U', 'P']
const solution = ['M', 'Ỡ', 'Đ', 'Ấ', 'Y', 'M', 'À', 'H', 'Ú', 'P']
export default function Page() {
  const [revealed, setRevealed] = useState<boolean[]>(Array(10).fill(false))
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const [winnerId, setWinnerId] = useState<number | null>(null)
  const [answerRevealed, setAnswerRevealed] = useState(false)
  const [name, setName] = useState('')
  const [history, setHistory] = useState<GameState[]>([])
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
    if (!cleanName) return
    record({
      revealed,
      players: [...players, { id: Date.now(), name: cleanName, score: 0, disabled: false }],
      selectedPlayerId,
      winnerId,
      answerRevealed,
    })
    setName('')
  }

  function selectPlayer(id: number) {
    if (winnerId !== null || answerRevealed) return
    record({ revealed, players, selectedPlayerId: id, winnerId, answerRevealed })
  }

  function stopPlayer(id: number) {
    const player = players.find((item) => item.id === id)
    if (!player || player.disabled) return
    record({
      revealed,
      players: players.map((item) => item.id === id ? { ...item, disabled: true } : item),
      selectedPlayerId: selectedPlayerId === id ? null : selectedPlayerId,
      winnerId,
      answerRevealed,
    })
  }

  function answer() {
    const activePlayer = players.find((player) => player.id === selectedPlayerId && !player.disabled)
    if (!activePlayer || winnerId !== null) return
    const unrevealedCount = revealed.filter((isRevealed) => !isRevealed).length
    record({
      revealed: Array(letters.length).fill(true),
      players: players.map((player) => player.id === activePlayer.id ? { ...player, score: player.score + unrevealedCount + 3 } : player),
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
    setHistory((items) => items.slice(0, -1))
  }

  function playAgain() {
    setRevealed(Array(letters.length).fill(false))
    setPlayers((currentPlayers) => currentPlayers.map((player) => ({ ...player, score: 0, disabled: false })))
    setSelectedPlayerId(null)
    setWinnerId(null)
    setAnswerRevealed(false)
    setHistory([])
  }

  const canReset = history.length > 0 || revealed.some(Boolean) || players.some((player) => player.score > 0 || player.disabled) || answerRevealed

  return (
    <main className="game-shell">
      {answerRevealed && <div className="fireworks" aria-hidden="true"><span className="firework firework-one" /><span className="firework firework-two" /><span className="firework firework-three" /></div>}
      <header className="topbar">
        <div className="topbar-actions">
          <button className="undo-button" type="button" onClick={undo} disabled={!history.length} aria-label="Hoàn tác thao tác gần nhất"><RotateCcw size={16} /> <span>Hoàn tác</span></button>
          <button className="replay-button" type="button" onClick={playAgain} disabled={!canReset}>Chơi lại</button>
        </div>
      </header>

      <section className="game-content">
        <div className="puzzle" aria-label={`Đã mở ${revealed.filter(Boolean).length} trên 10 chữ cái`}>
          {letters.map((letter, letterIndex) => {
            const displayedLetter = answerRevealed ? solution[letterIndex] : letter
            return (
              <button
                className={`letter-tile${revealed[letterIndex] ? ' is-revealed' : ''}${answerRevealed ? ' answer-reveal' : ''}`}
                key={letterIndex}
                type="button"
                onClick={() => {
                  const activePlayer = players.find((player) => player.id === selectedPlayerId && !player.disabled)
                  if (revealed[letterIndex] || !activePlayer || winnerId !== null) return
                  const nextRevealed = [...revealed]
                  nextRevealed[letterIndex] = true
                  record({
                    revealed: nextRevealed,
                    players: players.map((player) => player.id === activePlayer.id ? { ...player, score: player.score + 1 } : player),
                    selectedPlayerId,
                    winnerId,
                    answerRevealed,
                  })
                }}
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
          </div>
          <div className="answer-action">
            <button className="answer-button" type="button" onClick={answer} disabled={!players.some((player) => player.id === selectedPlayerId && !player.disabled) || winnerId !== null}>Trả lời</button>
          </div>
          {players.length > 0 ? (
            <ol className="player-list">
              {orderedPlayers.map((player, index) => (
                <li className={`player-row${player.disabled ? ' is-disabled' : ''}${selectedPlayerId === player.id ? ' is-selected' : ''}`} key={player.id} ref={(element) => {
                  if (element) playerRows.current.set(player.id, element)
                  else playerRows.current.delete(player.id)
                }}>
                  <span className="player-rank">{String(index + 1).padStart(2, '0')}</span>
                  <button className="player-select" type="button" onClick={() => selectPlayer(player.id)} disabled={player.disabled || winnerId !== null} aria-pressed={selectedPlayerId === player.id}>
                    <span className="player-name">{player.name}</span>
                    {winnerId === player.id ? <Crown className="winner-crown" size={16} aria-label="Người chiến thắng" /> : selectedPlayerId === player.id ? <span className="player-status">ĐANG CHƠI</span> : player.disabled ? <span className="player-status">ĐÃ TẠM DỪNG</span> : null}
                  </button>
                  <span className="player-score">{player.score}<small> ĐIỂM</small></span>
                  <button className="stop-button" type="button" onClick={() => stopPlayer(player.id)} disabled={player.disabled} aria-label={`${player.disabled ? 'Đã tạm dừng' : 'Tạm dừng'} ${player.name}`} title={player.disabled ? 'Người chơi đã tạm dừng' : 'Tạm dừng người chơi'}><Square size={15} fill="currentColor" /></button>
                </li>
              ))}
            </ol>
          ) : <div className="empty-state"><span className="empty-dash">—</span><span>Chưa có người chơi. Hãy thêm người chơi bên dưới.</span></div>}

          <form className="add-player-form" onSubmit={addPlayer}>
            <label className="sr-only" htmlFor="player-name">Tên người chơi</label>
            <input id="player-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nhập tên người chơi..." maxLength={32} />
            <button className="add-button" type="submit" disabled={!name.trim()}><Plus size={17} /><span>Thêm người chơi</span></button>
          </form>
        </section>
      </section>
    </main>
  )
}
