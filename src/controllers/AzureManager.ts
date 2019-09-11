import { GitManager } from './GitManager';
import { AzureApi } from "../models/AzureApi";
import { AzureLoginInfos, IAzureLoginInfos } from "../models/data/AzureLoginInfos";
import { Project } from "../models/data/Project";
import getDefaultLoginsFromFile from "../utils/azureLoginFile";
import { question, throwFatalError, displayList, throwError, YNquestion } from "../utils/display";

export class AzureManager {

    private azureApi: AzureApi;

    private gitManager: GitManager;

    private project?: Project;

    private constructor(azureApi: AzureApi, gitManager: GitManager) {
        this.azureApi = azureApi
        this.gitManager = gitManager
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

        let gitManager = undefined

        if (!!azureApi) {

            const loginInfos = azureApi.getLoginInfos()

            gitManager = await GitManager.createGitManager(loginInfos.username, loginInfos.token)

        }

        return new AzureManager(azureApi as AzureApi, gitManager as GitManager)
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

        console.log("Creating the project, please wait...")

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

        await this.cloneRepo()

        await this.gitManager.commit('Initial commit')

        if (YNquestion('Add a sample README ?')) {
            await this.gitManager.addFromSamples('README.md')
        }

        if (YNquestion('Add a sample .gitignore ?')) {
            await this.gitManager.addFromSamples('.gitignore')
        }

        const createdBranches: Array<string> = []

        await this.gitManager.push('master')

        createdBranches.push('master')

        if (YNquestion('Create a develop branch ?')) {
            await this.gitManager.createBranch('develop')
            createdBranches.push('develop')

            if (YNquestion('Should develop be the default branch ?')) {
                await this.azureApi.setDefaultBranch(this.project as Project, 'develop')
                console.log("develop is now the default branch")
            }

        }

        if (YNquestion('Add policies to the created branches ?')) {
            this.setupPolicies(createdBranches)
        }
    }

    private async cloneRepo() {
        const repositoryUrl = await this.azureApi.getRepositoryUrl(this.project as Project)

        await this.gitManager.cloneRepo(repositoryUrl)
    }

    async editProject() {

        const existingProjects = await this.azureApi.getProjects()

        const existingProjectsNames = existingProjects.map((project) => project.name)

        console.log("Available projects: ")

        displayList(existingProjectsNames)

        console.log()

        const projectName = question('Project you want to edit: ', 'ouioui')

        if (existingProjectsNames.includes(projectName)) {
            this.project = existingProjects.find((project) => project.name === projectName)

            await this.cloneRepo()
        } else {
            throwError('This project does not exist')
            console.log()
            await this.editProject()
        }
    }

    async setupPolicies(createdBranches: Array<string>) {

        if (YNquestion('Check for linked work items on pull requests ?')) {
            for (const branch of createdBranches)
                this.azureApi.createPolicy(this.project as Project, true, true, 'work-items', branch)
        }

        if (YNquestion('Check for comments resolution on pull requests ?')) {
            for (const branch of createdBranches)
                this.azureApi.createPolicy(this.project as Project, true, true, 'active-comments', branch)
        }


    }



}