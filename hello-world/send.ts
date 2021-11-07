import amqp from 'amqplib/callback_api'

amqp.connect('amqp://localhost', (err, connection) => {
  if (err) throw err

  connection.createChannel((err, channel) => {
    if (err) throw err

    const queue = 'hello'
    const message = 'Hello, World!'

    channel.assertQueue(queue, {
      durable: false
    })

    channel.sendToQueue(queue, Buffer.from(message))

    console.log(' [x] Sent %s', message)
  })

  setTimeout(() => {
    connection.close()
    process.exit(0)
  }, 500)
})
