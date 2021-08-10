/**
 * @author Matt Curtis
 * Generates fake student database data and corresponding test data in a json file.
 */
(async () => {
  const fs = require('fs')
  const faker = require('faker')

  const RECORD_COUNT = parseInt(process.argv[2]) || 10
  const COURSES = ['Calculus', 'Philosophy', 'Microeconomics', 'Astronomy', 'Statistics']

  const db = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: './dist/students.db',
    },
    useNullAsDefault: true
  })
  const gradeDataFile = fs.createWriteStream('./dist/grades.json')

  await db.schema.dropTableIfExists('students')
  await db.schema.createTable('students', table => {
    table.increments('id')
    table.string('first_name')
    table.string('last_name')
    table.string('email')
    table.integer('is_registered')
    table.integer('is_approved')
    table.string('password_hash')
    table.string('address')
    table.string('city')
    table.string('state')
    table.string('zip')
    table.string('phone')
    table.string('created')
    table.string('last_login')
    table.string('ip_address')
  })
  
  await gradeDataFile.write('[\n')

  for (let i = 0; i < RECORD_COUNT; i++) {

    const student = new Map()
    student.set('first_name', faker.name.firstName())
    student.set('last_name', faker.name.lastName())
    student.set('email', faker.internet.email(student.get('first_name'), student.get('last_name')))
    student.set('is_registered', faker.datatype.boolean() ? 1 : 0)
    student.set('is_approved', faker.datatype.boolean() ? 1 : 0)
    student.set('password_hash', faker.git.commitSha())
    student.set('address', faker.address.streetAddress(true))
    student.set('city', faker.address.cityName())
    student.set('state', faker.address.stateAbbr())
    student.set('zip', faker.address.zipCodeByState(student.get('state')))
    student.set('phone', faker.phone.phoneNumber())
    student.set('created', faker.date.recent())
    student.set('last_login', faker.date.recent())
    student.set('ip_address', faker.internet.ip())

    const res = await db('students').insert([Object.fromEntries(student)])
    student.set('id', res[0])
    const coursesRandom = getRandomElementsFromArray(COURSES)
    const grades = []

    for (const course of coursesRandom) {
      const grade = Math.round(Math.random() * 100, 2)
      grades.push(JSON.stringify({id: student.get('id'), course: course, grade: grade}))
    }

    await gradeDataFile.write(grades.join(',\n'))
    if (i < RECORD_COUNT - 1 && coursesRandom.length) {
      await gradeDataFile.write(',\n')
    }
    
  }

  await gradeDataFile.write('\n]')
  gradeDataFile.close()
  db.destroy()
  console.info(`Created ${RECORD_COUNT} student records.`)
})()

function getRandomElementsFromArray(arr) {
  const numberOfRandomElementsToExtract = Math.floor(Math.random() * arr.length)
  const elements = [];

  function getRandomElement(arr) {
    if (elements.length < numberOfRandomElementsToExtract) {
      const index = Math.floor(Math.random() * arr.length)
      const element = arr.splice(index, 1)[0];

      elements.push(element)

      return getRandomElement(arr)
    } else {
        return elements
    }
  }

  return getRandomElement([...arr])
}
