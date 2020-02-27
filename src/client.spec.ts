import test from 'ava'
import * as parser from './parser'

test('parse tags', t => {
  const expected = new Map([
    ['badges', 'staff/1,premium/1'],
    ['color', '#0000FF'],
    ['display-name', 'TWW2']
  ])

  const tagString = 'badges=staff/1,premium/1;color=#0000FF;display-name=TWW2'
  const tags = parser.mapTags(tagString)

  t.deepEqual(tags, expected)
})

test('parse a ping message', t => {
  const expected = { code: 'PING', data: ':tmi.twitch.tv', tags: new Map() }
  const msgString = 'PING :tmi.twitch.tv'
  const message = parser.message(msgString)

  t.deepEqual(message, expected)
})

test('parse a tag message', t => {
  const expected = {
    code: 'PRIVMSG',
    data: '#test :Pepega',
    tags: new Map([
      ['display-name', 'asd'],
      ['room-id', '000'],
      ['user-id', '111'],
      ['user-type', ' :asd!asd@asd.tmi.twitch.tv']
    ])
  }

  const msgString =
    '@display-name=asd;room-id=000;user-id=111;user-type= :asd!asd@asd.tmi.twitch.tv PRIVMSG #test :Pepega'
  const message = parser.message(msgString)

  t.deepEqual(message, expected)
})

test('parse message', t => {
  const expected = {
    code: 'JOIN',
    data: '#eloise',
    user: 'cptapples',
    tags: new Map()
  }
  const msgString = ':cptapples!cptapples@cptapples.tmi.twitch.tv JOIN #eloise'
  const message = parser.message(msgString)

  t.deepEqual(message, expected)
})
