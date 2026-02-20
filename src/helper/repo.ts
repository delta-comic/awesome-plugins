import { Octokit, type RestEndpointMethodTypes } from '@octokit/action'

export const getIssue = (issue_number: number) => {
  const octokit = new Octokit()
  const [owner = 'delta-comic', repo = 'awesome-plugins'] =
    process.env.GITHUB_REPOSITORY!.split('/')

  return octokit.rest.issues.get({ owner, repo, issue_number })
}

export const getAllOpenedIssue = async () => {
  const octokit = new Octokit()
  const [owner = 'delta-comic', repo = 'awesome-plugins'] =
    process.env.GITHUB_REPOSITORY!.split('/')

  const all = await octokit.paginate(octokit.rest.issues.listForRepo, {
    owner,
    repo,
    state: 'open',
    per_page: 40
  })

  const onlyIssues = all.filter(issue => !issue.pull_request)

  return onlyIssues
}

export const closeIssue = async (issue: Issue, cause: string) => {
  const octokit = new Octokit()
  const [owner = 'delta-comic', repo = 'awesome-plugins'] =
    process.env.GITHUB_REPOSITORY!.split('/')

  await sendComment(issue, cause)
  await octokit.rest.issues.update({ owner, repo, issue_number: issue.number, state: 'closed' })
}

export type Issue = RestEndpointMethodTypes['issues']['listForRepo']['response']['data'][number]

const me = 'delta-comic-bot@proton.me'

const crypto = new Bun.CryptoHasher('md5')
const getBodyHash = (item: { body?: string | null }) => {
  return crypto
    .copy()
    .update(item.body ?? '')
    .digest('hex')
}

export const isChecked = async (issue: Issue) => {
  const octokit = new Octokit()
  const [owner = 'delta-comic', repo = 'awesome-plugins'] =
    process.env.GITHUB_REPOSITORY!.split('/')

  const comments = await octokit.paginate(octokit.rest.issues.listComments, {
    owner,
    repo,
    per_page: 40,
    issue_number: issue.number
  })

  const mainHash = getBodyHash(issue)

  const lastMeComment = comments.findLast(c => c.user?.email)
  const hash = lastMeComment?.body?.split('$$').at(-1)
  if (mainHash == hash) {
  }
}

export const sendComment = (issue: Issue, body: string) => {
  const octokit = new Octokit()
  const [owner = 'delta-comic', repo = 'awesome-plugins'] =
    process.env.GITHUB_REPOSITORY!.split('/')

  body += `\n$$${getBodyHash(issue)}`

  return octokit.rest.issues.createComment({ owner, repo, issue_number: issue.number, body })
}