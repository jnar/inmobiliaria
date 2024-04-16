import multer from 'multer'
import path from 'path'
import { generatorId } from '../helpers/tokens.js'

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null, generatorId() + path.extname(file.originalname))
    }
})

const upload = multer({storage})

export default upload