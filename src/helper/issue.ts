export const decodedUpsertIssue = (body: string) => {
  try {
    const [id, download, authorStr] = body
      .split('\n')
      .filter(Boolean)
      .map(v => v.trim())
      .filter(v => !v.startsWith('###'))
    if (!id) throw new RangeError('not found plugin id')
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