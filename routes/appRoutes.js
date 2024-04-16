import express from 'express'
import { home, categories, notFound, search } from '../controllers/appController.js'


const router = express.Router()

//inicio
router.get('/', home)

//categorias
router.get('/categorias/:id', categories)

//404
router.get('/404', notFound)


//buscador
router.post('/buscador', search)



export default router;