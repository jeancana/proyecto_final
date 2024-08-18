import { Router } from 'express'
import { UsersController } from '../controllers/user.controller.mdb.js' 
import { passportCall, authorizationMid } from '../utils.js'
import { createHash, isValidPassword, sendConfirmation, registerUser } from '../utils.js'
import nodemailer from 'nodemailer'; 

//Importando la Capa de Servicios para interactuar con el BBDD
import userService from '../services/user.service.js'

// Importando los modulos para poder hacer GESTION CENTRAL DE ERRORES - Middleware de captura general de errores
import CustomError from "../config/error.custom.class.js";
import errorsDictionary from "../config/error.dictionary.js";
import config from '../config/config.js';
import { uploader } from '../uploader.js'

// - Activando el Modulo Router de Express
const router = Router()

// - Generando una nueva Intanscia del UsersController
const userController = new UsersController()

// ************* Paquete de Rutas ********************

// 1)
router.get('/test-getByEmail', passportCall('jwtAuth', { session: false }), async (req, res) => {

    const userMail = req.user.payload.username
    console.log(userMail)

    try {

        // Paso 3: Usando el Metodo .getUsers() disponible en archivo user.controller.mdb.js
        const user = await userController.getByEmail(userMail)

        // Aca Mandamos la respuesta al cliente con el listado de usuarios encontrados 
        res.status(200).send({ status: 'Ok. User Encontrado', data: user })

    } catch (err) {

        res.status(500).send({ status: 'ERR-USERS', data: err.message })

    }

})

// 2) Endpoint para registrar users en la BD con Formulario de Registro
router.post('/register', registerUser, sendConfirmation(), async (req, res) => {

    //console.log('/register',req.body) // Para verificar todo lo que esta llegando la peticion POST

    try {

        req.logger.info('Sea Registrado un Nuevo Usuario ')

        res.redirect('/login') 

        // Esto lo use para el superTest
        // res.status(200).send({ status: 'ok', data: req.user })


    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

})

// 3) Endpoint para Actualizar un usuario en la DB - Con POSTMAN
router.put('/:id', async (req, res) => {

    try {

        // Asignamos a id el ID que nos llega req.params
        const { id } = req.params

        // IMPORTANTE: Aca verifico lo que viene por req.params - Esta llegando un document y necesito pasar un ID 
        console.log(id)

        // Desestructuramos el req.body (el JSON con los Datos a Actualizar)
        const { firstName, lastName, email, gender } = req.body

        // Verificamos y Validamos los valores recibidos
       /*  if (!firstName || !lastName || !email || !gender) {
            return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' })
        } */

        // IMPORTANTE: Aca tenemos un else{} intrinsico por la lectura en cascada 

        // Creamos un Nuevo document con los Datos Desestructurados
        const newContent = {

            firstName, //Se puede poner asi el document y JS enviente que la propiedad Y el valor tienen el MISMO NOMBRE
            lastName,
            email,
            gender

        }

        // Paso 3: Usando el Metodo .updateuser() disponible en archivo user.controller.mdb.js
        const result = await userService.updateUser(id, newContent)

        // Aca Mandamos la respuesta al cliente
        res.status(200).send({ status: 'OK. user Updated', data: result })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }


})

// 4) Borrando un usuario de la DB 
router.get("/:id", async (req, res) => {

    try {

        // Asignamos a id el ID que nos llega req.params)
        const { id } = req.params

        // IMPORTANTE: Aca verifico lo que viene por req.params - Esta llegando un document y necesito pasar un ID 
        console.log(id)

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) y no el document completo 
        //console.log(id)

        // Paso 3: Usando el Metodo .deleteUserById() disponible en archivo user.controller.mdb.js
        const result = await userController.deleteUserById(id)

        // Aca Mandamos la respuesta al cliente
        // res.status(200).send({ status: 'OK. user Deleted', data: result })

        res.redirect('/users')

    }   catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }
})

