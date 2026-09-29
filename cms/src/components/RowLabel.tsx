'use client'
import { useRowLabel } from '@payloadcms/ui'

// Array row titles in the admin, so collapsed lists read "Fasad", "Lantai 1", …
// instead of "Row 01", "Row 02".
const make = (field: string) =>
  function RowLabel() {
    const { data, rowNumber } = useRowLabel<Record<string, string>>()
    return <>{data?.[field] || `Row ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</>
  }

export const NameRowLabel = make('name')
export const LabelRowLabel = make('label')
export const TitleRowLabel = make('title')
