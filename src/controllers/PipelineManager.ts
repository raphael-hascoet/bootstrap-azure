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

        const chosenTemplates = this.selectAzureTemplates()

        content.templates = chosenTemplates

        compiledFiles.set('azure-pipelines.yml', await getCompiledTemplate(pipelineTemplate, await content.getTemplateContent()))

        for (const templateName of chosenTemplates) {
            compiledFiles.set(`azure/templates/${templateName}.yml`, await getTemplateFileContent(templateName, undefined, this.preset))
        }

        console.log(compiledFiles)

        return new CompiledPipeline(compiledFiles)

    }

    private selectAzureTemplates(): Array<string> {
        const selectedStepsResult = selectMultipleQuestion('Which steps do you want to include ?', Object.values(AzureTemplates))
        return Object.keys(AzureTemplates).filter((stepKey, index) => selectedStepsResult[index])
    }

}

class PipelineContent {
    branchTriggers: string = ""
    prTriggers: string = ""
    jobs: Array<string> = []
    templates: Array<string> = []

    async getTemplateContent(): Promise<object> {

        const jobsTemplates: Array<string> = await Promise.all(this.jobs.map((job) => getTemplateFileContent(job, "jobs")))

        const jobsWithContent = await Promise.all(jobsTemplates.map((jobTemplate) => getCompiledTemplate(jobTemplate, { templates: this.templates })))

        let templateContent: any = {
            "branch-triggers": await getTemplateFileContent(this.branchTriggers, "branch-triggers"),
            "pr-triggers": await getTemplateFileContent(this.prTriggers, "pr-triggers"),
            "jobs": jobsWithContent
        }

        return templateContent
    }
}

enum AzureTemplates {
    "output-environment-variables" = "Output environment variables",
    "prerequisites" = "Install prerequisites",
    "build" = "Build the project",
    // "unit-tests" = "Pass unit tests",
    // "static-analysis" = "Pass static analysis",
    "publish-build-artifacts" = "Publish build artifacts"
}