// 1) MODULOS DE TERCEROS: Importando los frameworks y Modulos completos 
import express from 'express'
import handlebars from 'express-handlebars' 
import hbs from 'handlebars'
import mongoose from 'mongoose' 
import { Server } from 'socket.io' 
import http from 'http' 
import cookieParser from 'cookie-parser'  
import passport from 'passport'
import addLogger from './config/winston.logger.js'
import session from 'express-session'
import sessionMongoStore from 'connect-mongo'

// 1.1) Modulos Desactivados 
//import FileStore from 'session-file-store'

// 2) PARA TRABAJAR LA DOCUMENTACION: Importamos swaggerJsdoc y swaggerUiExpress
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

// 3) MODULOS PROPIOS -- Para el Manejo de Rutas Estaticas 
import { __dirname } from './utils.js' //  

// 4) Esta Pieza de Codido me Permite Crear Persisten de los Mensajes del CHAT en MongoAtlas
import { MessageController } from './controllers/message.controller.md.js'
// 4.1) Creando un Nueva Instancia del MessageController
const messageController = new MessageController()

// 5) Importando Rutas Dinamicas
import viewsRouter from './routes/views.routes.js' 
import productsRouter from './routes/products.routes.js'
import cartsRouter from './routes/carts.routes.js'
import sessionsRouter from './routes/sessions.routes.js'
import usersRouter from './routes/users.routes.js'

// 6) Conectando con el Motor de Base de Datos "LOCAL" de MONGODB (MONGO COMPAS) desde el config.js  
// Importamos el objeto config donde esta todas las variables de entorno
import config from './config/config.js' 

// 7) Importando el Diccionario de Errores 
import errorsDictionary from './config/error.dictionary.js';
 
// 8) Creando un Array Vacio para guardar los mensajes enviados por el socketClient  
const message_load = []