// 5) Paginado - Ejemplos Viejos 
router.get('/test-paginated', async (req, res) => {
    
    try {

        const users = await userController.getUsersPaginated()
        
        res.status(200).send({ status: 'OK', data: users })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/api/users/test-paginated
    // Nota el resultado de la esta ruta la puedo pasar a un plantilla (html/handlebars), lo puede consumir un Frontend y con eso ARMAMOS LA BARRA DE PAGINACION / LINEA DE PAGINACION 

})

// 6) Paginado - Ejemplos Viejos 2 
router.get('/test-paginated2', async (req, res) => {

    try {

        // Asignamos a id el ID que nos llega req.query
        const pagineted = req.query

        // IMPORTANTE: Aca verifico lo que viene por req.quey - Esta llegando un document y necesito pasar un ID 
        console.log(pagineted)

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) y no el document completo 
        //console.log(pagineted.page)
        //console.log(pagineted.limit)
        

        const users = await controller.getUsersPaginated2(pagineted.page, pagineted.limit)

        res.status(200).send({ status: 'OK', data: users })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar:
    // 1) http://localhost:5000/api/users/test-paginated2
    // 2) http://localhost:5000/api/users/test-paginated2?limit=5&page=1&sort=desc
    // 3) http://localhost:5000/api/users/test-paginated2?limit=50&page=1&sort=desc
    // 4) http://localhost:5000/api/users/test-paginated2?limit=100&page=2&sort=desc 
    // IMPORTAN: al usar el sort=desc MongoDB Ordena todo de Menor a Mayor por su _id(este es el asgigna mongoDB) AUTOMATICAMENTE SIN USAR NINGUN PARAMETRO 
    // Nota: el resultado de la esta ruta la puedo pasar a un plantilla (html/handlebars), lo puede consumir un Frontend y con eso ARMAMOS LA BARRA DE PAGINACION / LINEA DE PAGINACION 

})

// 7) Endpoint para Generar usuario con faker-js
router.get('/mockUser/:qty([1-9]*)', async (req, res) => {
    /**
     * Nota: Estoy usando un Expresion Regular para controlar 
     * y solo pueden entrar Nros del 1 al 9 por el req.params 
    */

    try { 

        const qty = req.params.qty

        const users = await userController.generateMockUsers(qty)

        res.status(200).send({ status: 'OK', data: users })

    } catch (err){

        res.status(500).send({ status: 'ERR', data: err.message })

    }
    

 })

// 8) Endpoint de PRUEBA para manejo con GESTOR CENTRAL DE ERRORES - Middleware de errores personalizado
router.post("/testing-errorsMiddleware", async (req, res, next) => {

    const {
        first_name,
        last_name,
        email,
        password,
    } = req.body

    if (first_name && last_name && email && password) {

        return res.status(200).send({ status: "OK", data: 'La Prueba de testing-errorsMiddleware NO SE ACTIVO ' });

    }

    /**
    * Nota: Si todo va bien, procesamos la creación de usuario y retornamos la respuesta deseada.
    * Si hay problemas, retornamos una llamada a next() con una nueva instancia de nuestra
    * clase de error personalizada, esto será capturado por el middleware central de gestión
    * de errores en app.js.
    * 
    * Dejamos de Usar el Try/Catch y ahora para todo directamente a traves de la Clase Error propia de Express
    * Paso 1: Directamente Instacionamos una nueva clase de CustomError()
    * Paso 2: la Pasamos como parametro el errorsDictionary
    * colocar toda la respuesta dentron del next() para que lo pueda ejecutar el GESTOR CENTRAL DE ERRORES
    * Importante: De esta manera vamos dejando cada vez mas limpios los Endpoints
    */

    return next(new CustomError(errorsDictionary.FEW_PARAMETERS));
    
});

// 9) Endpoint para Testing de logs
router.get('/customdAddLogger', async (req, res) => {

    try {

        // Uso del standardAddLogger
        //req.logger.verbose('Modo=devel - Solo Reporta Logs a partir Nivel verbose en Adelante')
        //req.logger.warn('Modo=prod - Guarda Logs a partir Nivel warn en adelante')

        // Uso del customdAddLogger
        // Testear Modo=devel
        req.logger.debug('Modo=devel - Solo Reporta Logs a partir Nivel debug en Adelante')

        // Testear Modo=prod
        req.logger.info('Modo=prod - Solo Reporta Logs a partir Nivel en adelante')
        req.logger.warning('Modo=prod - Guarda Logs a partir Nivel warning en adelante el 10/07/2022')

        // Aca Mandamos la respuesta al cliente con el listado de usuarios encontrados 
        res.status(200).send({ status: 'Ok - Testing customdAddLogger ', data: `Esta en Modo = ${config.MODE}` })

    } catch (err) {

        res.status(500).send({ status: 'ERR-USERS', data: err.message })

    }

})

// 10) Endpoint para cambiar de Role el usuario - solo por el Admin 
router.get('/premium/:uid', passportCall('jwtAuth', { session: false }), authorizationMid(['admin']), async (req, res) => {

    try {

        const { uid } = req.params;

        // Recuperar el usuario por id y ver el valor actual del rol
        const user = await userController.getUserById(uid);

        // Validaciones previas antes de cambiar de Role
        if (!user) {
            return res.status(404).send({ status: 'user Not Found' }); 
        }

        /* if ((user.role === undefined || user.role === 'user') && user.document.length < 3) {
            //return res.status(404).send({ status: 'number of documents invalid' });
            res.redirect('/uploadForm')
        } */

        // Si todo esta bien hace el proceso de cambio de Role
        // si es premium pasa a user, si es user pasa a premium 
        // Uso un ternario 
        user.role = user.role === 'premium' ? 'user' : 'premium';

        // Llamar al método update().
        const update = await userController.updateUserProperti({ _id: uid }, user, { new: true });
        
        //res.status(200).send({ status: 'Ok - User Role Modificado', data: update });

        res.redirect('/users')

    } catch (err) {

        res.status(500).send({ status: 'ERR-USERS - /premium/:uid', data: err.message });
    }

});

// 11) Endpoint para cargar Documentos del User y Poder Subir de Role de User a Premiun 
router.post('/documents', passportCall('jwtAuth', { session: false }),uploader.array('docs', 3), async (req, res) => {

    try {

        //console.log('Archivos', req.files)// Verificando los Archivos llegados con Multer
        const arrayDocuments = req.files 
        
        //console.log(arrayDocuments)

        // Obteniendo el Mail del usario
        const userMail = req.user.payload.username

        // Buscando en la BD si existe un usario con el email pasado por el cliente
        const user = await userController.getByEmail(userMail)
        // console.log(user)

        //console.log(user.document)

        // Validaciones previas antes de cambiar de Role
        if (!user) {
            return res.status(404).send({ status: 'user Not Found' });
        }

        if (Array.isArray(user.document)) {
            
            arrayDocuments.forEach(obj => {
                //console.log(obj.originalname)
                //console.log(obj.destination)

                user.document.push({ name: obj.originalname, reference: obj.destination })
            })

        }

        // console.log('original',user.role)
        
        if ((user.role === 'user')) {
            //console.log('paso por aca')
            user.role = user.role === 'user' ? 'premium' : 'premium';
        }

        // console.log('cambiado',user.role)

        // Llamar al método update().
        const updateDocuments = await userController.updateUserProperti({ email: userMail }, user, { new: true });

        //res.status(200).send({ status: 'Ok - User Documents Updated', data: 'updateDocuments' });
        //res.status(200).send({ status: 'Ok - User Documents Updated', data: updateDocuments });
        res.redirect('/users')

    } catch (err) {

        res.status(500).send({ status: 'ERR-USERS - /:uid/documents', data: err.message });
    }

});

// 12) Borrando los usuario no conectados en los ultimos 2 dias
router.get("/deleteInactiveUsers", async (req, res) => {

    try {

        const mailerService = nodemailer.createTransport({

            service: config.SERVICE, // Aca le indico el servicio con el cual voy a trabajar 
            port: 587, // Aca le indico el puerto en el que trabaja el servicio 
            auth: {

                // Aca van los datos de Autenticaion 
                user: config.GOOGLE_APP_EMAIL_ENV,
                pass: config.GOOGLE_APP_PASS_ENV

            }
        });

        const users = await userController.findInactiveUsers()

        // console.log(users.length)

        for (let i = 0; i < users.length; i++) {
            
            const subject = 'KUIKI-STORES baja de cuenta';
            const html = `<h1>KUIKI-STORE baja de cuenta</h1><p> ${users[i].first_name} ${users[i].last_name}!,Hemos dabo de baja tu cuenta por falta de uso</p>`;

            // Enviamos utilizando NodeMailer
            await mailerService.sendMail({

                from: config.GOOGLE_APP_EMAIL_ENV,
                to: users[i].email,
                subject: subject,
                html: html

            });

        }
        
       await userController.deleteInactiveUsers()

        // Aca Mandamos la respuesta al cliente
        // res.status(200).send({ status: 'OK. Inactive Deleted', data: 'usuarios Dados de Baja en la BBDD' })
        res.redirect("/api/users")

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }
})

export default router