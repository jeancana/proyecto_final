
// 1) Habilitando Rutas Estaticas: 

// importamos el modulo 'url' de node y usamos sus configuraciones
import * as url from 'url'

export const __filename = url.fileURLToPath(import.meta.url)
export const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

/**
 * Al estar habilitado el type: Module(sistema de Modulos) en el ECMAS 
 * No es posible usar la constante __dirname(esta definida para common.js)
 * Debemos crear a MANO las constantes necesarias para que funcione y luego exportarlas 
*/

// ---------------------------------------------------------------------------------------------// 

// 2) Habilitando el Modulo bcrypt - para el Hashaer de Claves: 
import bcrypt from 'bcrypt'

// creando 2 funciones Helpers

// 2.1) 1er Helpers: Hashae el password que viene user y se usa el metodo .hashSync de bcrypt hashear la clave
export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

// 2.2) 2do Helpers: compara el password guardado en la BD con el password sin hashear del user 
export const isValidPassword = (passwordInBody, passwordInBD) => bcrypt.compareSync(passwordInBody, passwordInBD)

/**
 * Usamos el metodo compareSync de bcrypt para comparar el password ya hashead 
 * guardado en la BD y lo compara con el el password sin hashear del usurio,  
 * devolvera true o false dependiendo si el password coincide o no 
 * le pasamos al funcion el password "passwordInBody" que llego del client  
 * y lo comparamos password "passwordInBD" que esta en la BD 
*/

// ---------------------------------------------------------------------------------------------//  

// 3) Trabajando con JWT (jsonWebToken) - Standard para la Autenticacion de Sessiones mediante CREDENCIALES 

// 3.1) Importacion de los Modulo Necesarios
import jwt from 'jsonwebtoken'
import passport from 'passport' // Rutina de intercepción de errores para passport con JWT

// 3.2) Importacion del Archivo config donde Estan todo los Datos sensibles
import config from './config/config.js'

// 3.3) Private key es para cifrar/firmar el JWT
const PRIVATE_KEY = config.JWT_ENV.jwtSecretOrKey

// 3.4)creamos 3 funciones:

// 3.4.1) Funciona para Crear el JWT: 
export const generateToken = (payload, duration) => jwt.sign({ payload }, PRIVATE_KEY, { expiresIn: duration })
/** 
 * Esta funcion se usa al momento del login del usuario como un middleware 
 * En lugar de generar una sesion, Generamos un token en el endpoint: /api/sessions/login
 * payload = user (carga util datos del USUARIO INJERTADOS EN EL JWT que usaremos despues para validar) 
*/

// 3.4.2) Funcion para Verificar y Validar el token Creado - Hecho a Mano para Validar sin Passport
export const authToken = (req, res, next) => {

    // verificando lo que llega en la query
    //console.log('authToken - ' ,req.query.access_token)

    // __________ las 3 Formas en la Recibo el JWT - Refuerzo con un Ternario_____________

    // Caso 1: si viene por el req.headers
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;

    // Caso 2: si viene por el req.cookie
    const cookieToken = req.cookies && req.cookies['cookie-JWT'] ? req.cookies['cookie-JWT'] : undefined;

    // Caso 3: si viene por el req.query
    const queryToken = req.query.access_token ? req.query.access_token : undefined;

    const receivedToken = headerToken || cookieToken || queryToken
    // Usamos el OR para que siempre entre alguno de los casos 
    // Tiene 3 Opciones para Extraer el Token 

    // SiNO estoy recibiendo ningun TOKEN redirecciono a /login 
    if (!receivedToken) return res.redirect('/login')

    // Como si RECIBI EL TOKEN entonces lo valido 
    jwt.verify(receivedToken, PRIVATE_KEY, (err, credentials) => {

        //console.log('jwt.verify - credentials', credentials)
        //console.log('jwt.verify - err', typeof(err), err.message)
        
        // Si el token no es validdo o expiro su tiempo 
        if (err) return res.redirect('/login')

        // Si todo esta bien guardo la credenciales 
        req.user = credentials

        // salgo del middleware y sigo con el endpoint que corresponde
        next()
    })
}

// ---------------------------------------------------------------------------------------------//  

// 4) Rutina de Intercepción de errores Mejorada para passport
export const passportCall = (strategy, options) => {

    // console.log(strategy, options)
    // Retorna un Callback Asincrono 
    return async (req, res, next) => {

        //console.log(req)

        //Dentro de la Callback uso la estrategia de passport
        passport.authenticate(strategy, options, (err, user, info) => {

            // Importante: Aca se hace una Captura de errores mas optima 

            // Caso 1 - Captura de errores mas optima 
            if (err) return next(err);

            // Caso 2 - Captura de errores mas optima 
            if (!user) return res.status(401).send({
                status: 'ERR -',
                data: info.messages ? info.messages : info.toString()
            });

            // Caso 3: Sino Existen errores Seteamos el usuario y sigue el next();
            req.user = user;
            next();

        })(req, res, next);
    }
}

