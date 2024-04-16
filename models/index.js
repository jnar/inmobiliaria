import Propertie from './Propertie.js'
import Category from './Category.js'
import Price from './Price.js'
import User from './User.js'
import Message from './Message.js'

// Propertie.belongsTo(Price, { foreignKey: 'precio_id'})
Propertie.belongsTo(Price)
Propertie.belongsTo(Category)
Propertie.hasMany(Message, {foreignKey :'propertyId'})
// Propertie.belongsTo(User)
User.hasMany(Propertie)

Message.belongsTo(Propertie, {foreignKey :'propertyId'})
Message.belongsTo(User, {foreignKey :'userId'})

export{
    Propertie,
    Category,
    Price,
    User,
    Message
}