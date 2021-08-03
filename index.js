
(async () => {
  const sqlite = require('sqlite3').verbose()
  const faker = require('faker')

  const RECORD_COUNT = 100000

  const db = new sqlite.Database('./students.sqlite3')

  await db.exec(`DROP TABLE IF EXISTS students;
    CREATE TABLE students (
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      is_registered INTEGER,
      password_hash TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      phone TEXT,
      created TEXT,
      last_login TEXT,
      ip_address TEXT
    );`)

  const stmt = await db.prepare('INSERT INTO students VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')

  for (let i = 0; i < RECORD_COUNT; i++) {

    const state = faker.address.stateAbbr()
    const postalCode = faker.address.zipCodeByState(state)
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()

    stmt.run(
      firstName,
      lastName,
      faker.internet.email(firstName, lastName),
      faker.datatype.boolean() ? 1 : 0,
      faker.git.commitSha(),
      faker.address.streetAddress(true),
      faker.address.cityName(),
      state,
      postalCode,
      faker.phone.phoneNumber(),
      faker.date.recent(),
      faker.date.recent(),
      faker.internet.ip()
    )
  }

  stmt.finalize()

  db.close()

})()
