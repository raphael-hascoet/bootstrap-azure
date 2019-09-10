export interface IAzureLoginInfos {
    organization: string;
    username: string;
    token: string;
}

export class AzureLoginInfos implements IAzureLoginInfos {
    organization: string;
    username: string;
    token: string;

    constructor(loginInfos?: IAzureLoginInfos) {
        this.organization = loginInfos && loginInfos.organization || "";
        this.username = loginInfos && loginInfos.username || "";
        this.token = loginInfos && loginInfos.token || "";
    }

    getAuthentToken(): string {
        return "Basic " + Buffer.from(this.username + ":" + this.token).toString('base64')
    }

    getAuthentHeader(): object {
        return { "Authorization": this.getAuthentToken() }
    }

}