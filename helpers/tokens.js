import jwt from 'jsonwebtoken';

const generatorJWT = datos => jwt.sign(
    { id: datos.id, name: datos.name, email: datos.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1d'}
)

const generatorId = () => Date.now().toString(32) + Math.random().toString(32).substring(2);

export{
    generatorJWT,
    generatorId
}