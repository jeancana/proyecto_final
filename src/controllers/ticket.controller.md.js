
// 1) Importando el ticketService nos traemos tambien todo los metodos de la libreria mongoose
import ticketService from '../services/ticket.service.js'

// 2) Creando la Clase TicketController
export class TicketController {
   
    constructor() {
        // Creo el constructor y lo dejo vacio
    }

    // 2.1) Metodo para agregar un ticket a la BD
    async addTicket(amount, purchaser) {

        // Para verificar
        //console.log('mensaje llego al controller:', message)

        try {

            // Cargando el mensaje en BD
            const result = await ticketService.createTicket({
                amount,
                purchaser,
            })

            
            return result

        } catch (err) {

            return err.message

        }
    }

    // 2.2) Metodo para obtener un ticket por su Codigo de la BD
    async getTicketByCode(id, purchaser) {
        try {

            // COMO hace un solo Proceso pongo todo en el return
            return await ticketService.getTicketByCode(id, purchaser) 

        } catch (err) {

            return err.message

        }

    }

    // 2.3) Metodo para obtener un ticket por el comprador en la BD
    async getTicketsByPurchaser(email) {
        try {
            return await ticketService.getTicketsByEmail(email)
        } catch (err) {
            return err.message
        }
    }

   
}