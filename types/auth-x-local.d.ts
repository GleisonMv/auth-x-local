import auth from "fast-auth-x"

declare interface Option
{
    secret: string,
    expire: string | number
}

declare class Local extends auth.strategy
{
    constructor(config: Option)
    auth(id: number, group: number, reply: any): void;
    onError(request: any, reply: any, error: number): void;
    onPermissionCheck(request: any, done: (err: Error, auth?: boolean) => void): void;
    onUserCheck(request: any, permission: number, done: (err: Error, permission?: boolean) => void): void;
}

export default Local