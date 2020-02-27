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
var ws_1 = __importDefault(require("ws"));
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var parser = __importStar(require("./parser"));
var msgId;
(function (msgId) {
    msgId["subgift"] = "subgift";
    msgId["submysterygift"] = "submysterygift";
})(msgId || (msgId = {}));
var codes;
(function (codes) {
    codes["connect"] = "001";
    codes["chat"] = "PRIVMSG";
    codes["join"] = "ROOMSTATE";
    codes["leave"] = "PART";
    codes["usernotice"] = "USERNOTICE";
    codes["notice"] = "NOTICE";
    codes["ping"] = "PING";
})(codes || (codes = {}));
var Client = (function () {
    function Client(identity, server) {
        var _this = this;
        if (identity === void 0) { identity = { username: 'justinfan1001', password: 'eloiseE' }; }
        if (server === void 0) { server = 'wss://irc-ws.chat.twitch.tv'; }
        this.identity = identity;
        this.server = server;
        this.socket = null;
        this.channels = new Set();
        this._join = new rxjs_1.Subject();
        this._leave = new rxjs_1.Subject();
        this._send = new rxjs_1.Subject();
        this.join = function (channel) { return _this._join.next(channel); };
        this.leave = function (channel) { return _this._leave.next(channel); };
        this.send = function (data) { return _this._send.next(data); };
        this.rawMessages = new rxjs_1.Subject();
        this.closes = new rxjs_1.Subject();
        this.errors = new rxjs_1.Subject();
        this.messages = this.rawMessages.pipe(operators_1.map(function (raw) { return parser.message(raw); }));
        this.pings = this.messages.pipe(operators_1.filter(function (_a) {
            var code = _a.code;
            return code === codes.ping;
        }));
        this.connetions = this.messages.pipe(operators_1.filter(function (_a) {
            var code = _a.code;
            return code === codes.connect;
        }), operators_1.map(function () { return _this.identity.username; }));
        this.chats = this.messages.pipe(operators_1.filter(function (_a) {
            var code = _a.code;
            return code === codes.chat;
        }), operators_1.map(parser.chatMessage));
        this.joined = this.messages.pipe(operators_1.filter(function (_a) {
            var code = _a.code;
            return code === codes.join;
        }), operators_1.pluck('data'));
        this.left = this.messages.pipe(operators_1.filter(function (_a) {
            var code = _a.code;
            return code === codes.leave;
        }), operators_1.pluck('data'));
        this.notices = this.messages.pipe(operators_1.filter(function (_a) {
            var code = _a.code;
            return code === codes.notice;
        }));
        this.userNotices = this.messages.pipe(operators_1.filter(function (_a) {
            var code = _a.code;
            return code === codes.usernotice;
        }));
        this.subGifts = this.userNotices.pipe(operators_1.filter(function (_a) {
            var tags = _a.tags;
            var id = tags.get('msg-id');
            return id === msgId.subgift || id === msgId.submysterygift;
        }), operators_1.map(function (_a) {
            var data = _a.data, tags = _a.tags;
            return ({
                recipient: tags.get('msg-param-recipient-display-name') || 'unkown',
                gifter: tags.get('display-name') || 'unkown',
                channel: data
            });
        }));
        this.pings.forEach(function () { return _this.send('PONG :tmi.twitch.tv'); });
        this.joined.forEach(function (channel) { return _this.channels.add(channel); });
        this.left.forEach(function (channel) { return _this.channels.delete(channel); });
        this._join
            .pipe(operators_1.filter(function (channel) { return !_this.channels.has(channel); }), operators_1.filter(function (channel) { return channel.startsWith('#'); }))
            .forEach(function (channel) { return _this.send("JOIN " + channel); });
        this._leave
            .pipe(operators_1.filter(function (channel) { return _this.channels.has(channel); }))
            .forEach(function (channel) { return _this.send("PART " + channel); });
        this._send.pipe(operators_1.delay(300)).forEach(function (data) {
            if (_this.socket) {
                _this.socket.send(data);
            }
            else {
                _this.errors.next('not connected: ' + data);
            }
        });
    }
    Object.defineProperty(Client.prototype, "Channels", {
        get: function () {
            return this.channels;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "isConnected", {
        get: function () {
            var _a, _b;
            return ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.readyState) === ((_b = this.socket) === null || _b === void 0 ? void 0 : _b.OPEN);
        },
        enumerable: true,
        configurable: true
    });
    Client.prototype.connect = function () {
        var _this = this;
        this.socket = this.getSocket();
        this.socket.onclose = function (e) { return _this.errors.next(e.reason); };
        this.socket.onmessage = function (e) {
            if (e.type === 'message') {
                _this.rawMessages.next(e.data.toString());
            }
        };
        this.socket.onopen = function () {
            _this.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
            _this.send("PASS " + _this.identity.password);
            _this.send("NICK " + _this.identity.username);
        };
    };
    Client.prototype.disconnect = function () {
        if (this.socket) {
            this.socket.close();
        }
        this.channels.clear();
    };
    Client.prototype.getSocket = function () {
        return new ws_1.default(this.server);
    };
    return Client;
}());
exports.default = Client;
//# sourceMappingURL=Client.js.map