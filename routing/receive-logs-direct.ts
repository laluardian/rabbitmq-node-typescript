import amqp, { Connection, Channel } from 'amqplib/callback_api'

amqp.connect('amqp://localhost', (err, connection: Connection) => {
  if (err) throw err

  const args = process.argv.slice(2)

  if (args.length == 0) {
    console.log('Usage: receive_logs_direct.js [info] [warning] [error]')
    process.exit(1)
  }

  connection.createChannel((err, channel: Channel) => {
    if (err) throw err

    const exchange = 'direct_logs'

    channel.assertExchange(exchange, 'direct', {
      durable: false
    })

    channel.assertQueue(
      '',
      {
        exclusive: true
      },
      (err, q) => {
        if (err) throw err

        console.log('[*] Waiting for logs. To exit press CTRL+C')

        args.forEach(severity => {
          channel.bindQueue(q.queue, exchange, severity)
        })

        channel.consume(
          q.queue,
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
      }
    )
  })
})
