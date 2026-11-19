'use client'

import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Crown, Heart, Trophy } from 'lucide-react'

type GameResultDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  topScorerNames: string[]
  answeringPlayerName: string
}

const giftImage = {
  src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%20dang%20tay%20v%E1%BB%9Bi%20n%E1%BB%81n%20tim%20h%E1%BB%93ng-AxHG8HyvgeSaSpBeU6gaWI7Q7y81Fa.png',
  alt: 'Người đàn ông dang tay với nền tim hồng',
}

const flyingHearts = [
  { x: '-6%', y: '6%', delay: '0s' },
  { x: '44%', y: '-4%', delay: '0.4s' },
  { x: '96%', y: '10%', delay: '0.8s' },
  { x: '-4%', y: '48%', delay: '1.2s' },
  { x: '98%', y: '52%', delay: '0.2s' },
  { x: '-2%', y: '88%', delay: '0.6s' },
  { x: '50%', y: '98%', delay: '1s' },
  { x: '92%', y: '90%', delay: '1.4s' },
]

export function GameResultDialog({
  open,
  onOpenChange,
  topScorerNames,
  answeringPlayerName,
}: GameResultDialogProps) {
  const [giftOpened, setGiftOpened] = useState(false)

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setGiftOpened(false)
    onOpenChange(nextOpen)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="result-dialog-backdrop" />
        <Dialog.Popup className="result-dialog-popup">
          <Dialog.Title className="result-dialog-title">Chúc mừng</Dialog.Title>
          {giftOpened ? (
            <div className="gift-reveal">
              <div className="gift-hearts" aria-hidden="true">
                {flyingHearts.map((heart, index) => (
                  <Heart
                    key={index}
                    className="flying-heart"
                    size={22}
                    fill="currentColor"
                    strokeWidth={0}
                    style={{ '--heart-x': heart.x, '--heart-y': heart.y, '--heart-delay': heart.delay } as React.CSSProperties}
                  />
                ))}
              </div>
              <img className="gift-image" src={giftImage.src} alt={giftImage.alt} />
            </div>
          ) : (
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
                <button className="gift-button" type="button" onClick={() => setGiftOpened(true)}>Mở quà</button>
              </span>
            </Dialog.Description>
          )}
          <Dialog.Close className="result-dialog-close">Đóng</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
