
// PASO 1: Importar librerias y modulos
import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import cartService from '../services/cart.service.js'

// Usar el .pluralize SIEMPRE para no tener problemas con algunas configuraciones predeterminadas de Mongoose
mongoose.pluralize(null)

// PASO 2: diseñando el esquema que va a tener la coleccion 

// 2.1) Asignando el nombre de coleccion
const collection = 'users'

// 2.2 Creando el esquema  
const schema = new mongoose.Schema({

   first_name: { type: String, required: true, index: true },
   last_name: { type: String, required: true }, 
   email: { type: String, required: true }, 
   age: { type: Number },
   gender: { type: String, required: false },
   password: { type: String, required: true },
   cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
   role: { type: String, enum: ['user', 'premium', 'admin'], default: 'user' }, 
   document: { type: [{ name: String, reference: String}] }, // es un Array formado x Objetos con 2 propiedades
   last_connection: { type: Date }

   /** 
    * INDICE = Primary-Key
    * IMPORTANTE: Desde el Modelo le organizo y centralizo los INDICES que requiero Crear para mejorar la busqueda
    * Para Entender la Importancia de los INDICES = index
    * Agrego UN INDICE NUEVO (indexacion) en el campo firstName, 
    * mongo se encarga internamente de crear el indice en la BD Y se acelera la busqueda(mejora)
    */ 

})

// 2.3) Creando el carrito asociado al user (estan vinculados entre siempre)
schema.post('save', async (doc) => {
   if (doc.cart) return
   const cart = await cartService.createCart()
   doc.cart = cart
   doc.save()
})


// 2.3) Importamos mongoose-paginate-v2 y lo activamos como plugin en el schema, 
//para tener disponible el método paginate() en las consultas
schema.plugin(mongoosePaginate)

// 2.4) Aca Creamos el Modelo a Exportar
const usersModel = mongoose.model(collection, schema)
// - El modelo tiene 2 parametros: 
// - En el Parametro Nro1: le paso la Constante "collection" 
// - En el Parametro Nro2: le paso la Constante "schema"

// 2.4) Habilitamos para Exportar el usersModel
export default usersModel