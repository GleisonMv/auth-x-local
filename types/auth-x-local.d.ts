import auth from "fast-auth-x"

declare interface Option
{
    secret: string,
    expire: string | number
}

declare class Local extends auth.strategy
{
    constructor(config: Option)
    auth(id: number, group: number, reply: any);
    onError(request: any, reply: any, error: number);
    onPermissionCheck(request: any, done: (err: Error, auth?: boolean) => void);
    onUserCheck(request: any, permission: number, done: (err: Error, permission?: boolean) => void);
}

export default Local