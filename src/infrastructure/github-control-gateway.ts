import { Octokit } from 'octokit'

import type { PermissionLookup } from '../control/authorization'
import type { ControlGateway, ControlIssue } from '../control/controller'

const splitRepository = (repository: string): [owner: string, repo: string] => {
  const [owner, repo] = repository.split('/')
  if (!owner || !repo) throw new TypeError(`Invalid GitHub repository: ${repository}`)
  return [owner, repo]
}

export class GitHubControlGateway implements ControlGateway, PermissionLookup {
  readonly #owner: string
  readonly #repo: string

  constructor(
    private readonly octokit = new Octokit({ auth: process.env.GITHUB_TOKEN }),
    repository = process.env.GITHUB_REPOSITORY ?? 'delta-comic/awesome-plugins',
  ) {
    ;[this.#owner, this.#repo] = splitRepository(repository)
  }

  async getIssue(number: number): Promise<ControlIssue> {
    const { data } = await this.octokit.rest.issues.get({
      owner: this.#owner,
      repo: this.#repo,
      issue_number: number,
    })
    const actor = data.user?.login
    if (!actor) throw new Error(`Issue #${number} has no GitHub actor`)
    return { number: data.number, body: data.body ?? '', actor }
  }

  async wasProcessed(issueNumber: number, bodyHash: string) {
    const comments = await this.octokit.paginate(this.octokit.rest.issues.listComments, {
      owner: this.#owner,
      repo: this.#repo,
      issue_number: issueNumber,
      per_page: 100,
    })
    const marker = `<!-- registry-control:${bodyHash} -->`
    return comments.some(comment => comment.user?.type === 'Bot' && comment.body?.includes(marker))
  }

  async comment(issueNumber: number, body: string) {
    await this.octokit.rest.issues.createComment({
      owner: this.#owner,
      repo: this.#repo,
      issue_number: issueNumber,
      body,
    })
  }

  async close(issueNumber: number) {
    await this.octokit.rest.issues.update({
      owner: this.#owner,
      repo: this.#repo,
      issue_number: issueNumber,
      state: 'closed',
    })
  }

  async hasRepositoryWritePermission(repository: string, login: string) {
    const [owner, repo] = splitRepository(repository)
    try {
      const { data } = await this.octokit.rest.repos.getCollaboratorPermissionLevel({
        owner,
        repo,
        username: login,
      })
      return ['admin', 'maintain', 'write'].includes(data.permission)
    } catch (error) {
      if (
        (error as { status?: number }).status === 403 ||
        (error as { status?: number }).status === 404
      ) {
        return false
      }
      throw error
    }
  }
}