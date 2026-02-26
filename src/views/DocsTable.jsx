import React from 'react'
import TableView from './TableView'

const DOCS_QUERY = `
  SELECT
    id,
    title,
    filename
  FROM markdown
  ORDER BY id
`

function DocTitleCellRenderer({ value, data }) {
  const slug = String(data?.filename || '').replace(/\.md$/i, '')
  return <a href={`#/docs/${slug}`}>{value}</a>
}

function DocFilenameCellRenderer({ value }) {
  const slug = String(value || '').replace(/\.md$/i, '')
  return <a href={`#/docs/${slug}`}>{value}</a>
}

const COLUMN_OVERRIDES = {
  title: { cellRenderer: DocTitleCellRenderer },
  filename: { cellRenderer: DocFilenameCellRenderer },
}

export default function DocsTable() {
  return (
    <TableView
      title="Docs"
      query={DOCS_QUERY}
      columnOverrides={COLUMN_OVERRIDES}
    />
  )
}
