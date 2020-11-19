interface LFMArgumentObject {
    method: string;
    lang?: string;
    tag?: string;
    user?: string;
    sk?: string;
    country?: string;
    location?: string;
    num_res?: number;
    offset?: number;
    page?: number;
    limit?: number;
    token?: string;
    api_sig?: string;
    username?: string;
    password?: string;
}
export default class LFMRequest {
    private key;
    private params;
    private secret;
    private response;
    constructor(key: string, secret: string, params: LFMArgumentObject);
    execute(): Promise<any>;
    checkStatus(): Promise<any>;
    private post;
    private get;
    private getSignature;
}
export {};
