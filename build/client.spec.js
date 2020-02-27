"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ava_1 = __importDefault(require("ava"));
var parser = __importStar(require("./parser"));
ava_1.default('parse tags', function (t) {
    var expected = new Map([
        ['badges', 'staff/1,premium/1'],
        ['color', '#0000FF'],
        ['display-name', 'TWW2']
    ]);
    var tagString = 'badges=staff/1,premium/1;color=#0000FF;display-name=TWW2';
    var tags = parser.mapTags(tagString);
    t.deepEqual(tags, expected);
});
ava_1.default('parse a ping message', function (t) {
    var expected = { code: 'PING', data: ':tmi.twitch.tv', tags: new Map() };
    var msgString = 'PING :tmi.twitch.tv';
    var message = parser.message(msgString);
    t.deepEqual(message, expected);
});
ava_1.default('parse a tag message', function (t) {
    var expected = {
        code: 'PRIVMSG',
        data: '#test :Pepega',
        tags: new Map([
            ['display-name', 'asd'],
            ['room-id', '000'],
            ['user-id', '111'],
            ['user-type', ' :asd!asd@asd.tmi.twitch.tv']
        ])
    };
    var msgString = '@display-name=asd;room-id=000;user-id=111;user-type= :asd!asd@asd.tmi.twitch.tv PRIVMSG #test :Pepega';
    var message = parser.message(msgString);
    t.deepEqual(message, expected);
});
ava_1.default('parse message', function (t) {
    var expected = {
        code: 'JOIN',
        data: '#eloise',
        user: 'cptapples',
        tags: new Map()
    };
    var msgString = ':cptapples!cptapples@cptapples.tmi.twitch.tv JOIN #eloise';
    var message = parser.message(msgString);
    t.deepEqual(message, expected);
});
//# sourceMappingURL=client.spec.js.map