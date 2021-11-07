import amqp from 'amqplib/callback_api'

amqp.connect('amqp://localhost', (err, connection) => {
  if (err) throw err

  connection.createChannel((err, channel) => {
    if (err) throw err

    const queue = 'task_queue'

    // create a new task
    // a durable queue will survive server restarts
    channel.assertQueue(queue, {
      durable: true
    })

    // storing message from command-line arguments passed
    // when the Node.js process was launched
    const message = process.argv.slice(2).join(' ') || 'Hello World!'

    // send message to the queue
    channel.sendToQueue(queue, Buffer.from(message), {
      persistent: true
    })

    console.log(" [x] Sent '%s'", message)
  })

  // pretending we are busy
  setTimeout(function () {
    connection.close()
    process.exit(0)
  }, 500)
})
