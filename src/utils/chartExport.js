/**
 * Copy chart to clipboard as PNG image
 * @param {Object} chartRef - ag-Charts chart reference
 * @returns {Promise<boolean>} - Success status
 */
export async function copyChartToClipboard(chartRef) {
  if (!chartRef) {
    throw new Error('Chart reference is required')
  }

  try {
    // Check if Clipboard API is available
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Clipboard API not supported in this browser')
    }

    // Get the chart instance
    const chart = chartRef

    // ag-Charts v13+ provides async getImageDataURL method
    if (!chart.getImageDataURL) {
      throw new Error('Chart export not supported - getImageDataURL method not available')
    }

    // Get image data URL (async method in v13+)
    const imageData = await chart.getImageDataURL({ type: 'png' })

    if (!imageData) {
      throw new Error('Failed to generate image data')
    }

    // Convert data URL to blob
    const blob = await dataUrlToBlob(imageData)

    // Create ClipboardItem
    const clipboardItem = new ClipboardItem({
      'image/png': blob
    })

    // Write to clipboard
    await navigator.clipboard.write([clipboardItem])

    return true
  } catch (error) {
    console.error('Failed to copy chart to clipboard:', error)
    throw error
  }
}

/**
 * Download chart as PNG image
 * @param {Object} chartRef - ag-Charts chart reference
 * @param {string} filename - Download filename
 */
export async function downloadChart(chartRef, filename = 'chart.png') {
  if (!chartRef) {
    throw new Error('Chart reference is required')
  }

  try {
    // ag-Charts v13+ provides async download method
    if (chartRef.download) {
      // Use the built-in download method
      await chartRef.download({ fileName: filename })
    } else if (chartRef.getImageDataURL) {
      // Fallback to manual download using getImageDataURL
      const dataUrl = await chartRef.getImageDataURL({ type: 'png' })

      // Create download link
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      throw new Error('Chart export not supported')
    }
  } catch (error) {
    console.error('Failed to download chart:', error)
    throw error
  }
}

/**
 * Convert data URL to Blob
 * @param {string} dataUrl - Data URL
 * @returns {Promise<Blob>}
 */
function dataUrlToBlob(dataUrl) {
  return fetch(dataUrl).then(res => res.blob())
}

/**
 * Check if clipboard API is supported
 * @returns {boolean}
 */
export function isClipboardSupported() {
  return !!(navigator.clipboard && navigator.clipboard.write)
}
