import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

const protectRoute = async(req, res, next) =>{
    
    //Verificar que exista un token
    // console.log('Cookie', req.cookies._token)
    const { _token } = req.cookies
    if(!_token){
        return res.redirect('/auth/inicio')
    }

    //Comprobar la validez del token
    try {
        const decoded = jwt.verify( _token, process.env.JWT_SECRET)
        const user = await User.scope('deletePassword').findByPk(decoded.id)
        if(user){
            req.user = user
        }else{
            return res.redirect('/auth/inicio')
        }
        return next()
    } catch (error) {
        console.log(error)
        return res.clearCookie('_token').redirect('/auth/inicio')
    }

    next()
}

export default protectRoute
