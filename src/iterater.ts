import * as core from '@actions/core'
import {Field, IteratorField} from './fields'
import {Iteration, Settings} from './settings'
import dayjs, {Dayjs} from 'dayjs'
import {createAppAuth} from '@octokit/auth-app'
import {graphql} from '@octokit/graphql'

export interface Config {
  app: {
    appId: string
    installationId: string
    privateKey: string
  }

  date?: string
  iterationTitle: string
  owner: string
  projectId: number
  shift: number
  timezone?: string
  token: string
}

export class Iterater {
  #github
  #date: Dayjs

  constructor(private config: Config) {
    if (
      config.app.appId &&
      config.app.installationId &&
      config.app.privateKey
    ) {
      core.info('Use GitHub App credentials for this integration')
      const auth = createAppAuth(config.app)

      this.#github = graphql.defaults({
        request: {
          hook: auth.hook
        }
      })
    } else {
      core.info('Use GitHub token for this integration')
      this.#github = graphql.defaults({
        headers: {
          authorization: `token ${config.token}`
        }
      })
    }

    this.#date = this.config.date ? dayjs(this.config.date) : dayjs()
    if (this.config.timezone) {
      this.#date = this.#date.tz(this.config.timezone)
      core.debug(`Configure timezone ${this.config.timezone}`)
    }

    this.#date = this.#date.hour(0).minute(0).second(0)
    core.debug(`Targeted date is ${this.#date.format('YYYY-MM-DD')}`)
  }

  private async fetchFields(projectId: string): Promise<IteratorField[]> {
    const {node} = await this.#github(
      `query ($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectNext {
            fields(first: 20) {
              nodes {
                id
                name
                settings
              }
            }
          }
        }
      }`,
      {
        projectId
      }
    )

    const fs = node.fields.nodes.map((n: any) => {
      return {
        id: n.id,
        name: n.name,
        settings:
          n.settings === 'null'
            ? undefined
            : (JSON.parse(n.settings) as Settings)
      } as Field
    }) as Field[]

    return fs
      .filter(f => f.settings && f.settings.configuration)
      .map(f => f as IteratorField)
  }

  private async getProjectId(owner: string, num: number): Promise<string> {
    try {
      return await this.getOrganizationProjectId(owner, num)
    } catch (e) {
      core.debug("Couldn't find organization project, looking for user project")
      return await this.getUserProjectId(owner, num)
    }
  }

  private async getOrganizationProjectId(
    owner: string,
    num: number
  ): Promise<string> {
    const {organization} = await this.#github(
      `query ($owner: String!, $number: Int!) {
        organization(login: $owner){
          projectNext(number: $number) {
            id
          }
        }
    }`,
      {
        owner,
        number: num
      }
    )

    const id = organization.projectNext.id
    return id
  }

  private async getUserProjectId(login: string, num: number): Promise<string> {
    const {user} = await this.#github(
      `query ($owner: String!, $number: Int!) {
        user(login: $login){
          projectNext(number: $number) {
            id
          }
        }
    }`,
      {
        login,
        number: num
      }
    )

    const id = user.projectNext.id
    return id
  }

  private matchIteration(
    itrs: Iteration[],
    target: Dayjs
  ): Iteration | undefined {
    return itrs.find(itr => {
      const startDate = dayjs(itr.start_date).tz(this.config.timezone)
      const endDate = startDate.add(itr.duration, 'day')
      core.debug(
        `Comparing iteration start_date ${startDate} < ${target} < ${endDate} for ${itr.title}`
      )
      return target.isAfter(startDate) && target.isBefore(endDate)
    })
  }

  async run(): Promise<void> {
    const projectNodeId = await this.getProjectId(
      this.config.owner,
      this.config.projectId
    )

    const field = (await this.fetchFields(projectNodeId)).find(
      f => f.name === this.config.iterationTitle
    )

    if (!field) {
      throw new Error(`No matching found for ${this.config.iterationTitle}`)
    }

    this.matchIteration(field.settings.configuration.iterations, this.#date)
  }
}
