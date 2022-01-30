const http = require('http')
const fs = require('fs')

const file = fs.createWriteStream('schema.ts')
http.get('https://api.algdb.net/schema.ts', function (response) {
  response.pipe(file)
})
