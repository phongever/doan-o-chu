'use client'

import { Dialog } from '@base-ui/react/dialog'

type GameResultDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  topScorerName: string
  answeringPlayerName: string
}

export function GameResultDialog({
  open,
  onOpenChange,
  topScorerName,
  answeringPlayerName,
}: GameResultDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="result-dialog-backdrop" />
        <Dialog.Popup className="result-dialog-popup">
          <Dialog.Title className="result-dialog-title">Chúc mừng</Dialog.Title>
          <Dialog.Description className="result-dialog-body">
            <span>Giải nhất: <strong>{topScorerName}</strong></span>
            <span>Giải đặc biệt: <strong>{answeringPlayerName}</strong></span>
          </Dialog.Description>
          <Dialog.Close className="result-dialog-close">Đóng</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
