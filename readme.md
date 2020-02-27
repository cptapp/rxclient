# Cptclient

```javascript
const identity = {
  username: 'username',
  password: 'oauth:password'
}

const client = new Client(identity)

client.connect()

client.connetions.forEach(() => {
  client.join('#channel')
})

client.chats.forEach(msg => {
  console.log(msg)
})
```
