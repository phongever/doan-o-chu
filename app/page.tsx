'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Crown, Plus, RotateCcw, Square } from 'lucide-react'

type Player = { id: number; name: string; score: number; disabled: boolean }
type GameState = { revealed: boolean[]; players: Player[]; selectedPlayerId: number | null; winnerId: number | null }

const solution = ['M', 'Ỡ', 'Đ', 'Ấ', 'Y', 'M', 'À', 'H', 'Ú', 'P']
export default function Page() {
  const [revealed, setRevealed] = useState<boolean[]>(Array(10).fill(false))
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const [winnerId, setWinnerId] = useState<number | null>(null)
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
    }])
    setRevealed(next.revealed)
    setPlayers(next.players)
    setSelectedPlayerId(next.selectedPlayerId)
    setWinnerId(next.winnerId)
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
    })
    setName('')
  }

  function selectPlayer(id: number) {
    if (winnerId !== null) return
    record({ revealed, players, selectedPlayerId: id, winnerId })
  }

  function togglePlayer(id: number) {
    const player = players.find((item) => item.id === id)
    if (!player) return
    const disabling = !player.disabled
    record({
      revealed,
      players: players.map((item) => item.id === id ? { ...item, disabled: disabling } : item),
      selectedPlayerId: disabling && selectedPlayerId === id ? null : selectedPlayerId,
      winnerId,
    })
  }

  function undo() {
    const previous = history[history.length - 1]
    if (!previous) return
    setRevealed(previous.revealed)
    setPlayers(previous.players)
    setSelectedPlayerId(previous.selectedPlayerId)
    setWinnerId(previous.winnerId)
    setHistory((items) => items.slice(0, -1))
  }

  return (
    <main className="game-shell">
      <header className="topbar">
          <button className="undo-button" type="button" onClick={undo} disabled={!history.length} aria-label="Hoàn tác thao tác gần nhất"><RotateCcw size={16} /> <span>Hoàn tác</span></button>
      </header>

      <section className="game-content">
        <div className="puzzle" aria-label={`Đã mở ${revealed.filter(Boolean).length} trên 10 chữ cái`}>
          {solution.map((letter, letterIndex) => (
            <button
              className={`letter-tile${revealed[letterIndex] ? ' is-revealed' : ''}`}
              key={letterIndex}
              type="button"
              onClick={() => {
                const activePlayer = players.find((player) => player.id === selectedPlayerId && !player.disabled)
                if (revealed[letterIndex] || !activePlayer || winnerId !== null) return
                const nextRevealed = [...revealed]
                nextRevealed[letterIndex] = true
                const answerComplete = nextRevealed.every(Boolean)
                record({
                  revealed: nextRevealed,
                  players: players.map((player) => player.id === activePlayer.id ? { ...player, score: player.score + 1 } : player),
                  selectedPlayerId,
                  winnerId: answerComplete ? activePlayer.id : null,
                })
              }}
              disabled={!selectedPlayerId || winnerId !== null || revealed[letterIndex]}
              aria-label={revealed[letterIndex] ? `Chữ cái ${letter}` : !selectedPlayerId ? 'Chọn người chơi để mở chữ cái' : `Mở chữ cái thứ ${letterIndex + 1}`}
              aria-pressed={revealed[letterIndex]}
            >
              <span>{revealed[letterIndex] ? letter : ''}</span>
            </button>
          ))}
        </div>

        <section className="players-panel" aria-labelledby="players-heading">
          <div className="players-header">
            <h2 id="players-heading">Người chơi <span className="player-count">{players.length.toString().padStart(2, '0')}</span></h2>
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
                  <button className="stop-button" type="button" onClick={() => togglePlayer(player.id)} aria-label={`${player.disabled ? 'Bật lại' : 'Tạm dừng'} ${player.name}`} title={player.disabled ? 'Bật lại người chơi' : 'Tạm dừng người chơi'}><Square size={15} fill="currentColor" /></button>
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
