import { STATUS_LABELS } from './format'
import type { SessionFilterValue } from './types'

const OPTIONS: { value: SessionFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'scheduled', label: STATUS_LABELS.scheduled },
  { value: 'completed', label: STATUS_LABELS.completed },
  { value: 'cancelled', label: STATUS_LABELS.cancelled },
]

interface Props {
  value: SessionFilterValue
  onChange: (value: SessionFilterValue) => void
}

export function SessionFilter({ value, onChange }: Props) {
  return (
    <fieldset className="ts-filter">
      <legend>Filter by status</legend>
      {OPTIONS.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name="status-filter"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}
