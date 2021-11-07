import amqp from 'amqplib/callback_api'

amqp.connect('amqp://localhost', function (err, connection) {
  if (err) throw err

  connection.createChannel(function (err, channel) {
    if (err) throw err

    const queue = 'task_queue'

    channel.assertQueue(queue, {
      durable: true
    })

    // set the maximum number of messages sent over the channel
    channel.prefetch(1)

    console.log('[*] Waiting for messages in %s. To exit press CTRL+C', queue)

    // consume messages from the queue
    channel.consume(
      queue,
      message => {
        if (!message) throw new Error()

        const messageContent = message.content.toString()
        const secs = messageContent.split('.').length - 1

        console.log(' [x] Received %s', messageContent)

        setTimeout(function () {
          console.log(' [x] Done')
          channel.ack(message)
        }, secs * 1000)
      },
      {
        // set the consumer to ack the message
        noAck: false
      }
    )
  })
})
