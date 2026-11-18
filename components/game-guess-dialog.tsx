'use client'

import { Dialog } from '@base-ui/react/dialog'

type GameGuessDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  guess: string
  onGuessChange: (guess: string) => void
  onSubmitGuess: (guess: string) => void
}

export function GameGuessDialog({ open, onOpenChange, guess, onGuessChange, onSubmitGuess }: GameGuessDialogProps) {
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!guess.trim()) return
    onSubmitGuess(guess)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="game-dialog-backdrop" />
        <Dialog.Popup className="game-dialog-popup">
          <Dialog.Title className="game-dialog-title">Đoán đáp án</Dialog.Title>
          <Dialog.Description className="settings-dialog-description">
            Nhập đáp án của bạn.
          </Dialog.Description>
          <form className="settings-form" onSubmit={submit}>
            <div className="settings-field">
              <label className="settings-label" htmlFor="answer-guess">Đáp án</label>
              <input
                className="settings-input"
                id="answer-guess"
                type="text"
                autoComplete="off"
                maxLength={100}
                value={guess}
                onChange={(event) => onGuessChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
                }}
                placeholder="Nhập đáp án..."
              />
            </div>
            <div className="settings-dialog-actions">
              <Dialog.Close className="game-dialog-close settings-cancel" type="button">Hủy</Dialog.Close>
              <button className="settings-save" type="submit" disabled={!guess.trim()}>Xác nhận</button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
