
// 1) Importando el cartServices nos traemos tambien todo los metodos de la libreria mongoose
import cartServices from '../services/cart.service.js'
import { ProductsController } from './product.controller.mdb.js'

// 2) Creando una nueva instancia del prdController
const prdController = new ProductsController()

// 3) Creando la Clase CartController
export class CartController {
    
    constructor() {
        // Creo el constructor y lo dejo vacio
    }
    
    //  3.1) Metodo para Agregar un carrito a la BD
    async addCart(newCart) {
        
        //console.log(`es addCart --->: `, newCart)
        
        try {
            
            return await cartServices.createCart(newCart)
            
        } catch (err) {
            
            return err.message
            
        }
    }
    
    
    // 3.2) Metodo para obtener todos los Carritos creados en la BD
    async getCarts() {
        try {
            
            // uso el metodo .find() que me proporciona mongoose 
            return await cartServices.getCart()
        
            
        } catch (err) {
            
            return err.message
            
        }
        
    }
    
    
    // 3.3) Metodo para obtener un(1) Carrito de la BD por su ID
    async getCartById(id, format = true) {
        
        try {
            // uso el metodo .findById(id) que me proporciona mongoose 
            const cart = await cartServices.getCartById(id)

            //console.log(cart)
            if (cart === null) return undefined
            if (!format) return cart
            //console.log(await cart.format())
            return await cart.format()

        } catch (err) {

            return err.message
        }
    }

    // 3.4) Metodo para actualizar un Carrito por su ID en la BD
    async updateCart(id, newContent) {
        // Recibe 2 parametros: 
        // El 1er "id" del carrito a actualizar
        // El 2do "newContent" el objeto con la informacion a actualizar

        try {

            // uso el metodo .findByIdAndUpdate() que me proporciona mongoose
            const cart = await cartServices.updateCart(id, newContent)
            return cart

        } catch (err) {

            return err.message
        }
    }

    // 3.5) Metodo para Dejar el Carrito Vacio de Productos
    async emptyCart(id, newContent) {
        try {

            // uso el metodo .findByIdAndDelete() que me proporciona mongoose
            const cart = await cartServices.updateCart(id, newContent)
            return cart

        } catch (err) {

            return err.message

        }
    }

    // 3.6) Metodo para 
    async getCartByIdnotFormat(id, newContent) {

        try {

            // uso el metodo .findById(id) que me proporciona mongoose 
            const cart = await cartServices.updateCart(id, newContent)

            //console.log(cart)

            // Aca hacemos una validacion ternaria a modo de control dentro del return
            return cart === null
                ? 'No se encuentra el Carrito'
                // Usamos el metodo format() creado por nosotros para poder poblar el carrito de forma correcta 
                : cart

        } catch (err) {

            return err.message
        }
    }

    // 3.7) Metodo para Agregar productos al carrito 
    async addProductToCart(id, { pid, cantidad }) {

        //console.log(cantidad, pid)
        try {

            const cart = await cartServices.getCartById(id);

            const products = cart.products.filter(item => item.producto.toString() !== pid);

            const updated = [
                ...products,
                {
                    producto: pid,
                    cantidad,
                }
            ]

            //console.log(updated)

            // Pisando el Carrito Viejo por uno nuevo con los productos que no fueron eliminados 
            const result = await cartServices.updateCart(id, { products: updated });

            return result;

        } catch (err) {

            console.error(err);

            return err.message;
        }
    }

    // 3.8) Metodo para remover productos del carrito 
    async removeProductFromCart(id, pid) {
        try {

            const cart = await cartServices.getCartById(id);
            //console.log('ID', id, cart)
            const products = cart.products.filter(item => item.producto.toString() !== pid);
            //console.log('PID', pid, cart.products)

            // Pisando el Carrito Viejo por uno nuevo con los productos que no fueron eliminados 
            const result = await cartServices.updateCart(id, { products });
            return result;
        } catch (err) {
            //console.error(err);
            return err.message;
        }
    }

    // 3.9) Metodo para revisar los productos dentro del carrito 
    async checkCartStock(id) {
        try {

            //console.log('entro a checkCartStock', id)
            const cart = await cartServices.getCartById(id);
            const valid = []
            const invalid = []

            //console.log(cart)

            for (let i = 0; i < cart.products.length; i++) {
                const product = cart.products[i]
                const pid = product.producto
                const hasStock = await prdController.checkProductStock(pid, product.cantidad)
                //console.log(pid, hasStock)
                if (hasStock) {
                    valid.push(pid)
                } else {
                    invalid.push(pid)
                }
            }

            return [valid, invalid]
        } catch (err) {
            //console.error(err)
            return null
        }
    }

    // 3.10) Metodo para confirmar la compra
    async confirmPurchase(id) {
        try {

            const cart = await cartServices.getCartById(id);

            for (let i = 0; i < cart.products.length; i++) {
                const pid = cart.products[i].producto
                const cantidad = cart.products[i].cantidad
                await prdController.updateProductStock(pid, cantidad)
            }

            const result = await cartServices.updateCart(id, { products: [] })
            return result
            
        } catch (err) {
            //console.error(err)
            return null
        }
    }



}


