import { Message, Chat } from './Client';
export declare function mapTags(tags: string): Map<string, string>;
export declare function message(msg: string): Message;
export declare function chatMessage({ data, tags }: Message): Chat;
