# Cptclient

```javascript
const identity = {
  username: 'cptapples',
  password: 'oauth:busgt1w2vx00xyvfvinyycjrbpqg6e'
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
