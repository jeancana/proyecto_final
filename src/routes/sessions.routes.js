import { Router } from 'express'
import { UsersController } from '../controllers/user.controller.mdb.js'
import passport from 'passport'
import { createHash, isValidPassword, searchUserInDB, passportCall } from '../utils.js'
import { generateToken, authToken, restoreRequest} from '../utils.js'

// Para Trabajar la Autenticacion con Modulo Passport
import initPassport from '../auth/passport.auth.js' // Importo el Metodo initPassport creado en la carpete config

// Inicializando Modulo Passport
initPassport() 

const router = Router()
const userController = new UsersController()

// ************* Paquete de Rutas ********************

// 1) Endpoint para AUTENTICAR y hacer "login" de un Usuario 
router.post('/login', async (req, res) => {

    //console.log(req.body) // Para verificar todo lo que esta llegando la peticion POST
    try {

        // Desestructuramos lo que viene en el body via post
        const { email, password } = req.body
        //console.log(password)

        // Buscando en la BD si existe un usario con el email pasado por el cliente
        const userInDB = await userController.getByEmail(email)
        //console.log(userInDB.password)
         
        // Validamos los Datos de Usuario contra la BD
        if (userInDB !== null && isValidPassword(password, userInDB.password)) {
            
            // Registrando la Ultima Conexion del usuario
            userInDB.last_connection = Date.now()

            // Actualizando ultimo conexion 
            await userController.updateUserProperti({ email: email }, userInDB, { new: true });
            
            //console.log(updateLastConec)

            // *** Utilizando JWT ***
            // la funcion generateToken() tiene 2 parametros
            // Parametro 1: le pasamos los Datos de usuario - Estas SON LA CREDENCIALES - payload
            // Parametro 2: la duracion del token (tiempo de vida que va a tener) en el formato que me pide JWT
            const access_token = generateToken({ username: userInDB.email, role: userInDB.role }, '1h')
            
            //console.log(access_token)

            // Genero la Cookie para guardar en el Navegador el JWT con los datos del usuario 
            res.cookie('cookie-JWT', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true })

            // Redirecciono a la Ruta /products
            //res.redirect(`/products`) // Esta es la forma tradicional

            // Uso el Metodo setTimeout para retrasar por 400 Milisegundos el redirect
            //Y permitir que cargue bien la cookie-JWT en el servidor
            setTimeout(() => {
                // Aca redirecciono despues de pasado 400 milisegundos
                res.redirect('/products')

                // Esto lo use para el superTest
                //res.status(200).send({ status: 'ok', data: req.user })

            }, 400);

            // Redirecciono a la Ruta /products y le paso por req.query el access_token
            //res.redirect(`/products?access_token=${access_token}`)
            

        } else {

            // OJO aca se hace un render y no un redirect 
            // Como no se pudo loguear bien vuelve a renderizar la vista "/login"
            res.render('login', {})

        }

    } catch (err) {
        res.status(500).send({ status: 'ERR aca', data: err.message })
    }


})

// 2) Endpoint Cerrar la Session/destruir de UN Usuario "login" 
router.get('/logout', async (req, res) => {

    //console.log(req.session) // Para verificar todo lo que esta llegando la req.session

    try {

        

        // ______ Destruyendo La cookie Creada para Usar el JWT  ______
        res.clearCookie('cookie-JWT') // Al cerrar la sesion del Usuario destruyo la cookie

        // ______ Destruyendo la Session de Usuario Hecha con el Modulo Session de Express ______
        req.session.destroy((err) => {

            // Si existe un error en proceso de logout lo reporto 
            if (err) {

                res.status(500).send({ status: 'ERR', data: err.message })

            // Sino devuelvo el mensaje exitoso
            } else {

                // Al cerrar la session redirecciono a la "/login"
                res.redirect("/login")

            }
        })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }

})

