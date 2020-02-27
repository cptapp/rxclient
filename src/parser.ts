import { Message, Chat } from './Client'

export function mapTags(tags: string): Map<string, string> {
  return new Map(
    tags.split(';').map(t => t.split('=')) as Iterable<
      readonly [string, string]
    >
  )
}

export function message(msg: string): Message {
  const match = /^([@:])(.+?)\s([A-Z0-9]+)\s(.*)/.exec(msg)
  const tags = new Map<string, string>()

  if (!match) {
    if (msg.startsWith('PING')) {
      return { code: 'PING', data: msg.substr(5), tags }
    }

    throw Error('could not parse message: ' + msg)
  }

  const [, first, tagString, code, data] = match

  if (first === '@') {
    return { code, data, tags: mapTags(tagString) }
  }

  const user = /!(.*)@/.exec(tagString)
  return user ? { code, data, tags, user: user[1] } : { code, data, tags }
}

export function chatMessage({ data, tags }: Message): Chat {
  const match = /^#(.+)\s:(.+)/.exec(data)

  if (!match) {
    throw Error('Invalid chat message: ' + data)
  }

  const [, channel, message] = match

  return {
    channel,
    tags,
    message,
    user: tags.get('display-name') || 'unkown'
  }
}
