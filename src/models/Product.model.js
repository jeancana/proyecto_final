
// PASO 1: Importar librerias y modulos
import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

// Usar el .pluralize SIEMPRE para no tener problemas con algunas configuraciones predeterminadas de Mongoose
mongoose.pluralize(null)

// PASO 2: diseñando el esquema que va a tener la coleccion 

// 2.1) Asignando el nombre de coleccion
const collection = 'Product'

// 2.2) Creando el esquema 
const schema = new mongoose.Schema({

   title: { type: String, required: true }, 
   category: { type: String, required: false },
   price: { type: Number, required: true },
   thumbnail: { type: String, required: false },
   code: { type: String, required: true },
   stock: { type: Number, required: true },
   owner: { type: String, default: 'admin'} //al cargar un producto nuevo y no tiene owner el propietario es Admin  

}) 

// 2.3) Importamos mongoose-paginate-v2 y lo activamos como plugin en el schema, 
//para tener disponible el método paginate() en las consultas
schema.plugin(mongoosePaginate)

// 2.4) Aca Creamos el Modelo a Exportar
const productsModel = mongoose.model(collection, schema)
// - El modelo tiene 2 parametros: 
// - En el Parametro Nro1: le paso la Constante "collection" 
// - En el Parametro Nro2: le paso la Constante "schema"

// 2.5) Habilitamos para Exportar el productModel
export default productsModel


