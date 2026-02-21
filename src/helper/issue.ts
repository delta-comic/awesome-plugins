export const decodedUpsertIssue = (body: string) => {
  try {
    let [id, download, authorStr] = body
      .split('\n')
      .filter(Boolean)
      .map(v => v.trim())
      .filter(v => !v.startsWith('###'))
    id = id?.trim()

    if (!id || /^[A-Za-z0-9\-_]+$/.test(id)) throw new RangeError('not allowed plugin id')
    if (!download) throw new RangeError('not found plugin download')
    if (!authorStr) throw new RangeError('not found plugin authorStr')

    const authors =
      authorStr == '_No response_'
        ? []
        : authorStr
            .split(',')
            .filter(Boolean)
            .map(v => v.trim())
    return { id, authors, download }
  } catch (err) {
    console.warn('fail to decode issue')
    console.error(err)
    return
  }
}

export interface ArchivePlugin {
  id: string
  download: string
  author: string[]
}

export const decodedRemoveIssue = (body: string) => {
  try {
    let [id] = body
      .split('\n')
      .filter(Boolean)
      .map(v => v.trim())
      .filter(v => !v.startsWith('###'))
    id = id?.trim()
    if (!id || /^[A-Za-z0-9\-_]+$/.test(id)) throw new RangeError('not found plugin id')

    return { id }
  } catch (err) {
    console.warn('fail to decode issue')
    console.error(err)
    return
  }
}