const git = require('isomorphic-git');
const fs = require('fs-extra');
git.plugins.set('fs', fs)
const tmp = require('tmp-promise')

const gitDir = '/tmp-git/'

const sampleFolder = __dirname + "/../../sample-files/"

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

    async addReadme() {
        await fs.copyFile(
            sampleFolder + 'README.md',
            this.tmpGitDir + 'README.md',
        )

        await this.add('README.md')

        await this.commit('Added README')

        console.log("Sample README.md added")
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

    async push() {
        await git.push({
            dir: this.tmpGitDir,
            remote: 'origin',
            ref: 'master',
            username: this.username,
            password: this.password,
            noGitSuffix: true
        })

        console.log("Pushed to the repository")
    }

}