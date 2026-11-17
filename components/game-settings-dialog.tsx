'use client'

import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'

type GameSettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: GameSettingsDraft
  onValuesChange: (values: GameSettingsDraft) => void
  onSave: (values: GameSettingsValues) => void
}

export type GameSettingsDraft = {
  boxCount: string
  lettersBefore: string
  answer: string
}

export type GameSettingsValues = {
  boxCount: number
  lettersBefore: string
  answer: string
}

function splitCharacters(value: string) {
  return Array.from(value.normalize('NFC'))
}

export function GameSettingsDialog({
  open,
  onOpenChange,
  values,
  onValuesChange,
  onSave,
}: GameSettingsDialogProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const parsedCount = Number(values.boxCount)
  const countIsValid = Number.isInteger(parsedCount) && parsedCount >= 1 && parsedCount <= 100
  const beforeCharacters = splitCharacters(values.lettersBefore)
  const answerCharacters = splitCharacters(values.answer)
  const countError = countIsValid ? '' : 'Nhập số ô chữ từ 1 đến 100.'
  const beforeError = !countIsValid
    ? 'Vui lòng nhập số ô chữ hợp lệ trước.'
    : beforeCharacters.length !== parsedCount
      ? `Cần đúng ${parsedCount} ký tự (${beforeCharacters.length}/${parsedCount}).`
      : ''
  const answerError = !countIsValid
    ? 'Vui lòng nhập số ô chữ hợp lệ trước.'
    : answerCharacters.length !== parsedCount
      ? `Cần đúng ${parsedCount} ký tự (${answerCharacters.length}/${parsedCount}).`
      : ''
  const previewCharacters = showAnswer ? answerCharacters : beforeCharacters
  const previewCount = countIsValid ? parsedCount : 0
  const canSave = countIsValid && !beforeError && !answerError

  function saveSettings() {
    if (!canSave) return
    onSave({
      boxCount: parsedCount,
      lettersBefore: values.lettersBefore.normalize('NFC'),
      answer: values.answer.normalize('NFC'),
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="game-dialog-backdrop" />
        <Dialog.Popup className="game-dialog-popup settings-dialog-popup">
          <Dialog.Title className="game-dialog-title">Cài đặt</Dialog.Title>
          <Dialog.Description className="settings-dialog-description">
            Cấu hình số ô chữ, chữ cái hiển thị ban đầu và đáp án.
          </Dialog.Description>
          <div className="settings-form">
            <div className="settings-field">
              <label className="settings-label" htmlFor="settings-box-count">Số ô chữ</label>
              <input
                className="settings-input"
                id="settings-box-count"
                type="number"
                min={1}
                max={100}
                step={1}
                value={values.boxCount}
                onChange={(event) => onValuesChange({ ...values, boxCount: event.target.value })}
                aria-invalid={Boolean(countError)}
                aria-describedby={countError ? 'settings-box-count-error' : undefined}
              />
              {countError && <p className="settings-error" id="settings-box-count-error">{countError}</p>}
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="settings-before">Sau khi mở</label>
              <input
                className="settings-input"
                id="settings-before"
                type="text"
                value={values.lettersBefore}
                onChange={(event) => onValuesChange({ ...values, lettersBefore: event.target.value })}
                aria-invalid={Boolean(beforeError)}
                aria-describedby={beforeError ? 'settings-before-error' : undefined}
              />
              {beforeError && <p className="settings-error" id="settings-before-error">{beforeError}</p>}
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="settings-answer">Câu trả lời</label>
              <input
                className="settings-input"
                id="settings-answer"
                type="text"
                value={values.answer}
                onChange={(event) => onValuesChange({ ...values, answer: event.target.value })}
                aria-invalid={Boolean(answerError)}
                aria-describedby={answerError ? 'settings-answer-error' : undefined}
              />
              {answerError && <p className="settings-error" id="settings-answer-error">{answerError}</p>}
            </div>
            <section className="settings-preview" aria-labelledby="settings-preview-title">
              <div className="settings-preview-header">
                <h3 className="settings-label" id="settings-preview-title">Xem trước</h3>
                <button className="settings-preview-toggle" type="button" onClick={() => setShowAnswer((visible) => !visible)}>
                  {showAnswer ? 'Xem sau khi mở' : 'Xem trả lời'}
                </button>
              </div>
              <div className="settings-preview-grid" aria-label={showAnswer ? 'Xem trước câu trả lời' : 'Xem trước chữ sau khi mở'}>
                {Array.from({ length: previewCount }, (_, index) => (
                  <span className="settings-preview-box" key={index}>{previewCharacters[index] ?? ''}</span>
                ))}
              </div>
            </section>
          </div>
          <div className="settings-dialog-actions">
            <Dialog.Close className="game-dialog-close settings-cancel">Đóng</Dialog.Close>
            <button className="settings-save" type="button" onClick={saveSettings} disabled={!canSave}>Lưu cài đặt</button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
