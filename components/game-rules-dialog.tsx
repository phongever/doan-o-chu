'use client'

import { Dialog } from '@base-ui/react/dialog'
import { Crown, TriangleAlert, Trophy } from 'lucide-react'

type GameRulesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GameRulesDialog({ open, onOpenChange }: GameRulesDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="game-dialog-backdrop" />
        <Dialog.Popup className="game-dialog-popup rules-dialog-popup">
          <Dialog.Title className="game-dialog-title">Luật chơi</Dialog.Title>
          <Dialog.Description className="sr-only">Quy tắc tính điểm và kết thúc cuộc chơi.</Dialog.Description>
          <ul className="rules-dialog-list">
            <li>Đoán đúng ô chữ, 1 điểm</li>
            <li>Đoán đúng đáp án, 3 điểm</li>
            <li><Crown size={18} strokeWidth={2.25} aria-hidden="true" />Người cao điểm nhất, giải nhất</li>
            <li><Trophy size={18} strokeWidth={2.25} aria-hidden="true" />Người đoán đúng đáp án, giải đặc biệt</li>
            <li className="rules-dialog-warning">
              <TriangleAlert size={18} strokeWidth={2.25} aria-hidden="true" />
              <span>ĐOÁN SAI, DỪNG CUỘC CHƠI</span>
            </li>
          </ul>
          <Dialog.Close className="game-dialog-close">Đóng</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
