import amqp from 'amqplib'

const args = process.argv.slice(2)
const key = args.length > 0 ? args[0] : 'info'
const message = args.slice(1).join(' ') || 'Hello World!'

amqp
  .connect('amqp://localhost')
  .then(connection => {
    connection
      .createChannel()
      .then(channel => {
        const ex = 'topic_logs'
        const ok = channel.assertExchange(ex, 'topic', { durable: false })
        return ok.then(() => {
          channel.publish(ex, key, Buffer.from(message))
          console.log(" [x] Sent %s:'%s'", key, message)
          return channel.close()
        })
      })
      .finally(() => {
        connection.close()
      })
  })
  .catch(err => console.log(err))
