export const isGh = (input: string) => input.startsWith('gh:') && input.split('/').length === 2
export const decodeGh = (input: string) =>
  input.slice(3).split('/') as [owner: string, repo: string]