/**
 * AG Charts configuration factory functions.
 * These return plain option objects for use with the imperative AgCharts.create() API.
 */

export function createLineChart(data, xKey, yKey, title = '') {
  return {
    data,
    title: { text: title },
    series: [
      {
        type: 'line',
        xKey,
        yKey,
        stroke: '#3b82f6',
        marker: {
          fill: '#3b82f6',
          stroke: '#3b82f6',
        },
      },
    ],
    axes: [
      { type: 'category', position: 'bottom' },
      { type: 'number', position: 'left' },
    ],
  }
}

export function createBarChart(data, xKey, yKey, title = '') {
  return {
    data,
    title: { text: title },
    series: [
      {
        type: 'bar',
        xKey,
        yKey,
        fill: '#3b82f6',
        strokeWidth: 0,
      },
    ],
    axes: [
      { type: 'category', position: 'bottom' },
      { type: 'number', position: 'left' },
    ],
  }
}

export function createPieChart(data, angleKey, calloutLabelKey, title = '') {
  return {
    data,
    title: { text: title },
    series: [
      {
        type: 'pie',
        angleKey,
        calloutLabelKey,
        sectorLabelKey: angleKey,
        sectorLabel: {
          color: 'white',
          fontWeight: 'bold',
          formatter: ({ value }) => value.toFixed(0),
        },
      },
    ],
  }
}

export function createAreaChart(data, xKey, yKey, title = '') {
  return {
    data,
    title: { text: title },
    series: [
      {
        type: 'area',
        xKey,
        yKey,
        fill: '#3b82f6',
        fillOpacity: 0.3,
        stroke: '#3b82f6',
        marker: {
          fill: '#3b82f6',
          stroke: '#3b82f6',
        },
      },
    ],
    axes: [
      { type: 'category', position: 'bottom' },
      { type: 'number', position: 'left' },
    ],
  }
}

export function createMultiLineChart(data, xKey, yKeys, title = '') {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  const series = yKeys.map((yKey, index) => ({
    type: 'line',
    xKey,
    yKey,
    yName: yKey.charAt(0).toUpperCase() + yKey.slice(1).replace(/_/g, ' '),
    stroke: colors[index % colors.length],
    marker: {
      fill: colors[index % colors.length],
      stroke: colors[index % colors.length],
    },
  }))

  return {
    data,
    title: { text: title },
    series,
    axes: [
      { type: 'category', position: 'bottom' },
      { type: 'number', position: 'left' },
    ],
    legend: { enabled: true },
  }
}

export function createMultiBarChart(data, xKey, yKeys, title = '') {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  const series = yKeys.map((yKey, index) => ({
    type: 'bar',
    xKey,
    yKey,
    yName: yKey.charAt(0).toUpperCase() + yKey.slice(1).replace(/_/g, ' '),
    fill: colors[index % colors.length],
    strokeWidth: 0,
  }))

  return {
    data,
    title: { text: title },
    series,
    axes: [
      { type: 'category', position: 'bottom' },
      { type: 'number', position: 'left' },
    ],
    legend: { enabled: true },
  }
}
