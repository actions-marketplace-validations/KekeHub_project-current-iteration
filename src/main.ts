import * as core from '@actions/core'
import {Config, Iterater} from './iterater'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

async function run(): Promise<void> {
  try {
    const config: Config = {
      app: {
        appId: core.getInput('app-integration-id') || '',
        installationId: core.getInput('app-installation-id') || '',
        privateKey: core.getInput('app-private-key') || ''
      },
      date: core.getInput('date'),
      iterationTitle: core.getInput('iteration-id', {required: true}),
      owner: core.getInput('owner', {required: true}),
      projectId: parseInt(core.getInput('project-id', {required: true}), 10),
      shift: parseInt(core.getInput('shift'), 10),
      timezone: core.getInput('timezone'),
      token: core.getInput('token', {required: true})
    }

    const assigner = new Iterater(config)
    await assigner.run()
  } catch (err: any) {
    core.setFailed(err.message)
    core.debug(err.stack)
  }
}

run()
