import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useDuckDB } from '../hooks/useDuckDB'
import styles from './DocPage.module.css'

export default function DocPage() {
  const { slug } = useParams()
  const { queryToArray } = useDuckDB()

  const [content, setContent] = useState(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadDoc = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Allow only safe filename characters to prevent SQL injection
      const safeSlug = slug.replace(/[^a-zA-Z0-9\-_.]/g, '')

      const data = await queryToArray(
        `SELECT title, content FROM markdown WHERE filename = '${safeSlug}.md'`
      )

      if (data.length === 0) {
        setError(`Document not found: ${slug}`)
        return
      }

      const row = data[0]
      // Convert DuckDB Arrow proxy to plain string
      setTitle(String(row.title ?? ''))
      setContent(String(row.content ?? ''))
    } catch (err) {
      setError(err.message)
      console.error('Failed to load document:', err)
    } finally {
      setLoading(false)
    }
  }, [slug, queryToArray])

  useEffect(() => {
    loadDoc()
  }, [loadDoc])

  return (
    <div className={styles.docPage}>
      <div className={styles.docNav}>
        <Link to="/docs" className={styles.backLink}>&#8592; Back to Docs</Link>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading document...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      ) : content !== null ? (
        <article className={styles.docContent}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>
      ) : null}
    </div>
  )
}
