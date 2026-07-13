import type { PluginListing } from '../domain/catalog'
import type { RepositoryReadme } from '../infrastructure/github-metadata'

export const README_GENERATED_MARKER = '<!-- Generated plugin catalog: do not edit below -->'
const LEGACY_GENERATED_MARKER = '<!-- Gen -->'

export interface ReadmeListing {
  plugin: PluginListing
  readme?: RepositoryReadme
}

const renderListing = ({ plugin, readme }: ReadmeListing) => {
  if (!plugin.repository) throw new TypeError(`Plugin ${plugin.id} has no GitHub metadata`)
  const { owner, name, url } = plugin.repository
  const readmeContent = readme?.content.replace(/[\t ]+$/gm, '').trim()
  return `### ${name}

[![Readme Card](https://wenxig-grs.vercel.app/api/pin/?username=${owner}&repo=${name}&user&theme=transparent)](${url})

**下载:**

\`\`\`sh
ap:${plugin.id}
\`\`\`

<details>
<summary>Readme</summary>

${readmeContent || '该仓库没有可用的 README。'}

</details>`
}

export const renderReadme = (current: string, listings: ReadmeListing[]) => {
  const markerOffset = [README_GENERATED_MARKER, LEGACY_GENERATED_MARKER]
    .map(marker => current.indexOf(marker))
    .filter(offset => offset >= 0)
    .sort((left, right) => left - right)[0]
  const introduction = (
    markerOffset === undefined ? current : current.slice(0, markerOffset)
  ).trimEnd()
  const generated = listings.map(renderListing).join('\n\n')
  return `${introduction}

${README_GENERATED_MARKER}

${generated}${generated ? '\n' : ''}`
}