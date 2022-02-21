# Project Current Iteration
[![CI][CI]][CI-status]
[![GitHub Marketplace][MarketPlace]][MarketPlace-status]
[![Mergify Status][mergify-status]][mergify]

A GitHub Action that fetches the current iteration for a project. You can not only get the Iteration, but you can also get information about the previous and next iteration by using shift.

## Usage

This is the basic usage.

```yml
steps:
    - name: Get current iteration
      uses: KekeHub/project-current-iteration@v1
      with:
        project-id: 1
        iterator-title: "Sprint"
```

Note that this can be used for either organization or user projects.
Please see the following sections for details.

## Authorization

The default workflow GitHub token `${{ secrets.GITHUB_TOKEN }}` doesn't have enough permissions so you need to create a GitHub PAT or a GitHub App.
There are two ways to setup the client credentials.

<details><summary>GitHub PAT</summary>

### Using GitHub PAT

Please create a PAT with the following permissions.

* `repo`
* `admin:org`

Then pass it thought the `token` arguments.

```yml
steps:
    - name: Assign issue to organization project
      uses: KekeHub/project-current-iterator@v1
      with:
        fields: |
          Status="In Progress"
          Text="Hello!"
```

💡 Note that GitHub App described in the next sections has granular permissions and it's strongly recommended.

</details>

<details><summary>GitHub App</summary>

### Using GitHub App

Please create a GitHub App with the following permissions and install to the directory which will refer the issues or the pull requests.

* Repository
    * Issue: `Read only`
* Organization:
    * Project: `Read and write`

Then pass it thought the GitHub app arguments.

```yml
steps:
    - name: Assign issue to organization project
      uses: KekeHub/project-current-iterator@v1
      with:
        app-integration-id: ${{ secrets.MYBOT_INTEGRATION_ID }}
        app-installation-id: ${{ secrets.MYBOT_INSTALLATION_ID }}
        app-private-key: ${{ secrets.MYBOT_PRIVATE_KEY }}
```

If any of these arguments are missing, the `${{ secrets.GITHUB_TOKEN }}` will get used.

</details>

## Inputs

| NAME                 | DESCRIPTION                                                                                                                           | TYPE     | REQUIRED | DEFAULT               |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------|----------|----------|-----------------------|
| `app-integration-id` | ID of the GiHub App a.k.a App ID                                                                                                      | `number` | `false`  |                       |
| `app-private-key`    | Private key of the GitHub App.                                                                                                        | `string` | `false`  |                       |
| `date`               | Date to lookup the iteration                                                                                                          | `string` | `false`  | Now                   |
| `iteration-title`    | Title of the iterator field e.g. `Sprint`                                                                                             | `string` | `true`   |                       |
| `project-id`         | ID (Number) of the project e.g.) `1`                                                                                                  | `number` | `true`   |                       |
| `owner`              | Owner (organization or username) of the project. a.k.a `login`                                                                        |          |          |                       |
| `shift`              | Index to shift. `1` means next iteration, `-1` means previous iteration.                                                              | `number` | `false`  | `0`                   |
| `timezone`           | Timezone used to get the current date based on [Timezone database name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) | `string` | `false`  | ``                    |
| `token`              | A GitHub token. If GitHub App arguments are configured, this argument will be ignored.                                                | `string` | `false`  | `${{ github.token }}` |

## Outputs

| NAME                   | DESCRIPTION                                   | TYPE     |
|------------------------|-----------------------------------------------|----------|
| `iteration-id`         | ID of the iteration                           | `string` |
| `iteration-title`      | Title of the iteration                        | `string` |
| `iteration-start-date` | Start date of the iteration                   | `string` |
| `project-id`           | Project's node ID e.g.) `PN_kwDOBSAANN4AAhd4` | `number` |

## Use cases

### Assign an issue or a pull request to organization project

By using with [KekeHub/update-project-item-fields](https://github.com/KekeHub/update-project-item-fields), you can update project item with current iteration.

```yml
name: Assign to project when issue or pull request is created
on:
  issues: [opened]
  pull_request: [opened]

steps:
    - name: Assign to project
      uses: KekeHub/project-current-iteration@v1
      id: project-current-iteration
      with: 
        app-integration-id: ${{ secrets.MYBOT_INTEGRATION_ID }}
        app-installation-id: ${{ secrets.MYBOT_INSTALLATION_ID }}
        app-private-key: ${{ secrets.MYBOT_PRIVATE_KEY }}
        project-id: 1

    - name: Updates the Status field
      uses: KekeHub/update-project-item-fields@v1
      with:
        app-integration-id: ${{ secrets.MYBOT_INTEGRATION_ID }}
        app-installation-id: ${{ secrets.MYBOT_INSTALLATION_ID }}
        app-private-key: ${{ secrets.MYBOT_PRIVATE_KEY }}
        fields: |
          Status=In Progress
          Iteration=${{ steps.project-current-iteration.outputs.project-current-iteration.iterator-title }}
          Date=2022/02/11
        project-id: 1
        project-item-id: PNI_lADOBfaB-d4AA0lSzzAk718
```

## Related Actions

* [KekeHub/project-current-iterator](https://github.com/KekeHub/project-current-iterator)
  * GitHub Action to assign an issue or a pull request to a project
* [KekeHub/update-project-item-fields@v1](https://github.com/KekeHub/update-project-item-fields@v1)
  * GitHub Action to update the fields of the project

## License

[MIT](LICENSE)

<!-- Badge links -->
[CI]: https://github.com/KekeHub/project-current-iterator/workflows/CI/badge.svg
[CI-status]: https://github.com/KekeHub/project-current-iterator/actions?query=workflow%3Abuild-test

[MarketPlace]: https://img.shields.io/badge/Marketplace-Assign%20Org%20Project-blue.svg?colorA=24292e&colorB=0366d6&style=flat&longCache=true&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAM6wAADOsB5dZE0gAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAERSURBVCiRhZG/SsMxFEZPfsVJ61jbxaF0cRQRcRJ9hlYn30IHN/+9iquDCOIsblIrOjqKgy5aKoJQj4O3EEtbPwhJbr6Te28CmdSKeqzeqr0YbfVIrTBKakvtOl5dtTkK+v4HfA9PEyBFCY9AGVgCBLaBp1jPAyfAJ/AAdIEG0dNAiyP7+K1qIfMdonZic6+WJoBJvQlvuwDqcXadUuqPA1NKAlexbRTAIMvMOCjTbMwl1LtI/6KWJ5Q6rT6Ht1MA58AX8Apcqqt5r2qhrgAXQC3CZ6i1+KMd9TRu3MvA3aH/fFPnBodb6oe6HM8+lYHrGdRXW8M9bMZtPXUji69lmf5Cmamq7quNLFZXD9Rq7v0Bpc1o/tp0fisAAAAASUVORK5CYII=
[MarketPlace-status]: https://github.com/marketplace/actions/project-current-iterator

[mergify]: https://mergify.io
[mergify-status]: https://img.shields.io/endpoint.svg?url=https://gh.mergify.io/badges/KekeHub/project-current-iterator&style=flat
