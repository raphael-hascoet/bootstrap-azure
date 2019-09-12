const git = require('isomorphic-git');
const fs = require('fs');
git.plugins.set('fs', fs)
const tmp = require('tmp-promise')

const gitDir = '/tmp-git/'

export class GitManager {

    private username: string
    private password: string
    private tmpGitDir: string

    private constructor(username: string, password: string, tmpDirPath: string) {
        this.username = username
        this.password = password
        this.tmpGitDir = tmpDirPath + gitDir
    }

    static async createGitManager(username: string, password: string): Promise<GitManager> {
        const dirResult = await tmp.dir()
        return new GitManager(username, password, dirResult.path)
    }

    async cloneRepo(url: string) {

        await git.clone(
            {
                dir: this.tmpGitDir,
                url: url,
                username: this.username,
                password: this.password,
                noGitSuffix: true
            }
        )

        console.log("The repository was cloned.")
    }

    async createBranch(name: string) {

        const branchExistsOnRemote = await this.branchExistsOnRemote(name)

        if (branchExistsOnRemote) {
            console.log("The branch " + name + " already exists on the remote")
            return
        }

        await git.branch({
            dir: this.tmpGitDir,
            ref: name,
            checkout: true
        })

        console.log('Created ' + name + ' branch')

        await this.commit('Created ' + name + ' branch')

        await this.push(name)

    }

    private async branchExistsOnRemote(name: string): Promise<boolean> {
        const remoteBranches: Array<string> = await git.listBranches({ dir: this.tmpGitDir, remote: 'origin' })

        return remoteBranches.includes(name)
    }

    async add(filePath: string) {
        await git.add({
            dir: this.tmpGitDir,
            filepath: filePath
        })

        console.log("Added file " + filePath)
    }

    async commit(message: string) {
        await git.commit({
            dir: this.tmpGitDir,
            author: {
                name: 'Bootstrap Azure',
                email: 'raphael.hascoet@accenture.com'
            },
            message: message
        })

        console.log("Commited with the message \"" + message + "\"")
    }

    async push(ref?: string) {
        await git.push({
            dir: this.tmpGitDir,
            remote: 'origin',
            ref: !!ref ? ref : await this.getCurrentBranch(),
            username: this.username,
            password: this.password,
            noGitSuffix: true
        })

        console.log("Pushed to the repository")
    }

    async getCurrentBranch(): Promise<string> {
        return await git.currentBranch({
            dir: this.tmpGitDir
        })
    }

    getTmpGitDir(): string {
        return this.tmpGitDir
    }

}