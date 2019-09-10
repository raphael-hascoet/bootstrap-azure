const fetch = require("node-fetch");

import { AzureLoginInfos } from "./data/AzureLoginInfos";
import { Project } from "./data/Project";

export class AzureApi {

    private loginInfos: AzureLoginInfos;

    private constructor(loginInfos: AzureLoginInfos) {
        this.loginInfos = loginInfos
    }

    static async createAPI(loginInfos: AzureLoginInfos): Promise<AzureApi> {
        const correctInfos = await this.loginInfosAreCorrect(loginInfos)
        if (!correctInfos) {
            throw new Error("Incorrect login informations")
        }
        return new AzureApi(loginInfos)
    }

    private static async loginInfosAreCorrect(loginInfos: AzureLoginInfos): Promise<boolean> {
        let response = await fetch(`https://dev.azure.com/${loginInfos.organization}/_apis/projects?api-version=5.1`, { headers: loginInfos.getAuthentHeader() })

        return response.status === 200
    }

    async getProjects(): Promise<Array<Project>> {
        let response = await fetch(`https://dev.azure.com/${this.loginInfos.organization}/_apis/projects?api-version=5.1`, { headers: this.loginInfos.getAuthentHeader() })

        const responseJson = await response.json()

        const projectsFull = responseJson.value

        const projects: Array<Project> = projectsFull.map((projectFull: any) => new Project(projectFull.name, projectFull.description))

        return projects
    }

    async createProject(project: Project) {
        let response = await fetch(`https://dev.azure.com/${this.loginInfos.organization}/_apis/projects?api-version=5.1`,
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": this.loginInfos.getAuthentToken()
                },
                body: JSON.stringify({
                    name: project.name,
                    description: project.description,
                    "capabilities": {
                        "versioncontrol": {
                            "sourceControlType": "Git"
                        },
                        "processTemplate": {
                            "templateTypeId": "6b724908-ef14-45cf-84f8-768b5384da45"
                        }
                    }
                })
            }
        )

        const responseJson = await response.json()

        if (response.status !== 202) {
            throw new Error(responseJson.message)
        }

        await this.waitForOperation(responseJson.id)
    }

    private waitForOperation(operationId: string): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(async () => {
                let status = await this.getOperationStatus(operationId)
                console.log(status)
                if (status === 'succeeded') resolve()
                else await this.waitForOperation(operationId)
                resolve()
            }, 500)
        })
    }

    private async getOperationStatus(operationId: string): Promise<string> {
        let response = await fetch(`https://dev.azure.com/${this.loginInfos.organization}/_apis/operations/${operationId}?api-version=5.1`,
            {
                headers: this.loginInfos.getAuthentHeader()
            }
        )

        const responseJson = await response.json()

        return responseJson.status
    }

    async getRepositoryUrl(project: Project): Promise<string> {
        let response = await fetch(`https://dev.azure.com/${this.loginInfos.organization}/${project.name}/_apis/git/repositories?api-version=5.1`,
            {
                headers: this.loginInfos.getAuthentHeader()
            }
        )

        const responseJson = await response.json()

        return responseJson.value[0].remoteUrl
    }

    getLoginInfos(): AzureLoginInfos {
        return this.loginInfos
    }

}