// ---------------------------------------------------------------------------------------------//  

// 5) Creamos un Middleware de Autorización por ROLES - para JWT 
export const authorizationMid = (roles) => {

    // Devuelve un Callback Asincrono que hace el chequeo de los Roles Asignados
    return async (req, res, next) => {

        //console.log('LLEGO a authorizationMid:', req.user.payload.role)

        // Sino Existe un req.user - reporta el siguiente error 
        if (!req.user)
            return res.status(401).send({ status: 'ERR', data: 'No autenticado' });    

        // Si Existe un req.user pero es distinto al role que llega por el parametro (role) reporta el siguiente error 
        // "req.user.payload.role" fue creado cuando generamos el Token al hacer login
        // "role" fue parametro asignado en la ruta cuando usamos el Middleware authorization('admin') endpoint Nro 15
        
        //console.log(roles)
        
        if (roles.includes(req.user.payload.role)) return next();
        
        res.status(403).send({ status: 'ERR - authorizationMid ', data: 'Sin permisos suficientess' });

        

    }
}

/** 
 * RESUMEN DEL MID AUTH: Este mid de autorización nos permite comenzar a manejar el tema de roles,
 * es decir, niveles de permisos de usuario
 * Observar que aparece next, además de req y res.
 * next nos permite continuar la secuencia de la "cadena".
 * En este caso, si el usuario es admin, llamanos a next, caso contrario
 * devolvemos un error 403 (Forbidden), no se puede acceder al recurso.
 * Si ni siquiera se dispone de req.session.user, directamente devolvemos error
 * de no autorizado. 
*/

// ---------------------------------------------------------------------------------------------//  

// 6) Habilitando NodeMailer - nos permitirá enviar mails usando un servidor SMTP
import nodemailer from 'nodemailer'; 

/**
 * 'nodemailer' - Modulo para poder contactarnos con algun servicio SMTP
 * Este servicio de NodeMailer nos permitirá enviar mails usando un servidor
 * saliente (SMTP) de Google, en el cual nos identificaremos con nuestra cuenta
 * de Gmail, pero ATENCION, NO usaremos la clave habitual, sino una clave de
 * aplicación (config.GOOGLE_APP_PASS) que deberemos activar en:
 * https://myaccount.google.com/apppasswords
 */

// 6.1) Habilitando el Servicio que me permite Enviar Mails Usando Servidor Saliente (SMTP)
const mailerService = nodemailer.createTransport({

    service: config.SERVICE, // Aca le indico el servicio con el cual voy a trabajar 
    port: 587, // Aca le indico el puerto en el que trabaja el servicio 
    auth: {

        // Aca van los datos de Autenticaion 
        user: config.GOOGLE_APP_EMAIL_ENV,
        pass: config.GOOGLE_APP_PASS_ENV

    }
});

// 6.2) Creamos un middleware para Notificar el Resgistro de Usuarios Via Mail
/** 
 * IMPORTANTE en el Caso Particular del middleware "sendConfirmation() ": 
 * Como se necesita hacer una llamada Asincrona a un Serivicio Externo (SMTP) 
 * NO se define la funcion sendConfirmation() como Asincrona
 * Definimos como Asincrono el Resultado (return async (req, res, next) => {})
 * Lo que retorna la funcion es un Resultado ASINCRONO 
*/

export const sendConfirmation = () => {

    // Agregando es una Capa Asincrona para el Servicio de Envio de Mail con SMTP
    // NO se debe hacer la Funcion Asyncrona SINO que se retorna un Resultado ASINCRONO
    return async (req, res, next) => {

        try {

            //console.log('sendConfirmation', req.user)

            const subject = 'KUIKI-STORE Confirmacion de Registro';
            const html = `<h1>KUIKI-STORE confirmación registro</h1><p>Muchas gracias por registrarte ${req.user.first_name} ${req.user.last_name}!, te hemos dado de alta en nuestro sistema con el email ${req.user.email}</p>`;

            // Enviamos utilizando NodeMailer
            await mailerService.sendMail({

                from: config.GOOGLE_APP_EMAIL_ENV,
                to: req.user.email,
                subject: subject,
                html: html

            });

            next();

        } catch (err) {

            res.status(500).send({ status: 'ERR - mailerService', data: err.message })

        }
    }
}

// 6.3) Creamos un middleware para Notificar restauracion del Password de Usuarios Via Mail

/**
 * IMPORTANTE en el Caso Particular del middleware "sendConfirmation() ": 
 * Como se necesita hacer una llamada Asincrona a un Serivicio Externo (SMTP) 
 * NO se define la funcion sendConfirmation() como Asincrona
 * Definimos como Asincrono el Resultado (return async (req, res, next) => {})
 * Lo que retorna la funcion es un Resultado ASINCRONO 
*/

