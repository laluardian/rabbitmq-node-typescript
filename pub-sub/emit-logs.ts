import amqp from 'amqplib/callback_api'

amqp.connect('amqp://localhost', (err, connection) => {
  if (err) throw err

  connection.createChannel((err, channel) => {
    if (err) throw err

    const exchange = 'logs'
    const message = process.argv.slice(2).join(' ') || 'Hello, World!'

    channel.assertExchange(exchange, 'fanout', {
      durable: false
    })

    channel.publish(exchange, '', Buffer.from(message))

    console.log(' [x] Sent %s', message)
  })

  setTimeout(function () {
    connection.close()
    process.exit(0)
  }, 500)
})
