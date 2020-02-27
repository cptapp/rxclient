import { Subject } from 'rxjs';
export interface Subgift {
    recipient: string;
    gifter: string;
    channel: string;
}
export interface Message {
    user?: string;
    tags: Map<string, string>;
    data: string;
    code: string;
}
export interface Chat {
    channel: string;
    tags: Map<string, string>;
    message: string;
    user: string;
}
declare class Client {
    readonly identity: {
        username: string;
        password: string;
    };
    readonly server: string;
    private socket;
    private readonly channels;
    private _join;
    private _leave;
    private _send;
    join: (channel: string) => void;
    leave: (channel: string) => void;
    private send;
    rawMessages: Subject<string>;
    closes: Subject<Message>;
    errors: Subject<string>;
    messages: import("rxjs").Observable<Message>;
    pings: import("rxjs").Observable<Message>;
    connetions: import("rxjs").Observable<string>;
    chats: import("rxjs").Observable<Chat>;
    joined: import("rxjs").Observable<string>;
    left: import("rxjs").Observable<string>;
    notices: import("rxjs").Observable<Message>;
    userNotices: import("rxjs").Observable<Message>;
    subGifts: import("rxjs").Observable<{
        recipient: string;
        gifter: string;
        channel: string;
    }>;
    constructor(identity?: {
        username: string;
        password: string;
    }, server?: string);
    get Channels(): Set<string>;
    get isConnected(): boolean;
    connect(): void;
    disconnect(): void;
    private getSocket;
}
export default Client;
