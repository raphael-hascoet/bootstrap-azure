import { selectMultipleQuestion, YNquestion } from '../utils/display';
import { getSampleContent } from '../utils/samples';
import { getCompiledTemplate, getTemplateFileContent } from '../utils/templates';
import { Job } from './../models/data/Job';
import { Preset } from './../models/data/Preset';
import { CompiledPipeline } from '../models/data/CompiledPipeline';
export class PipelineManager {

    private preset: Preset;

    constructor($preset: Preset) {
        this.preset = $preset;
    }

    async generatePipeline(): Promise<CompiledPipeline> {

        let compiledFiles = new Map<string, string>()

        const pipelineTemplate = await getSampleContent('azure-pipelines.yml')

        const content: PipelineContent = new PipelineContent()

        if (YNquestion('Do you want the pipeline to be triggered on pushes to branches ?')) {
            content.branchTriggers = 'complete'
        } else {
            content.branchTriggers = 'none'
        }

        if (YNquestion('Do you want the pipeline to be triggered on pull requests ?')) {
            content.prTriggers = 'complete'
        } else {
            content.prTriggers = 'none'
        }


        const selectedJobsResults: Array<boolean> = selectMultipleQuestion("Which jobs do you want to run?", Object.values(Job))
        const selectedJobs = Object.keys(Job).filter((jobKey, index) => selectedJobsResults[index])

        content.jobs = selectedJobs

        compiledFiles.set('azure-pipelines.yml', await getCompiledTemplate(pipelineTemplate, await content.getTemplateContent()))



        return new CompiledPipeline(compiledFiles)

    }

}

class PipelineContent {
    branchTriggers: string = ""
    prTriggers: string = ""
    jobs: Array<string> = []
    templates: Array<string> = []

    async getTemplateContent(): Promise<object> {

        const jobsTemplates: Array<string> = await Promise.all(this.jobs.map((job) => getTemplateFileContent("jobs", job)))

        const jobsWithContent = await Promise.all(jobsTemplates.map((jobTemplate) => getCompiledTemplate(jobTemplate, { templates: this.templates })))

        let templateContent: any = {
            "branch-triggers": await getTemplateFileContent("branch-triggers", this.branchTriggers),
            "pr-triggers": await getTemplateFileContent("pr-triggers", this.prTriggers),
            "jobs": jobsWithContent
        }

        console.log("templateContent :", templateContent)

        return templateContent
    }
}