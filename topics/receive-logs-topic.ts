import amqp from 'amqplib'
import { basename } from 'path'
import { all } from 'bluebird'

const keys = process.argv.slice(2)

if (keys.length < 1) {
  console.log('Usage: %s pattern [pattern...]', basename(process.argv[1]))
  process.exit(1)
}

amqp
  .connect('amqp://localhost')
  .then(connection => {
    process.once('SIGINT', () => connection.close())

    return connection.createChannel().then(channel => {
      const ex = 'topic_logs'

      channel
        .assertExchange(ex, 'topic', { durable: false })
        .then(() => channel.assertQueue('', { exclusive: true }))
        .then(qok => {
          const queue = qok.queue
          return all(
            keys.map(rk => {
              channel.bindQueue(queue, ex, rk)
            })
          ).then(() => queue)
        })
        .then(queue => {
          return channel.consume(
            queue,
            message => {
              console.log(
                ` [x] ${
                  message?.fields.routingKey
                }:${message?.content.toString()}`
              )
            },
            {
              noAck: true
            }
          )
        })
        .then(() => {
          console.log('[*] Waiting for logs. To exit press CTRL+C.')
        })
    })
  })
  .catch(err => console.log(err))
