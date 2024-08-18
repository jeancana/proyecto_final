
// PASO 1: Importar librerias y modulos
import mongoose from 'mongoose'

// Usar el .pluralize SIEMPRE para no tener problemas con algunas configuraciones predeterminadas de Mongoose
mongoose.pluralize(null)

// PASO 2: diseñando el esquema que va a tener la coleccion 

// 2.1) Asignando el nombre de coleccion
const collection = 'messages'// Esta la coleccion creada "coleccion=messages" dentro "BD=ecommerce" en MongoDB-Compas 

// 2.2) Creando el esquema 
const schema = new mongoose.Schema({

   // Aca dentro delineamos el Schema(esquema) con el funciona la Coleccion "messages"
      user: { type: String, required: true },
      message: { type: String, required: false }
   
}) 

// 2.3) Aca Creamos el Modelo a Exportar
const messagesModel = mongoose.model(collection, schema)
// - El modelo tiene 2 parametros: 
// - En el Parametro Nro1: le paso la Constante "collection" 
// - En el Parametro Nro2: le paso la Constante "schema"

// 2.4) Habilitamos para Exportar el
export default messagesModel


