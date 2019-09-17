const fetch = require("node-fetch");

import logins from './azure-logins.json'

main()

async function main() {

    let response = await fetch(`https://dev.azure.com/raphaelh77/_apis/projects?api-version=5.1`, {
        method: "GET",
        headers: {
            "Authorization": "Basic " + Buffer.from(logins.username + ":" + logins.token).toString('base64')
        }
    })

    let projects = await response.json()
    for (const project of projects.value) {
        console.log(project)
        let rep = await fetch(`https://dev.azure.com/raphaelh77/_apis/projects/${project.id}?api-version=5.1`, {
            method: "DELETE",
            headers: {
                "Authorization": "Basic " + Buffer.from(logins.username + ":" + logins.token).toString('base64')
            }
        })

        console.log(await rep.json())
    }



}