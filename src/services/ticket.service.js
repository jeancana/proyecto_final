
// CAPA INTERMEDIA DEL SERVICIO DEL MVC  - Intermediario entre La Capa Controllers y La Capa Model

// Importando el ticketModel
import ticketModel from '../models/Ticket.model.js'

// 1) Servicios para: 
const createTicket = async (message) => {

    //req.logger.info('pase por el Servicio - createTicket')
    //console.log("pase por el Servicio - createTicket")
    return await ticketModel.create(message)
}

// 2) Servicios para:
const getAllTickets = async () => {

    //req.logger.info('pase por el Servicio - getAllTickets')
    //console.log("pase por el Servicio - getAllTickets")
    return await ticketModel.find().lean() 

}

// 3) Servicios para:
const getTicketByCode = async (code, purchaser) => {

    //console.log('purchaser', purchaser)

    //req.logger.info('pase por el Servicio - getTicketByCode')
    //console.log("pase por el Servicio - getTicketByCode")
    return await ticketModel.findOne({ code }).exec()

}

// 4) Servicios para:
const getTicketsByEmail = async (email) => {

    //req.logger.info('pase por el Servicio - getTicketsByEmail')
    //console.log("pase por el Servicio - getTicketsByEmail")
    return await ticketModel.find({ purchaser: email }, null, { sort: 'purchase_datetime' }).exec()
}

// Exportando todos Los Servicios por Defecto
export default {

    createTicket,
    getAllTickets,
    getTicketByCode,
    getTicketsByEmail,
    
};