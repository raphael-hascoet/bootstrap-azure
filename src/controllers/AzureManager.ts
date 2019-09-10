import { GitManager } from './GitManager';
import { AzureApi } from "../models/AzureApi";
import { AzureLoginInfos, IAzureLoginInfos } from "../models/data/AzureLoginInfos";
import { Project } from "../models/data/Project";
import getDefaultLoginsFromFile from "../utils/azureLoginFile";
import { question, throwFatalError, displayList, throwError, YNquestion } from "../utils/display";

export class AzureManager {

    private azureApi: AzureApi;

    private project?: Project;

    private constructor(azureApi?: AzureApi) {
        if (typeof azureApi === 'undefined') throwFatalError("Error: Azure Api is undefined")
        this.azureApi = azureApi as AzureApi
    }

    static async createManager(): Promise<AzureManager> {
        let azureApi = undefined
        try {
            azureApi = await this.createAzureApi()
        } catch (err) {
            throwFatalError("Couldn't connect to Azure DevOps: " + err.message)
        }

        console.log()
        console.log("You successfully logged in !")
        console.log()

        return new AzureManager(azureApi)
    }

    private static async createAzureApi(): Promise<AzureApi> {
        const defaultLogins: IAzureLoginInfos = await getDefaultLoginsFromFile()

        const organization: string = question(`Organization name: (${defaultLogins.organization}) `, defaultLogins.organization)
        const username: string = question(`Azure DevOps username: (${defaultLogins.username}) `, defaultLogins.username)
        const token: string = question(`Personal access token: (${defaultLogins.token}) `, defaultLogins.token)

        const loginInfos: AzureLoginInfos = new AzureLoginInfos({ organization: organization, username: username, token: token })

        try {
            return await AzureApi.createAPI(loginInfos)
        } catch (err) {
            throw (err)
        }
    }

    async createProject() {
        console.log("Starting the creation of a new project :")

        const projectName = question('Name of the project: ')

        const projectDescription = question('Description of the project: ')

        const project = new Project(projectName, projectDescription)

        try {
            await this.azureApi.createProject(project)
        } catch (err) {
            console.log("Couldn't create project: ", err.message)
            process.exit()
        }

        this.project = project

        console.log("Successfully created the project " + projectName)
    }

    async initRepo() {
        console.log("Initializing the project's repository :")

        const loginInfos = this.azureApi.getLoginInfos()

        const gitManager = await GitManager.createGitManager(loginInfos.username, loginInfos.token)

        const repositoryUrl = await this.azureApi.getRepositoryUrl(this.project as Project)

        await gitManager.cloneRepo(repositoryUrl)

        if (YNquestion('Add a sample README ?'))
            await gitManager.addReadme()

        await gitManager.push()
    }

    async editProject() {

        const existingProjects = await this.azureApi.getProjects()

        const existingProjectsNames = existingProjects.map((project) => project.name)

        console.log("Available projects: ")

        displayList(existingProjectsNames)

        console.log()

        const projectName = question('Project you want to edit: ')

        if (existingProjectsNames.includes(projectName)) {
            this.project = existingProjects.find((project) => project.name === projectName)
        } else {
            throwError('This project does not exist')
            console.log()
            this.editProject()
        }
    }



}