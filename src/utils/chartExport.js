/**
 * Copy chart to clipboard as PNG image
 * @param {Object} chartInstance - ag-Charts chart instance (from AgChartsReact ref: ref.current.chart)
 * @returns {Promise<boolean>} - Success status
 */
export async function copyChartToClipboard(chartInstance) {
  if (!chartInstance) {
    throw new Error('Chart instance is required')
  }

  if (!navigator.clipboard || !navigator.clipboard.write) {
    throw new Error('Clipboard API not supported in this browser')
  }

  if (!chartInstance.getImageDataURL) {
    throw new Error('Chart export not supported - getImageDataURL method not available')
  }

  // In ag-charts v12, getImageDataURL may be synchronous; wrap with Promise.resolve for safety
  const imageData = await Promise.resolve(chartInstance.getImageDataURL({ type: 'png' }))

  if (!imageData) {
    throw new Error('Failed to generate image data')
  }

  const blob = await dataUrlToBlob(imageData)
  const clipboardItem = new ClipboardItem({ 'image/png': blob })
  await navigator.clipboard.write([clipboardItem])

  return true
}

/**
 * Download chart as PNG image
 * @param {Object} chartInstance - ag-Charts chart instance (from AgChartsReact ref: ref.current.chart)
 * @param {string} filename - Download filename
 */
export async function downloadChart(chartInstance, filename = 'chart.png') {
  if (!chartInstance) {
    throw new Error('Chart instance is required')
  }

  if (chartInstance.download) {
    await Promise.resolve(chartInstance.download({ fileName: filename }))
  } else if (chartInstance.getImageDataURL) {
    const dataUrl = await Promise.resolve(chartInstance.getImageDataURL({ type: 'png' }))
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    throw new Error('Chart export not supported')
  }
}

/**
 * Convert data URL to Blob
 */
function dataUrlToBlob(dataUrl) {
  return fetch(dataUrl).then(res => res.blob())
}

/**
 * Check if clipboard API is supported
 */
export function isClipboardSupported() {
  return !!(navigator.clipboard && navigator.clipboard.write)
}
