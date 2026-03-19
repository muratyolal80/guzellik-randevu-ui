import fs from 'fs'
import path from 'path'

const filePath = 'd:\\JAVA\\projeler_2025\\guzellik-randevu\\guzellik-randevu-ui\\services\\db\\db_support.ts'
const content = fs.readFileSync(filePath, 'utf8')
const lines = content.split('\n')

let output = ''
lines.forEach((line, index) => {
  output += `${index + 1}: ${line}\n`
})

fs.writeFileSync('d:\\JAVA\\projeler_2025\\guzellik-randevu\\guzellik-randevu-ui\\tmp-db-support-with-lines.txt', output)
console.log('Done')
