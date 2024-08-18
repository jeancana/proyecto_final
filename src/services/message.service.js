
// CAPA INTERMEDIA DEL SERVICIO DEL MVC  - Intermediario entre La Capa Controllers y La Capa Model

// Importando el messagesModel
import messagesModel from '../models/messages.model.js'

// 1) Servicios para: 
const createMessage = async (message) => {

    //req.logger.info('pase por el Servicio - createMessage')
    //console.log("pase por el Servicio - createMessage")
    return await messagesModel.create(message)
}

// 2) Servicios para:
const getMessages = async () => {
    
    //req.logger.info('pase por el Servicio - getMessages')
    //console.log("pase por el Servicio - getMessages")
    return await messagesModel.find().lean() 

}


// Exportando todos Los Servicios por Defecto
export default {

    createMessage,
    getMessages   

};