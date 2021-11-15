module.exports = (io) => {
  io.on('connection', socket => {
    console.log('[SysBot] - Socket connected')

    socket.on('disconnected', () => {
      console.log('[SysBot] - Disconnected')
    })
  })
}