// 3) Endpoint "privado", solo visible para un Usuario con Role de "admin" 
router.get('/admin', async (req, res) => {

    //console.log(req.session) // Para verificar todo lo que esta llegando al req.session

    try {
        res.redirect('/profile')

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/api/sessions/admin
})

// 4) Endpoint para recibir la solicitud de Restauracion de password de UN Usuario ya Existente  
router.post('/restoreRequest', searchUserInDB ,restoreRequest() ,async (req, res) => {

    //console.log('del body ',req.body) // Para verificar todo lo que esta llegando la peticion POST

    try {

        // Enviando respuesta de Confirmacion de envio 
        if (req.user) {

            const passUpdate = true;

            // Aca codifico la respuesta que voy a enviar la URL - como Erro - para que no se vea en la URL
            const b64error = btoa(JSON.stringify(passUpdate))
            return res.redirect(`/restore?passUpdate=${b64error}`)
             
        } 


    } catch (err) {
        res.status(500).send({ status: 'ERR - restoreRequest', data: err.message })
    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/restore

    // Nota: Ruta para Restaurar el password de usurio usando el modulo - bcrytp

})

// 5) Endpoint para confirmar la solicitud de Restauracion de password de UN Usuario ya Existente 
router.post('/restoreConfirm', async (req, res) => {

    /**
     * Crear la nueva Password y enviar la respuesta al front 
     * Actualizar el User en la BD ,Enviar la respuesta al Front 
     * IMPORTANTE: Los Datos de Usuario estan llegando a la ruta via POST desde la plantilla  
     */

    //console.log(`lo que llego por la query`, req.user) // Para verificar todo lo que esta llegando la peticion POST
    //console.log(`lo que llego por el body`, req.body)
    try {
  
        const { email, password } = req.body

        // Restaurando el password del usuario 
        const newPass = {
            password: createHash(password)
        }

        // Actualizando en la BD el password del usuario 
        const passUpdate = await userController.updateUserPass(email, newPass.password)

        console.log(passUpdate)

        if (passUpdate.process) {

            // Aca codifico la respuesta que voy a enviar la URL - como Erro - para que no se vea en la URL
            //const b64error = btoa(JSON.stringify(passUpdate.process))
            //return res.redirect(`/restoreConfirm?passUpdate=${b64error}`)
            return res.redirect(`/restoreConfirm`)
        }
 
    } catch (err) {
        res.status(500).send({ status: 'ERR - restoreConfirm', data: err.message })
    }
 
})

// 6) AUTENTICACION POR TERCEROS - Endpoint para Autenticar LOGUEAR UN Usuario con los Datos de su cuenta de Githug 
router.get('/github', passport.authenticate('githubAuth', { scope: ['user:email'] }), async (req, res) => {
})

// 7)AUTENTICACION POR TERCEROS - Callback URL de git hub
router.get('/githubcallback', passport.authenticate('githubAuth', { failureRedirect: '/login' }), async (req, res) => {

    // Endpoint Callback para trabajar recibe de Githug el paguete de Datos con el que vamos a trabajar 
    // Chequelo que esta llegando de la ruta /github (Endpoint nro 6)
    // De aca los Datos del usuario para crear el token 
    // console.log(req.user.email)

    // Aca toma los datos de usuario con Base al paquete de Datos que viene de la ruta /github (Endpoint nro 13)
    // Y creando el JWT
    const access_token = generateToken({ username: req.user.email, admin: true }, '1h')

    // Genero la Cookie para guardar en el Navegador el JWT con los datos del usuario 
    res.cookie('cookie-JWT', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true })

    // Por ahora Reportamos con Json que efectivamente esta logueado con Credenciales de Github
    //res.status(400).send({ status: 'ok', data: 'Autenticacion Por Terceros con GitHub Realizada' })
    
    // Uso el Metodo setTimeout para retrasar por 400 Milisegundos el redirect
    //Y permitir que cargue bien la cookie-JWT en el servidor
    setTimeout(() => {
        // Aca redirecciono despues de pasado 400 milisegundos
        res.redirect('/products')

    }, 400);
       
    
})

// 8) Endpoint de PRUEBA que devuelve el USER usando Estrategia de passport.authenticate 'jwtAuth'
router.get('/current', passport.authenticate('jwtAuth', { session: false }), async (req, res) => {
    res.status(200).send({ status: 'OK - Usario Obtenido del JWT', data: req.user }) 
}) 

// 9) AUTENTICACION POR TERCEROS - Endpoint para Autenticar LOGUEAR UN Usuario con los Datos de su cuenta Google
router.get('/google', passport.authenticate('googleAuth', { scope: ['email', 'profile'] }), async (req, res) => {
})

// 10) AUTENTICACION POR TERCEROS - Callback URL de la cuenta de Google
router.get('/googlecallback', passport.authenticate('googleAuth', { failureRedirect: '/login' }), async (req, res) => {

    // Chequelo que esta llegando de la ruta /google (Endpoint nro 9)
    // De aca los Datos del usuario para crear el token 
    //console.log(req.user.email)

    // Aca toma los datos de usuario con Base al paquete de Datos que viene de la ruta /github (Endpoint nro 13)
    // Y creando el JWT
    const access_token = generateToken({ username: req.user.email, admin: true }, '1h')

    // Genero la Cookie para guardar en el Navegador el JWT con los datos del usuario 
    res.cookie('cookie-JWT', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true })

    // Respuesta Tradicional
    //res.status(200).send({ status: 'OK - Me he Autenticado con Mi Cuenta de Google', data: req.user, access_token })

    res.redirect('/products')

    
})


export default router