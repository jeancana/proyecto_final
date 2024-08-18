
// PASO 1: Importar librerias y modulos
import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { v4 as uuid } from 'uuid'; 

// Usar el .pluralize SIEMPRE para no tener problemas con algunas configuraciones predeterminadas de Mongoose
mongoose.pluralize(null)

// PASO 2: diseñando el esquema que va a tener la coleccion 

// 2.1) Asignando el nombre de coleccion
const collection = 'Ticket'

// 2.2) Creando el esquema 
const schema = new mongoose.Schema({
   
   code: { type: String, required: true, default: uuid },
   purchase_datetime: { type: Date, required: true, default: Date.now}, 
   amount: { type: Number, required: true },
   purchaser: { type: String, required: false }

}) 

// 2.3) Importamos mongoose-paginate-v2 y lo activamos como plugin en el schema, 
//para tener disponible el método paginate() en las consulta
schema.plugin(mongoosePaginate)

// 2.4) Aca Creamos el Modelo a Exportar
const ticketsModel = mongoose.model(collection, schema)
// - El modelo tiene 2 parametros: 
// - En el Parametro Nro1: le paso la Constante "collection" 
// - En el Parametro Nro2: le paso la Constante "schema"

// 2.5) Habilitamos para Exportar el 
export default ticketsModel


