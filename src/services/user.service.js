
// CAPA INTERMEDIA DEL SERVICIO DEL MVC  - Intermediario entre La Capa Controllers y La Capa Model

// Importando el usersModel
import usersModel from '../models/users.model.js'

// 1) Servicios para: 
const createUser = async (data) => {

    //req.logger.info('pase por el Servicio - createUser')
    //console.log("pase por el Servicio - createUser")
    return await usersModel.create(data)

}

// 2) Servicios para: 
const findUserByEmail = async (data) => {

    //req.logger.info('pase por el Servicio - findUserByEmail')
    //console.log("pase por el Servicio - findUserByEmail")
    return await usersModel.findOne(data)

}

// 3) Servicios para:
const getAllUsers = async () => {

    //req.logger.info('pase por el Servicio - getAllUsers')
    //console.log("pase por el Servicio - getAllUsers")
    return await usersModel.find().lean() 

}

// 4) Servicios para:
const getUserById = async (id) => {

    //console.log(id)

    //req.logger.info('pase por el Servicio - getUserById')
    //console.log("pase por el Servicio - getUserById")
    return await usersModel.findById(id)

}

// 5) Servicios para:
const updateUser = async (id, newContent) => {

    //req.logger.info('pase por el Servicio - updateUser')
    //console.log("pase por el Servicio - updateUser")
    return await usersModel.findByIdAndUpdate(id, newContent)

}

// 6) Servicios para:
const deleteUserById = async (id) => {

    //req.logger.info('pase por el Servicio - deleteUser')
    //console.log("pase por el Servicio - deleteUser")
    return await usersModel.findByIdAndDelete(id)

}

// 7) Servicios para:
const restorePassByEmail = async (email, password) => {

    //req.logger.info('pase por el Servicio - deleteUser')
    //console.log("pase por el Servicio - RestorePass")
    return await usersModel.findOneAndUpdate({ email: email }, { password: password })

}

// 8) Servicios para:
const updateUserProperti = async (filter, update, options) => {

    //req.logger.info('pase por el Servicio - updateUser')
    //console.log("pase por el Servicio - updateUserRole")
    return await usersModel.findOneAndUpdate(filter, update, options)

}

// 9) Servicios para:
const findInactiveUsers = async () => {

    const time = new Date();
    //const senconds = time.setSeconds(time.getSeconds() - 30)
    //const fiveMinutesAgo = time.setMinutes(time.getMinutes() - 5);
    const twoDaysAgo = time.setDate(time.getDate() - 2);

    return await usersModel.find({ last_connection: { $lt: twoDaysAgo } });


}

// 10) Servicios para:
const deleteInactiveUsers = async () => {

    const time = new Date();
    //const senconds = time.setSeconds(time.getSeconds() - 30)
    //const fiveMinutesAgo = time.setMinutes(time.getMinutes() - 5);
    const twoDaysAgo = time.setDate(time.getDate() - 2);

    return await usersModel.deleteMany({ last_connection: { $lt: twoDaysAgo } });
        
    
}

// Exportando todos Los Servicios por Defecto
export default {

    createUser,
    findUserByEmail,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUserById,
    restorePassByEmail,
    updateUserProperti,
    deleteInactiveUsers,
    findInactiveUsers

 
};