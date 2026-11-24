'use client'

import { Dialog } from '@base-ui/react/dialog'
import { Crown, Gift, Trophy } from 'lucide-react'
import { useRef, useState } from 'react'

type GameResultDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  topScorerNames: string[]
  answeringPlayerName: string
}

const giftPhotoSrc = '/gift-reveal.png'

export function GameResultDialog({
  open,
  onOpenChange,
  topScorerNames,
  answeringPlayerName,
}: GameResultDialogProps) {
  const [giftPhotoOpen, setGiftPhotoOpen] = useState(false)
  const giftPhotoRef = useRef<HTMLImageElement | null>(null)

  function preloadGiftPhoto() {
    if (giftPhotoRef.current) return
    const image = new Image()
    image.src = giftPhotoSrc
    giftPhotoRef.current = image
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="result-dialog-backdrop" />
        <Dialog.Popup className="result-dialog-popup">
          <Dialog.Title className="result-dialog-title">🎉Chúc mừng🎉</Dialog.Title>
          <Dialog.Description className="result-dialog-body">
            <span className="result-award-card">
              <Crown className="result-award-icon" size={32} strokeWidth={2.25} aria-hidden="true" />
              <span className="result-award-title">Giải nhất</span>
              <span className="result-award-winners">
                {topScorerNames.length > 0 ? topScorerNames.map((name, index) => (
                  <strong className="result-award-name" key={`${name}-${index}`}>{name}</strong>
                )) : <strong className="result-award-name">—</strong>}
              </span>
            </span>
            <span className="result-award-card">
              <Trophy className="result-award-icon" size={32} strokeWidth={2.25} aria-hidden="true" />
              <span className="result-award-title">Giải đặc biệt</span>
              <strong className="result-award-name">{answeringPlayerName}</strong>
              <button
                className="result-open-gift"
                type="button"
                onMouseEnter={preloadGiftPhoto}
                onFocus={preloadGiftPhoto}
                onClick={() => setGiftPhotoOpen(true)}
              >
                <Gift size={15} aria-hidden="true" />
                <span>Mở quà</span>
              </button>
            </span>
          </Dialog.Description>
          <Dialog.Close className="result-dialog-close">Đóng</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>

        <Dialog.Root open={giftPhotoOpen} onOpenChange={setGiftPhotoOpen}>
          <Dialog.Portal>
            <Dialog.Backdrop className="gift-reveal-backdrop" />
            <Dialog.Popup className="gift-reveal-popup">
              <Dialog.Title className="sr-only">Món quà đặc biệt</Dialog.Title>
              <Dialog.Description className="sr-only">
                Ảnh món quà dành cho người đoán đúng đáp án.
              </Dialog.Description>
              <img
                className="gift-reveal-image"
                src={giftPhotoSrc}
                alt="Người đàn ông dang tay trên nền hồng với những trái tim"
              />
              <Dialog.Close className="gift-reveal-close" type="button">
                Đóng ảnh
              </Dialog.Close>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </Dialog.Root>
    )
  }
