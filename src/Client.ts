import WebSocket from 'ws'
import { Subject } from 'rxjs'
import { map, filter, delay, pluck } from 'rxjs/operators'
import * as parser from './parser'

enum msgId {
  subgift = 'subgift',
  submysterygift = 'submysterygift'
}

enum codes {
  connect = '001',
  chat = 'PRIVMSG',
  join = 'ROOMSTATE',
  leave = 'PART',
  usernotice = 'USERNOTICE',
  notice = 'NOTICE',
  ping = 'PING'
}

export interface Subgift {
  recipient: string
  gifter: string
  channel: string
}

export interface Message {
  user?: string
  tags: Map<string, string>
  data: string
  code: string
}

export interface Chat {
  channel: string
  tags: Map<string, string>
  message: string
  user: string
}

class Client {
  private socket: null | WebSocket = null
  private readonly channels = new Set<string>()

  private _join = new Subject<string>()
  private _leave = new Subject<string>()
  private _send = new Subject<string>()

  public join = (channel: string): void => this._join.next(channel)
  public leave = (channel: string): void => this._leave.next(channel)
  private send = (data: string): void => this._send.next(data)

  public rawMessages = new Subject<string>()
  public closes = new Subject<Message>()
  public errors = new Subject<string>()
  public messages = this.rawMessages.pipe(map(raw => parser.message(raw)))
  public pings = this.messages.pipe(filter(({ code }) => code === codes.ping))

  public connetions = this.messages.pipe(
    filter(({ code }) => code === codes.connect),
    map(() => this.identity.username)
  )

  public chats = this.messages.pipe(
    filter(({ code }) => code === codes.chat),
    map(parser.chatMessage)
  )

  public joined = this.messages.pipe(
    filter(({ code }) => code === codes.join),
    pluck('data')
  )

  public left = this.messages.pipe(
    filter(({ code }) => code === codes.leave),
    pluck('data')
  )

  public notices = this.messages.pipe(
    filter(({ code }) => code === codes.notice)
  )

  public userNotices = this.messages.pipe(
    filter(({ code }) => code === codes.usernotice)
  )

  public subGifts = this.userNotices.pipe(
    filter(({ tags }) => {
      const id = tags.get('msg-id')
      return id === msgId.subgift || id === msgId.submysterygift
    }),
    map(({ data, tags }) => ({
      recipient: tags.get('msg-param-recipient-display-name') || 'unkown',
      gifter: tags.get('display-name') || 'unkown',
      channel: data
    }))
  )

  public constructor(
    readonly identity = { username: 'justinfan1001', password: 'eloiseE' },
    readonly server = 'wss://irc-ws.chat.twitch.tv'
  ) {
    this.pings.forEach(() => this.send('PONG :tmi.twitch.tv'))
    this.joined.forEach(channel => this.channels.add(channel))
    this.left.forEach(channel => this.channels.delete(channel))

    // this.rawMessages.forEach(console.log)

    this._join
      .pipe(
        filter(channel => !this.channels.has(channel)),
        filter(channel => channel.startsWith('#'))
      )
      .forEach(channel => this.send(`JOIN ${channel}`))

    this._leave
      .pipe(filter(channel => this.channels.has(channel)))
      .forEach(channel => this.send(`PART ${channel}`))

    this._send.pipe(delay(300)).forEach(data => {
      if (this.socket) {
        this.socket.send(data)
      } else {
        this.errors.next('not connected: ' + data)
      }
    })
  }

  public get Channels() {
    return this.channels
  }

  public get isConnected() {
    return this.socket?.readyState === this.socket?.OPEN
  }

  public connect() {
    this.socket = this.getSocket()
    this.socket.onclose = e => this.errors.next(e.reason)
    this.socket.onmessage = e => {
      if (e.type === 'message') {
        this.rawMessages.next(e.data.toString())
      }
    }

    this.socket.onopen = () => {
      this.send('CAP REQ :twitch.tv/tags twitch.tv/commands')
      this.send(`PASS ${this.identity.password}`)
      this.send(`NICK ${this.identity.username}`)
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close()
    }

    this.channels.clear()
  }

  private getSocket() {
    return new WebSocket(this.server)
  }
}

export default Client
