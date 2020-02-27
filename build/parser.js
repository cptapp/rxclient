"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mapTags(tags) {
    return new Map(tags.split(';').map(function (t) { return t.split('='); }));
}
exports.mapTags = mapTags;
function message(msg) {
    var match = /^([@:])(.+?)\s([A-Z0-9]+)\s(.*)/.exec(msg);
    var tags = new Map();
    if (!match) {
        if (msg.startsWith('PING')) {
            return { code: 'PING', data: msg.substr(5), tags: tags };
        }
        throw Error('could not parse message: ' + msg);
    }
    var first = match[1], tagString = match[2], code = match[3], data = match[4];
    if (first === '@') {
        return { code: code, data: data, tags: mapTags(tagString) };
    }
    var user = /!(.*)@/.exec(tagString);
    return user ? { code: code, data: data, tags: tags, user: user[1] } : { code: code, data: data, tags: tags };
}
exports.message = message;
function chatMessage(_a) {
    var data = _a.data, tags = _a.tags;
    var match = /^#(.+)\s:(.+)/.exec(data);
    if (!match) {
        throw Error('Invalid chat message: ' + data);
    }
    var channel = match[1], message = match[2];
    return {
        channel: channel,
        tags: tags,
        message: message,
        user: tags.get('display-name') || 'unkown'
    };
}
exports.chatMessage = chatMessage;
//# sourceMappingURL=parser.js.map