export const restoreRequest = () => {

    // Agregando es una Capa Asincrona para el Servicio de Envio de Mail con SMTP
    // NO se debe hacer la Funcion Asyncrona SINO que se retorna un Resultado ASINCRONO
    return async (req, res, next) => {

        try {

            //console.log(req.user)

            const { email } = req.user
            //const { newPassword } = req.newPassword
            //console.log('restoreRequest', email)
            
            // Generamos token de corta duración
            const token = generateToken({ email: email }, '30m'); // Válido solo por 30 mins

            const subject = 'KUIKI-STORE Restablecimiento de Password';
            const html = `
                <h1>${config.APP_NAME}</h1>
                <h2>Restablecimiento de contraseña de cuenta</h2>
                <p><b>Atención!</b>: ${req.user.first_name} ${req.user.last_name}! si usted NO ha solicitado este mail, simplemente ignórelo</p>
                <p>Para generar una nueva clave en su cuenta, ingrese por favor al siguiente enlace:</p>
                <p><a href="http://localhost:5000/restoreConfirm?access_token=${token}"> http://localhost:5000/restoreConfirm?access_token=${token}</a></p>
                `;

            // Enviamos utilizando NodeMailer
            await mailerService.sendMail({

                from: config.GOOGLE_APP_EMAIL_ENV,
                to: req.user.email,
                subject: subject,
                html: html

            });

            next();

        } catch (err) {

            res.status(500).send({ status: 'ERR - mailerService', data: err.message })

        }
    }
}

// ---------------------------------------------------------------------------------------------//  

// 7) Creamos un middleware para Registrar Usuarios 
import { UsersController } from './controllers/user.controller.mdb.js'
const userController = new UsersController()

export const registerUser = async (req, res, next) => {

    try {

        // Desestructuramos el req.body (el JSON con los Datos a Actualizar)
        const {
            first_name,
            last_name,
            email,
            password,
        } = req.body

        // Registrando un Usuario en la BD con su clave hasheada
        const [errors, user] = await userController.addUser({
            first_name,
            last_name,
            email,
            password: createHash(password)//createHash() para hashear la clave usario antes de enviar a la DB
        })

        if (errors) {

            //console.log('errors', errors)
            
            // Aca codifico la respuesta que voy a enviar x la URL como Error para que no se vea x la URL
            const b64error = btoa(JSON.stringify(errors))
            return res.redirect(`/register?errors=${b64error}`)
        }

        // Si todo esta bien guardo el user 
        req.user = user

        // salgo del middleware y sigo con el endpoint que corresponde
        next()

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }


}

// ---------------------------------------------------------------------------------------------//

// 8) Creamos un middleware para buscar Users en la BD 
export const searchUserInDB = async (req, res, next) => {

    try {

        // Recuperamos del body los datos de usuario ingresados,
        const { email } = req.body;
        
        //console.log('aca-email', email)
        
        // Validando lo Campos de entrada
        if (email.length === 0) {

            res.render('restoreRequest')

        }

        // Buscando en la BD si existe un usario con el email pasado por el cliente
        const userInDB = await userController.getByEmail(email)
        //console.log( 'userInDB ', userInDB)

        //Si todo esta bien guardo el user y el nuevo password a hashear en la request
        if (userInDB) {
         
            req.user = userInDB

            next();
           
        } else { 

            const passUpdate = false;
            // Aca codifico la respuesta que voy a enviar la URL - como Erro - para que no se vea en la URL
            return res.redirect(`/restore?passUpdate2=${passUpdate}`)

        }

        
    } catch (err) {
    
        res.status(500).send({ status: 'ERR - searchUserInDB', data: err.message })

    }
    
}

// ---------------------------------------------------------------------------------------------//

// Habilitando Twilio nos permitirá enviar mensajes SMS, Whatsapp y Telegram
//import twilio from 'twilio';

// quedo en proceso de fabricacion tuve problemas con verificar mi telefono con twilio

// ---------------------------------------------------------------------------------------------//

// **** Middleware de autorización de un Usuario con ROLE de admin - SOlO SIRVE PARA express-session ****
// En este caso, si el usuario es admin, llamanos a next, caso contrario
// devolvemos un error 403 (Forbidden), no se puede acceder al recurso.
// Si ni siquiera se dispone de req.session.user, directamente devolvemos error de no autorizado.
// const auth = (req, res, next) => {

//     try {
//         // Autenticamos que el objeto user este autozido
//         if (req.session.user) {

//             // Al ser un usuario valido verificamos si su rol es Admin
//             if (req.session.user.role == 'admin') {

//                 next()

//                 // Sino esta Autorizado Admin devolvemos el siguiente mensaje
//             } else {

//                 res.status(403).send({ status: 'ERR', data: 'Usuario NO ES admin' })

//             }

//             // Sino esta Autenticado devolvemos el siguiente mensaje 
//         } else {

//             res.status(401).send({ status: 'ERR', data: 'Usuario no autorizado' })

//         }

//     } catch (err) {
//         res.status(500).send({ status: 'ERR', data: err.message })
//     }
// }

