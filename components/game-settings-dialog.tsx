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
  const beforeCharacters = splitCharacters(values.lettersBefore)
  const answerCharacters = splitCharacters(values.answer)
  const lengthsMatch = beforeCharacters.length === answerCharacters.length
  const beforeIsValid = beforeCharacters.length >= 1 && beforeCharacters.length <= 100
  const answerIsValid = answerCharacters.length >= 1 && answerCharacters.length <= 100
  const beforeError = !beforeIsValid
    ? 'Nhập từ 1 đến 100 ký tự.'
    : !lengthsMatch
      ? 'Độ dài của Ô chữ và Đáp án phải bằng nhau.'
      : ''
  const answerError = !answerIsValid
    ? 'Nhập từ 1 đến 100 ký tự.'
    : !lengthsMatch
      ? 'Độ dài của Ô chữ và Đáp án phải bằng nhau.'
      : ''
  const previewCharacters = showAnswer ? answerCharacters : beforeCharacters
  const canSave = beforeIsValid && answerIsValid && lengthsMatch

  function saveSettings() {
    if (!canSave) return
    onSave({
      boxCount: beforeCharacters.length,
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
            Cấu hình ô chữ hiển thị ban đầu và đáp án.
          </Dialog.Description>
          <div className="settings-form">
            <div className="settings-field">
              <label className="settings-label" htmlFor="settings-before">Ô chữ</label>
              <input
                className="settings-input"
                id="settings-before"
                type="text"
                maxLength={100}
                value={values.lettersBefore}
                onChange={(event) => onValuesChange({ ...values, lettersBefore: event.target.value })}
                aria-invalid={Boolean(beforeError)}
                aria-describedby={beforeError ? 'settings-before-error' : undefined}
              />
              {beforeError && <p className="settings-error" id="settings-before-error">{beforeError}</p>}
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="settings-answer">Đáp án</label>
              <input
                className="settings-input"
                id="settings-answer"
                type="text"
                maxLength={100}
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
                  {showAnswer ? 'Ô chữ' : 'Đáp án'}
                </button>
              </div>
              <div className="settings-preview-grid" aria-label={showAnswer ? 'Xem trước Đáp án' : 'Xem trước Ô chữ'}>
                {previewCharacters.map((character, index) => (
                  <span className="settings-preview-box" key={index}>{character}</span>
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
