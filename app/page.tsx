'use client'

import { useMemo, useState } from 'react'
import { Plus, RotateCcw, Square } from 'lucide-react'

type Player = { id: number; name: string; score: number; disabled: boolean }
type GameState = { revealed: boolean[]; players: Player[] }

const solution = ['M', 'Ỡ', 'Đ', 'Ấ', 'Y', 'M', 'À', 'H', 'Ú', 'P']
export default function Page() {
  const [revealed, setRevealed] = useState<boolean[]>(Array(10).fill(false))
  const [players, setPlayers] = useState<Player[]>([])
  const [name, setName] = useState('')
  const [history, setHistory] = useState<GameState[]>([])
  const orderedPlayers = useMemo(() => [...players].sort((a, b) => Number(a.disabled) - Number(b.disabled) || b.score - a.score || a.id - b.id), [players])

  function record(next: GameState) {
    setHistory((previous) => [...previous, { revealed: [...revealed], players: players.map((player) => ({ ...player })) }])
    setRevealed(next.revealed)
    setPlayers(next.players)
  }

  function addPlayer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) return
    record({ revealed, players: [...players, { id: Date.now(), name: cleanName, score: 0, disabled: false }] })
    setName('')
  }

  function updatePlayer(id: number, update: (player: Player) => Player) {
    record({ revealed, players: players.map((player) => player.id === id ? update(player) : player) })
  }

  function undo() {
    const previous = history[history.length - 1]
    if (!previous) return
    setRevealed(previous.revealed)
    setPlayers(previous.players)
    setHistory((items) => items.slice(0, -1))
  }

  return (
    <main className="game-shell">
      <header className="topbar">
        <button className="undo-button" type="button" onClick={undo} disabled={!history.length} aria-label="Undo last action"><RotateCcw size={16} /> <span>Undo</span></button>
      </header>

      <section className="game-content">
        <div className="puzzle" aria-label={`${revealed.filter(Boolean).length} of 10 letters revealed`}>
          {solution.map((letter, letterIndex) => (
            <button
              className={`letter-tile${revealed[letterIndex] ? ' is-revealed' : ''}`}
              key={letterIndex}
              type="button"
              onClick={() => {
                if (revealed[letterIndex]) return
                const next = [...revealed]
                next[letterIndex] = true
                record({ revealed: next, players })
              }}
              aria-label={revealed[letterIndex] ? `Letter ${letter}` : `Reveal letter ${letterIndex + 1}`}
              aria-pressed={revealed[letterIndex]}
            >
              <span>{revealed[letterIndex] ? letter : ''}</span>
            </button>
          ))}
        </div>

        <section className="players-panel" aria-labelledby="players-heading">
          <div className="players-header">
            <h2 id="players-heading">Players <span className="player-count">{players.length.toString().padStart(2, '0')}</span></h2>
          </div>
          {players.length > 0 ? (
            <ol className="player-list">
              {orderedPlayers.map((player, index) => (
                <li className={`player-row${player.disabled ? ' is-disabled' : ''}`} key={player.id}>
                  <span className="player-rank">{String(index + 1).padStart(2, '0')}</span>
                  <span className="player-name">{player.name}<span className="player-status">{player.disabled ? 'PAUSED' : ''}</span></span>
                  <span className="player-score">{player.score}<small> PTS</small></span>
                  <button className="score-button" type="button" onClick={() => updatePlayer(player.id, (item) => ({ ...item, score: item.score + 1 }))} disabled={player.disabled} aria-label={`Add one point to ${player.name}`}>+1</button>
                  <button className="stop-button" type="button" onClick={() => updatePlayer(player.id, (item) => ({ ...item, disabled: !item.disabled }))} aria-label={`${player.disabled ? 'Enable' : 'Disable'} ${player.name}`} title={player.disabled ? 'Enable player' : 'Disable player'}><Square size={15} fill="currentColor" /></button>
                </li>
              ))}
            </ol>
          ) : <div className="empty-state"><span className="empty-dash">—</span><span>No players yet. Add your first player below.</span></div>}

          <form className="add-player-form" onSubmit={addPlayer}>
            <label className="sr-only" htmlFor="player-name">Player name</label>
            <input id="player-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter a player name..." maxLength={32} />
            <button className="add-button" type="submit" disabled={!name.trim()}><Plus size={17} /><span>Add player</span></button>
          </form>
        </section>
        <footer className="game-footer"><span>GOOD LUCK OUT THERE.</span><span>MAKE EVERY LETTER COUNT <span aria-hidden="true">↗</span></span></footer>
      </section>
    </main>
  )
}
