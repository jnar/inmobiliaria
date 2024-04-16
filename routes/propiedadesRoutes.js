import express from 'express'
import { body } from 'express-validator'
import { admin, crear, guardar, agregarImagen, saveImage, editar, actualizar, eliminar, actualizarEstado, verPropiedad, sendMessage, showMessages } from '../controllers/propiedadesController.js'
import protectRoute from '../middleware/protectRoute.js'
import upload from '../middleware/uploadFile.js'
import identifyUser from '../middleware/identifyUser.js'

const router = express.Router()


router.get('/mis-propiedades', protectRoute, admin)
router.get('/propiedad/crear', protectRoute, crear)
router.post('/propiedad/guardar', 
    protectRoute,
    body('title').notEmpty().withMessage('El titulo de la propiedad es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({min:10}).withMessage('La descripción es muy corta')
        .isLength({max:100}).withMessage('La descripción es muy larga'),
    body('category').isNumeric().withMessage('Selecciona la categoria'),
    body('price').isNumeric().withMessage('Selecciona el rango de precio'),
    body('rooms').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
    body('parking').isNumeric().withMessage('Selecciona el numero de estacionamiento'),
    body('wc').isNumeric().withMessage('Selecciona el numero de baños'),
    body('lat').notEmpty().withMessage('Indica la ubicación en el mapa'),
    guardar
)

router.get('/propiedades/agregar-imagen/:id', protectRoute, agregarImagen)

router.post('/propiedades/agregar-imagen/:id',
    protectRoute,
    upload.single('imagen'),
    saveImage
)

router.get('/propiedades/editar/:id', protectRoute, editar)

router.post('/propiedad/editar/:id', 
    protectRoute,
    body('title').notEmpty().withMessage('El titulo de la propiedad es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({min:10}).withMessage('La descripción es muy corta')
        .isLength({max:100}).withMessage('La descripción es muy larga'),
    body('category').isNumeric().withMessage('Selecciona la categoria'),
    body('price').isNumeric().withMessage('Selecciona el rango de precio'),
    body('rooms').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
    body('parking').isNumeric().withMessage('Selecciona el numero de estacionamiento'),
    body('wc').isNumeric().withMessage('Selecciona el numero de baños'),
    body('lat').notEmpty().withMessage('Indica la ubicación en el mapa'),
    actualizar
)

router.post('/propiedad/eliminar/:id',
    protectRoute,
    eliminar
)

router.post('/propiedad/actualizar/estado/:id',
    protectRoute,
    actualizarEstado
)


router.get('/mensajes/:id',
    protectRoute,
    showMessages
)


//Area publica -----------------------------------------------------

router.get('/propiedad/:id',
    identifyUser,
    verPropiedad
)

//Guardar los mensajes
router.post('/propiedad/:id', 
    identifyUser,
    body('message').isLength({ min:10 }).withMessage('El mensaje es demasiado breve o esta vacio'),
    sendMessage
)



export default router