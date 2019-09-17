import { selectMultipleQuestion, YNquestion } from '../utils/display';
import { getSampleContent } from '../utils/samples';
import { getCompiledTemplate, getTemplateFileContent } from '../utils/templates';
import { Job } from './../models/data/Job';
import { Preset } from './../models/data/Preset';
import { CompiledPipeline } from '../models/data/CompiledPipeline';

import pipelineStepsJson from '../resources/pipeline-steps.json'
import { configIsSet, getConfigsWithEnvVariables, getTemplateVariablesFromConfig, getConfigsWithTemplateVariables } from '../utils/config-files';
import { mapToObject } from '../utils/maps';

const pipelineSteps: Map<string, PipelineStep> = new Map(Object.entries(pipelineStepsJson))
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

        const chosenAzureTemplates = await this.selectAzureTemplates()

        content.azureTemplates = chosenAzureTemplates

        compiledFiles.set('azure-pipelines.yml', await getCompiledTemplate(pipelineTemplate, await content.getPipelineTemplateContent()))

        for (const templateName of chosenAzureTemplates) {
            compiledFiles.set(`azure/templates/${templateName}.yml`, await this.getCompiledAzureTemplate(templateName))
        }

        return new CompiledPipeline(compiledFiles, await content.getVariableGroups())

    }

    // This function loops if the user selects a step which needs a config and doesn't have one
    private async selectAzureTemplates(): Promise<Array<string>> {
        const pipelineStepsDisplay = Array.from(pipelineSteps.values()).map((pipelineStep) => {
            return pipelineStep.needsConfig ? pipelineStep.display + " (needs config)" : pipelineStep.display
        })

        const chosenAzureTemplates = this.choosePipelineSteps(pipelineStepsDisplay)

        const correctConfig = await this.verifyConfig(chosenAzureTemplates)

        if (!correctConfig) return await this.selectAzureTemplates()

        return chosenAzureTemplates
    }

    private choosePipelineSteps(steps: Array<string>): Array<string> {
        const selectedStepsResult = selectMultipleQuestion('Which steps do you want to include ?', Object.values(steps))

        const chosenPipelineSteps = Array.from(pipelineSteps.keys()).filter((stepKey, index) => selectedStepsResult[index])

        return chosenPipelineSteps
    }

    // This function checks if the chosen steps which need a config do have one
    private async verifyConfig(chosenAzureTemplates: Array<string>): Promise<boolean> {

        for (const template of chosenAzureTemplates) {
            const step = pipelineSteps.get(template) as PipelineStep
            if (step.needsConfig) {
                const hasConfig = await configIsSet(template)
                if (!hasConfig) {
                    console.log("The step " + template + " is not configured.")
                    return false
                }
            }
        }

        return true
    }

    private async getCompiledAzureTemplate(templateName: string): Promise<string> {
        const templateFileContent = await getTemplateFileContent(templateName, undefined, this.preset)

        const templateVariables = await getTemplateVariablesFromConfig(templateName)

        return await getCompiledTemplate(templateFileContent, mapToObject(templateVariables))
    }

}

// This class represents the content of the pipeline before being transformed into YAML
class PipelineContent {
    branchTriggers: string = ""
    prTriggers: string = ""
    jobs: Array<string> = []
    azureTemplates: Array<string> = []

    async getPipelineTemplateContent(): Promise<object> {

        const jobsTemplates: Array<string> = await Promise.all(this.jobs.map((job) => getTemplateFileContent(job, "jobs")))

        const jobsWithContent = await Promise.all(jobsTemplates.map((jobTemplate) => getCompiledTemplate(jobTemplate, { templates: this.azureTemplates })))

        let templateContent: any = {
            "variable-groups": await this.getVariableGroups(),
            "branch-triggers": await getTemplateFileContent(this.branchTriggers, "branch-triggers"),
            "pr-triggers": await getTemplateFileContent(this.prTriggers, "pr-triggers"),
            "jobs": jobsWithContent
        }

        return templateContent
    }

    async getVariableGroups(): Promise<Array<string>> {
        const configsWithEnvVariables = await getConfigsWithEnvVariables()

        const envVariableGroupsToApply = this.azureTemplates.filter((template) => configsWithEnvVariables.includes(template))

        return envVariableGroupsToApply
    }
}


interface PipelineStep {
    display: string,
    needsConfig: boolean
}