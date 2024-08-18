

// PASO 1: Importar librerias y modulos
import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2' 
import Product from '../models/Product.model.js'

// Usar el .pluralize SIEMPRE para no tener problemas con algunas configuraciones predeterminadas de Mongoose
mongoose.pluralize(null)


// PASO 2: diseñando el esquema que va a tener la coleccion 

// 2.1) Asignando el nombre de coleccion
const collection = 'Cart' 

// 2.2) Creando el esquema 
const schema = new mongoose.Schema({

    products: {
        type: [
            {
                producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                cantidad: { type: Number }
            }
        ]
    },

    /**  
     * products =  Es el objeto Principal 
     * type = Es el array que va contener objetos con la siguiete info:los Ids de mongoose
     * 1) producto = { type: [mongoose.Schema.Types.ObjectId], ref: 'products' }, ref a la colección 'Product' en la BD
     * 2) Cantidad = { type: Number, }, cantidad de producto agregados al carrito 
    */

})

// 2.3) USANDO Populate dentro del MODEL 
// Nota: El Populate solo lo estamos usando en Metodo getcarts() - para consultar todo los carritos
schema.pre('find', function () {

    this.populate({ path: 'products.producto', model: Product });

})

// 2.4) Importamos mongoose-paginate-v2 y lo activamos como plugin en el schema, 
//para tener disponible el método paginate() en las consultas
schema.plugin(mongoosePaginate)


// 2.5) CREAMOS NUESTRP PROPIO METODO ".format()" PARA POBLAR(populate) el Modelo Cart 
// Nota: el metodo .format() Nos permiter tener siempre el conrtol sobre la instancia del Modelo Cart 
schema.methods.format = async function () {
    
    let total = 0

    const products = []

    for (let i = 0; i < this.products.length; i++) {
        
        const product = await Product.findById(this.products[i].producto)

        //console.log(product)

        //console.log('this ',this.products[i].cantidad)
        total += product.price * this.products[i].cantidad

        //total += product.price 
        
        products.push({
            product: {
                id: product.id,
                title: product.title,
                price: product.price,
                code: product.code,
                stock: product.stock,
                description: product.description,
                thumbnail: product.thumbnail,
            },
            cantidad: this.products[i].cantidad,
        })
        //console.log('rollo', total)
    }

   

    return {
        id: this.id,
        products,
        total,
    }
}

// 2.6) Aca Creamos el Modelo a Exportar
const cartsModel = mongoose.model(collection, schema)
// - El modelo tiene 2 parametros: 
// - En el Parametro Nro1: le paso la Constante "collection" 
// - En el Parametro Nro2: le paso la Constante "schema"


// 2.7) Habilitamos para Exportar el usersModel(modelo de Mongoose)
export default cartsModel

// Otra Forma de exportar el Modelo
//export default mongoose.model(collection, schema)


