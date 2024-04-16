import { Propertie, Category, Price } from '../models/index.js'

const propiedades = async (req, res)=>{

    const propiedades = await Propertie.findAll({
        include: [
            { model: Price },
            { model: Category }
        ]
    })


    res.json(propiedades)

}


export{
    propiedades
}