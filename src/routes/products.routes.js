import { Router } from 'express'
import { uploader } from '../uploader.js'
import { passportCall, authorizationMid } from '../utils.js'
import { ProductsController } from '../controllers/product.controller.mdb.js' 
import errorsDictionary from '../config/error.dictionary.js';

// Generando una nueva Intanscia aca del ProductsController 
const controller = new ProductsController()

// Inicializando el Router de Express
const router = Router()

// Funcion para Chequear quien creo el producto
export const checkOwnership = async (pid, email) => {
    const product = await controller.getProductById(pid);
    if (!product) return false;
    return product.owner === email;
}

// ************* Paquete de Rutas ********************

// 1) Endpoint para Generar Productos con faker-js
router.get('/mockingproducts/:qty', async (req, res) => {
    // Estoy usando un Expresion Regular para controlar y solo pueden entrar Nros del 1 al 100 por el req.params

    try {

        const { qty } = req.params
        console.log('aca ', qty)

        const product = await controller.generateMockProduct(qty)

        //console.log(typeof product)
        res.status(200).send({ status: 'OK - mockingproducts', data: product })

        //res.status(200).send({ status: 'OK', data: 'llegue a mockingproducts ' })

    } catch (err) {

        res.status(500).send({ status: 'ERR-aca', data: err.message })

    }


})

