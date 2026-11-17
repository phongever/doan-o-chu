'use client'

import { Dialog } from '@base-ui/react/dialog'

type GameResultDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  topScorerNames: string[]
  answeringPlayerName: string
}

export function GameResultDialog({
  open,
  onOpenChange,
  topScorerNames,
  answeringPlayerName,
}: GameResultDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="result-dialog-backdrop" />
        <Dialog.Popup className="result-dialog-popup">
          <Dialog.Title className="result-dialog-title">Chúc mừng</Dialog.Title>
          <Dialog.Description className="result-dialog-body">
            <span className="result-award-card">
              <strong className="result-award-name">{topScorerNames.join(', ') || '—'}</strong>
              <span className="result-award-title">Giải nhất</span>
            </span>
            <span className="result-award-card">
              <strong className="result-award-name">{answeringPlayerName}</strong>
              <span className="result-award-title">Giải đặc biệt</span>
            </span>
          </Dialog.Description>
          <Dialog.Close className="result-dialog-close">Đóng</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
