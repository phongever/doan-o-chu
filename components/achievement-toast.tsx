export type AchievementNotice = {
  id: number
  title: string
  detail: string | null
  playerName: string
  letter: string
}

type AchievementToastProps = {
  notice: AchievementNotice
}

export function AchievementToast({ notice }: AchievementToastProps) {
  return (
    <aside className="achievement-toast" role="status" aria-live="polite" aria-atomic="true">
      <div className="achievement-toast-heading">
        <strong className="achievement-toast-title">{notice.title}</strong>
        {notice.detail && <span className="achievement-toast-detail">{notice.detail}</span>}
      </div>
      <div className="achievement-toast-details">
        <span className="achievement-toast-player">{notice.playerName}</span>
        <span className="achievement-toast-letter">{notice.letter}</span>
      </div>
    </aside>
  )
}
