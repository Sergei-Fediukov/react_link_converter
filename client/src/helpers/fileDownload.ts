export const fileDownload = async ({ fileName, resourceName, resourceUrl }: any, type: string) => {
  const response = await fetch(resourceUrl)
  if (!response.ok) {
    console.error('File download response error:', response.status, response.statusText)
    return
  }
  const arrayBuffer = await response.arrayBuffer()
  const blob = new Blob([arrayBuffer])
  const objectUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = `${resourceName || fileName}.${type.toLowerCase()}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(objectUrl)
}
