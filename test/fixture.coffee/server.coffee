Graft = require '../../server'
require '../../lib/coffee'

Graft.directory __dirname

require '../../server/client'
require '../../io/rest'

Graft.load __dirname

Graft.get '/', (req, res) -> res.render 'layout'

Graft.start()