// 9) Encapsulamos todo en un Try/Catch
try {

    // 9.1) Intentamos conectar con MONGO ATLAS
    await mongoose.connect(config.MONGOOSE_URL_REMOTE)

    // 9.2) Inicializando Express 
    const app = express() 

    // 9.3) Habilitaciones para poder Servir Contenidos de express() y de webSocket() al mismo tiempo
    // Creo un Modulo http y le paso Express/app como parametro 
    const server = http.createServer(app) 

    // 9.4) Generamos la configuración inicial para los Paquetes de Documentacion con swaggerJsdoc 
    const swaggerOptions = {

        // Aca estamos definiendo la Cabecera del archivo de Documentacion de la API 
        definition: {

            openapi: '3.0.1',
            info: {
                title: 'API KUI KUI Store / Autenticacion con JWT / Alumno: Jean Canache',
                description: 'Esta documentación cubre toda la API habilitada para el Ecommerce - KUI KUI STORE',
            },

            // Aca agregamos los componentes del headers para usar JWT con swaggerOptions
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            },
            security: [{
                BearerAuth: []
            }],

        },
    
        apis: ['./src/docs/**/*.yaml'], // todos los archivos de configuración de rutas estarán aquí
    };

    // 9.4.1) Activando el Modulo swaggerJsdoc y pasandole mis opciones de configuracion 
    const specs = swaggerJsdoc(swaggerOptions);

    // 10) Poniendo a Escuchar el servidor de Express 
    server.listen(config.PORT, () => {

        console.log(`Backend activo activo en Modo:${config.MODE} Conetado al puerto:${config.PORT} en la BBDD:${config.MONGOOSE_URL_REMOTE}`)

    })

    // 11) Creando una nueva instacia del Socket.io y la pasamos "server" como parametro 
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
            credentials: false
        }
    })

    // 11.1) Ponemos al Socket Server a escuchar Eventos del Cliente
    io.on('connection', socket => {

        // Aca estoy mostrando el ID del Socket-cliente conectado  
        //console.log(`nuevo cliente Conectado ID: ${socket.id} `)

        // 11.1.1) Escuchando el evento bajo el topico 'client:user_authenticate'
        socket.on('client:user_authenticate', data => {
            
            // Verificando el usuario que se conecto y me enviaron del cliente
            //console.log(data)

            // Enviando a TODOS los clientes conectados que se Conecto un NUEVO usario al Chat
            socket.broadcast.emit('server:broadcast_all', data)

        })

        // 11.1.2) Escuchando el evento bajo el topico 'client:chat_message'
        socket.on('client:chat_message', async data => {

            // Paso 1: Aca mostramos la Data que recibimos del socketClient
            //console.log(data)

            // Guardando los mensajes recibidos en la BBDD
            const add = await messageController.addMessage(data)

            //Guardando en un array todos menesajes recibidos del evento 'client:chat_message'
            message_load.push(add)
            
            //Paso 2: Enviamos al cliente el array message_load para mostrarlo
            io.emit('server:messageLogs', message_load)
            
            
        })

    })

    // 12) Habilitadon a Express para manejar paquetes json correctamente
    app.use(express.json())

    // 13) Habilitando a express para trabajar con urls 
    app.use(express.urlencoded({ extended: true }))

    // 14) Habilitatndo a Express para crear y poder trabajar con cookies 
    app.use(cookieParser(config.COOKIES_ENV.cookeiSecretKey))

    // 15) Habilitamos el Modulo de session para usarlo con express
    app.use(session({

        // 15.1) Instancia para almacenar datos de sesión en MongoDB - Usando el MODULO sessionMongoStore
        store: sessionMongoStore.create({
            mongoUrl: config.MONGOOSE_URL_REMOTE,
            mongoOptions: {},
            ttl: 60,
            clearInterval: 3600
        }),
        secret: config.COOKIES_ENV.cookeiSecretKey, // Firmamos la cookie.sid evitar usarlo si el cliente la modifica
        resave: false, // Permite tener la session Activa a pesar de estar inactiva
        saveUninitialized: false 

        /**
         * saveUninitialized: Si esta en true guarda (memoria o archivo...etc) la session 
         * aunque NO se alla modificada nada en el req.session ... 
         * Si le pongo false NO la almacena hasta cambie los datos en el login
         * 
         * A Partit de ahora podemos GUARDA INFORMACION de sesiones DEL CLIENTE DEL LADO DEL SERVIDOR 
         */

    }))

    // 16) Habilitamos el Modulo "passport" en la app para poder Hacer Estrategias de Autenticacion 
    app.use(passport.initialize()) // Estamos avisando que queremos usar el modulo passport 
    app.use(passport.session())// Asocia cada solicitud HTTP con un usuario específico

    // 17) Habilitando el modulo HANDLEBARS
    app.engine('handlebars', handlebars.engine())
    app.set('views', `${__dirname}/views`)
    app.set('view engine', 'handlebars')
    hbs.registerHelper('eq', (a, b) => a === b)//Habilitatando la validacion de String en handlebars 

    // 18) Inyectado el addLoggerMidd A NIVEL GLOBAL como Middleware
    app.use(addLogger.customdAddLogger)

    // 19) Inyectamos Swagger como middleware para que genere y sirva la documentación en este endpoint
    app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

    // 20) Inicializando Paquetes de Rutas Dinamicas para la API 
    app.use('/', viewsRouter) 
    app.use('/api/carts', cartsRouter) 
    app.use('/api/products', productsRouter)
    app.use('/api/sessions', sessionsRouter)
    app.use('/api/users', usersRouter)

    // 21) Paquete de RUTAS ESTATICAS para mostrar los contenidos que estan en la carpeta PUBLIC
    app.use('/static', express.static(`${__dirname}/public`)) 

    // 22) GESTOR CENTRAL DE ERRORES - Middleware de captura general de errores
    app.use((err, req, res, next) => {

        const code = err.code || 500;
        const message = err.message || 'Hubo un problema, error desconocido';

        return res.status(code).send({

            status: 'ERR',
            data: message,

            // Habilitar si se quiere más info del error en modo development
            // stack: config.MODE === 'devel' ? err.stack : {}
        });

        /**
         * IMPORTANTE, debe estar antes del app.all().
         * Nota: Con este Middleware puedo eliminar los try/catch de las rutas 
         * Simplifica el CODIGO en los Endpoints en Caso de Necesitar usarlo  
        */

    });

    // 23) Esta es una respuesta Generica GLOBAL en caso de que no exista NINGUNA respuesta en alguna Ruta
    app.all('*', (req, res, next) => {

        res.status(404).send({ status: 'ALL-ERR', data: errorsDictionary.PAGE_NOT_FOUND.message });

    });

} catch (err) {

    // 24) Repuesta en Caso de que no se conecte a la BBDD - Usando el errorsDictionary
    console.log(`${errorsDictionary.DATABASE_ERROR.message} (${err.message})`)

}