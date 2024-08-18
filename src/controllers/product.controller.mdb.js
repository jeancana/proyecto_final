
// 1) Importando el productServices nos traemos tambien todo los metodos de la libreria mongoose
import productServices from '../services/product.service.js'
import { faker } from '@faker-js/faker'; 

// 2) Creando la Clase ProductsController
export class ProductsController {
    
    constructor() {
        // Creo el constructor y lo dejo vacio
    }

    // 2.1) Metodo para Agregar un Producto a la BD
    async addProduct(product) {
        
        try {
            
            // Usando los productServices
            await productServices.createProduct(product)
            
            return "Producto agregado"

        } catch (err) {
            
            return err.message

        }
    }

    // 2.2) Metodo para obtener el lista de productos paginados 
    async getProducts(limit, page, sort, description) {
        
        // 1er Parametro para que le Asigno al paginado 
        const criteria = {}
        if (description) {
            criteria.description = description
        }

        // 2do Parametro Filtros que van a condicionar mi paginacion 
        const pagination = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: { price: ['asc', 'desc'].includes(sort) ? sort : 'asc' },
            lean: true,
            select: ['_id', 'title', 'price', 'stock', 'description', 'thumbnail', 'code']
        }

        try {

            // Usando los productServices
            const products = await productServices.getProducts(criteria, pagination)
            return products

        } catch (err) {

            return err.message
        }

    }

    // 2.3) Metodo para Obtener un(1) producto de la BD por su ID 
    async getProductById(id) {
        
        try {

            // uso el metodo .findById(id) que me proporciona mongoose
            const product = await productServices.getProductById(id)
            
            // Aca hacemos una validacion ternaria a modo de control dentro del return
            return product === null ? 'No se encuentra el producto' : product

        } catch (err) {
            return err.message
        }
    }

    // 2.4) Metodo parq actualizar un Producto por su ID en la BD
    async updateProduct(id, newContent) {
        // tiene 2 parametros
        // El 1er la paso ID del producto a actualizar
        // El 2do le paso el objeto con la informacion a actualizar

        try {

            // uso el metodo .findByIdAndUpdate() que me proporciona mongoose
            const procedure = await productServices.updateProduct(id, newContent)
            return procedure

        } catch (err) {

            return err.message
        }
    }

    // 2.5) Metodo para Borrar un producto de la BD
    async deleteProductById(id) {
        try {

            // uso el metodo .findByIdAndDelete() que me proporciona mongoose
            const procedure = await productServices.deleteProduct(id)
            return procedure

        } catch (err) {

            return err.message

        }
    }

    // 2.6) Metodo para revisar si tengo stock de un producto en la BD
    async checkProductStock(id, count) {
        try {
            const product = await productServices.getProductById(id)
            //console.log(id, product.title, product.stock, count)
            return product.stock >= count
        } catch (err) {
            //console.error(err)
            return false;
        }
    }

    // 2.7) Metodo para actualizar el stock de un producto en la BD
    async updateProductStock(id, cantidad) {
        try {
            const product = await productServices.getProductById(id)
            if (cantidad > product.stock) {
                throw Error("No hay suficiente stock")
            }
            const result = await productServices.updateProduct(id, { ...product, stock: product.stock - cantidad })
            return result
        } catch (err) {
            console.error(err)
            return null
        }
    }

    // 2.8) Metodo para Crear un lista de producto Fakers
    async generateMockProduct(qty) {


        // Array vacio para ir guardando Productos Fakers
        const mockProducts = [];


        // Ciclador para crear la cantidad de userfakers que me viene por el parametro "qty"
        for (let i = 0; i < qty; i++) {

            // Aca voy Generando el usuario FALSO/MOCK nuevo 
            const mockProduct = {

                _id: faker.database.mongodbObjectId(),
                title: faker.commerce.productName(),
                category: faker.commerce.department(),
                price: faker.commerce.price(),
                thumbnail: faker.image.url(),
                code: faker.number.int({ min: 0, max: 5000 }),
                stock: faker.number.int({ min: 0, max: 100 }),

            }

            //mockUser.gender = mockUser.gender.charAt(0).toUpperCase() + mockUser.gender.slice(1);

            // Pusheando el Usuario Falso/Mock al array mockUsers
            // Por ahora todo queda en memoria volatil no estoy generando Persistencia en la DB
            mockProducts.push(mockProduct);

        }

        // Aca solo los est
        return [mockProducts];
    }
  
}