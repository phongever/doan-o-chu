export type AchievementNotice = {
  id: number
  title: string
  playerName: string
  letter: string
}

type AchievementToastProps = {
  notice: AchievementNotice
}

export function AchievementToast({ notice }: AchievementToastProps) {
  return (
    <aside className="achievement-toast" role="status" aria-live="polite" aria-atomic="true">
      <div className="achievement-toast-line">
        <span className="achievement-toast-player">{notice.playerName}</span>
        <strong className="achievement-toast-title">{notice.title}</strong>
        <span className="achievement-toast-letter">{notice.letter}</span>
      </div>
    </aside>
  )
}