// 2) Endpoint para leer/Consultar todos los Productos de la DB - Con POSTMAN
router.get('/', passportCall('jwtAuth', { session: false }), authorizationMid(['admin']), async (req, res) => {

    try {

        // IMPORTANTE: Aca verifico lo que viene por req.quey - Esta llegando un Objeto y necesito pasar un ID 
        //console.log(req.query)

        // Asignamos a id el ID que nos llega req.query
        //console.log(req.query)
        let { page, limit, sort, description } = req.query

        // Paso 3: Usando el Metodo .getProducts() disponible en archivo product.controller.mdb.js
        const products = await controller.getProducts(limit, page, sort, description)

        // Aca Mandamos la respuesta al cliente con el listado de productos encontrados 
        res.status(200).send({ status: 'Admin Auth/ Viendo Lista-Productos', data: products })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar:
    // http://localhost:5000/api/products

    // Consultado hecha para Paginar desde - POSTMAN
    // http://localhost:5000/api/products/?page=1&limit=5&sort=desc&description=fruta

})

// 3) Endpoint para leer/Consultar Un(1) Producto de la DB  por su ID - Con POSTMAN
router.get('/:pid', passportCall('jwtAuth', { session: false }), authorizationMid(['admin', 'premium']), async (req, res) => {

    try {

        // Desestructuramos lo que nos llega req.params
        const { pid } = req.params

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) y no el Objeto completo 
        console.log(pid)

        // Paso 3: Usando el Metodo .getProductById() disponible en archivo product.controller.mdb.js
        const product = await controller.getProductById(pid)

        // Aca Mandamos la respuesta al cliente con el producto encontrado 
        res.status(200).send({ status: 'Ok. Mostrando Producto Selecionado ', data: product })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/api/products/65b407b51ffaba8bd5d82e71

})

// 4) Endpoint para Agregar un Producto y cargar Imagenes con Multer en la DB - Con POSTMAN  
router.post('/', passportCall('jwtAuth', { session: false }), authorizationMid(['admin', 'premium']), async (req, res) => {

    try {

        // el req.file lo inyecta el uploader(multer) y al verificarlo si esta vacio NO sube la img y reporta el problema
        //if (!req.file) return res.status(400).send({ status: 'FIL', data: 'No se pudo subir el archivo' })

        // Desestructuramos el req.body (el JSON con los Datos a Actualizar)
        const { title, category, price, thumbnail, code, stock } = req.body

        // Verificamos y Validamos los valores recibidos
        if (!title || !category || !price || !thumbnail || !code || !stock) {
            return res.status(400).send({ status: 'ERR', data: errorsDictionary.FEW_PARAMETERS.message })
        }

        //console.log('LLEGO endpoint que crea productos ', req.user)

        // IMPORTANTE: Aca tenemos un else{} intrinsico por la lectura en cascada 
        // Creamos un Nuevo Objeto con los Datos Desestructurados 
        const newContent = {

            title, //Se puede poner asi el Objeto y JS enviente que la propiedad Y el valor tienen el MISMO NOMBRE
            category,
            price,
            // el obj req.file está disponible porque estamos utilizando Multer como middleware,
            // mediante el objeto uploader que estamos importando e inyectando.
            thumbnail,
            code,
            stock,
            // Si el role es premiun en el owner guardo el email sino es Admin por default
            owner: req.user.payload.role === 'premium' ? req.user.payload.username : 'admin'

        }

        //console.log(newContent)

        // Paso 3: Usando el Metodo .addProduct() disponible en archivo product.controller.mdb.js
        const result = await controller.addProduct(newContent)

        // Aca Mandamos la respuesta al cliente
        res.status(200).send({ status: 'OK. Producto Creado', data: result })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

})

// 5) Endpoint para Actualizar un Producto en la DB - Con POSTMAN
router.put('/:pid', passportCall('jwtAuth', { session: false }), authorizationMid(['admin']),
    
    uploader.single('thumbnail'), async (req, res) => {

        try {

            // Desestructuramos lo que nos llega req.params
            const { pid } = req.params

            // Asginamos el email y el role
            const email = req.user.payload.username;
            const role = req.user.payload.role;
            let proceedWithUpdate = true;

            //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) 
            console.log('pid', pid)
            console.log('email', req.user.payload.username)

            // Chequeando el role del usuario
            if (role === 'premium') proceedWithUpdate = await checkOwnership(pid, email);

            // Procedo a Actiualizar el producto 
            if (proceedWithUpdate) {

                // el req.file lo inyecta el uploader(multer) y al verificarlo si esta vacio NO sube la img y reporta el problema
                // if (!req.file) return res.status(400).send({ status: 'FIL', data: 'No se pudo subir el archivo' })

                // Desestructuramos el req.body 
                const { title, description, price, code, stock } = req.body

                // Verificamos y Validamos los valores recibidos
                // if (!title || !description || !price || !code || !stock) {
                //     return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' })
                // }

                const product = controller.getProductById(pid)

                // IMPORTANTE: Aca tenemos un else{} intrinsico por la lectura en cascada 
                console.log(req.file)

                // Creamos un Nuevo Objeto con los Datos Desestructurados
                const newContent = {
                    title: title ?? product.title,
                    description: description ?? product.description,
                    code: code ?? product.code,
                    price: price ?? product.price,
                    stock: stock ?? product.stock,
                    thumbnail: req?.file?.filename ? `/static/img/${req.file.filename}` : product.thumbnail
                }

                // Paso 3: Usando el Metodo .updateProduct() disponible en archivo product.controller.mdb.js
                const result = await controller.updateProduct(pid, newContent)

                // Aca Mandamos la respuesta al cliente
                res.status(200).send({ status: 'OK. Product Updated', data: result })

            } else {

                res.status(403).send({ status: `Usuario ${email}`, data: 'No tiene permisos para Actualizar el producto' });

            }
  

        } catch (err) {

            res.status(500).send({ status: 'ERR', data: err.message })

        }

    })

// 6) Borrando un Producto de la DB - Con POSTMAN
router.delete("/:pid", passportCall('jwtAuth', { session: false }), authorizationMid(['admin', 'premium']),
    uploader.single('thumbnail'), async (req, res) => {

        try {

            // Desestructuramos el req.params 
            const { pid } = req.params
            
            // Asginamos el email y el role
            const email = req.user.payload.username;
            const role = req.user.payload.role;
            let proceedWithDelete = true;
            
            //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) 
            console.log('pid', pid)
            console.log('email', req.user.payload.username)

            // Chequeando el role del usuario
            if (role === 'premium') proceedWithDelete = await checkOwnership(pid, email);

            if (proceedWithDelete) {

                const result = await controller.deleteProductById(pid)
                res.status(200).send({ status: 'OK. Product Deleted', data: result })

            } else {

                res.status(403).send({ status:`Usuario ${email}`, data: 'No tiene permisos para borrar el producto' });

            }

        } catch (err) {

            res.status(500).send({ status: 'ERR', data: err.message })

        }

    })


export default router