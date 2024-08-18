
// 1) Importando el messageService nos traemos tambien todo los metodos de la libreria mongoose
import messageService from '../services/message.service.js'

// 2) Creando la Clase MessageController
export class MessageController {
   
    constructor() {
        // Creo el constructor y lo dejo vacio
    }

    // 2.1) Metodo para Agregar un Mensaje a la BD
    async addMessage(message) {

        // Para verificar
        //console.log('mensaje llego al controller:', message)

        try {

            // Cargando el mensaje en BD
            const loaded = await messageService.createMessage(message)

            // Retornando el Mensaje Cargado en la BD
            return loaded

        } catch (err) {

            return err.message

        }
    }

    // 2.2) Metodo para Obtener todos los Mensaje creados en la BD
    async getMessage() {
        try {

            // Nota: como hace un solo Proceso pongo todo en el return
            return await messageService.getMessages() 

        } catch (err) {

            return err.message

        }

    }

   
}