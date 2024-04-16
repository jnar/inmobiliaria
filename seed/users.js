import bcrypt from 'bcrypt'

const users = [
    {
        name: 'Miguel',
        email: 'miguel@test.com',
        password: bcrypt.hashSync('123456', 10),
        confirmed : 1
    }
]

export default users