
// 1) Importando el userServices nos traemos tambien todo los metodos de la libreria mongoose
import userServices from '../services/user.service.js'
import { faker } from '@faker-js/faker'; 

// 2) Lo importo aca para poder usarlo con los usuarioFakers 
import { createHash } from '../utils.js'; 

// 3) Creando la Clase UsersController
export class UsersController {
    
    constructor() {
        // Creo el constructor y lo dejo vacio
    }

    // 3.1) Metodo para Agregar un Usuario a la BD
    async addUser(data) {

        //console.log(data)
        
        try {

            const { first_name, last_name, email, password } = data
            
            const errors = {

                first_name: !first_name,
                last_name: !last_name,
                email: !email,
                password: !password,
                repeated: false,

            }
            //console.log(errors)

            // Verificanco si el correo ya existe en la base de datos 
            const repeated = await userServices.findUserByEmail({ email })
            //console.log("REPETIDO",repeated)
            
            if (repeated) errors.repeated = true;
            //if (!first_name) errors.first_name = true;
            //if(!last_name) errors.last_name = true;


            // Aca chequeo que no haya nada verdadero, si hay errores no creo el usuario
            // IMPORTANTE: estudiar bien esta pieza de codigo y que esta haciendo
            // Explicando: !Object con esto valido que lo que estoy obteniendo es distinto de aun objeto
            // Explicando: el metodo .entries(errors) --> convierte el Obj. errors en un Array de Arrays de [key, value]
            // Explicando: el metodo .every evaluo si lo valores que entra por el parametro value son estrictamente iguales a false
            if (!Object.entries(errors).every(([key, value]) => {
                
                return value === false

            })) {

                // Retorna un array de 2 elementos 
                // Elememto 1: los contenido en la variable errors
                // Elemento 2: null 
                return [errors, null]
            }
            
            // SI pasan todas las validaciones crea el usuario en la en BD
            const user = await userServices.createUser(data)
            
            
            // Retorna un array de 2 elementos
            // Elemento 1: null 
            // Elememto 2: los contenido en la variable user
            return [null, user]

        } catch (err) {
            
            return [err.message, null]

        }
    }

    // 3.2) Metodo para obtener todos los Usuarios de la BD
    async getUsers(data) {
        
        try {

            //console.log(data)

            // agregar el .explain('executionStats') me devuelve una estadistica de la consulta hecha con informacion util ... velocidad de la consulta etc etc... OJO a mayor Cantidad de Datos mas lenta la consulta
            //const users = await usersModel.find().explain('executionStats')
            
            // haciendo una busqueda ESPECIFICA dentro del .find() // Se incrementa el tiempo de respuesta (lentitud)
            //const users = await usersModel.find({ first_name: 'celia' }).explain('executionStats')

            // Detalle util agregar el .lean() limpiar el objeto que me devuelve mongoose y queda optimo el formato para JavaScript
            const users = await userServices.getAllUsers()

            return users

        } catch (err) {

            return err.message
        }

    }

    // 3.3) Metodo para obtener un(1) Usuario de la BD por su ID
    async getUserById(id) {
        
        try {

            // uso el metodo .findById(id) que me proporciona mongoose
            const users = await userServices.getUserById(id)
            
            // Aca hacemos una validacion ternaria a modo de control dentro del return
            return users === null ? null : users

        } catch (err) {

            return err.message
        }
    }

    // 3.4) Metodo para obtener un(1) Usuario de la BD por su Email
    async getByEmail(email) {

        //console.log('getByEmail ',email)
        try {

            // uso el metodo .findById(id) que me proporciona mongoose
            const user = await userServices.findUserByEmail({ email })

            //console.log('user', user)
            // Aca hacemos una validacion ternaria a modo de control dentro del return
            return user === null ? null : user

        } catch (err) {

            return err.message
        }
    }

    // 3.5) Metodo para actualizar un Usuario por su ID en la BD
    async updateUser(id, newContent) {

        // tiene 2 parametros:
        // El 1er la paso ID del Usuario a actualizar
        // El 2do le paso el objeto con la informacion a actualizar

        try {

            // uso el metodo .findByIdAndUpdate() que me proporciona mongoose
            const user = await userServices.updateUser(id, newContent)
            
            return user

        } catch (err) {

            return err.message
        }
    }

    // 3.6) Metodo para Borrar un Usuario de la BD
    async deleteUserById(id) {
        
        try {

            // uso el metodo .findByIdAndDelete() que me proporciona mongoose
            const user = await userServices.deleteUserById(id)
            return user

        } catch (err) {

            return err.message

        }
    }
  
    // 3.7) Metodo para traer la lista de usarios PAGINADOS 
    async getUsersPaginated() {
        try {

            // Podemos usar el método paginate gracias a que hemos agregado el módulo mongoose-paginate-v2.
            // También podríamos hacerlo manualmente, pero este módulo es muy cómodo y nos devuelve todos
            // El .paginate() siempre trabajo con 2 objetos
            return await usersModel.paginate(
                
                // aca estoy filtrando por genero y estoy interesado paginar solo el Femenimo 
                // Recuperame todos las mujeres de la coleccion Users
                { gender: 'Female' }, // obj.1 Paquete de criterios por los que quiero filtar 

                // Arrancan desde el documento (0) de la coleccion hasta el 50
                // Recuperame todos las mujeres de la coleccion Users arrancado desde el 1er documento de la coleccion hasta el 50
                // offset(desplazamiento): es la posicion de donde arranco
                // limit: es la posicion hasta la que llego
                { offset: 0, limit: 50, lean: true } // obj.2 de criterios con los que pagina el filtrado
            )
        } catch (err) {

            return err.message
        }
    }

    // 3.7) Metodo para traer la lista de usarios PAGINADOS -  mejorado y parametrizado 
    async getUsersPaginated2(page, limit) {
        
        // Asi es como funcion normalmente con PARAMETRO DINAMICOS
        //Datos de viene por req.params
        try {
            
            // los datos necesarios en la respuesta para armar el paginado en el frontend.
            // Por supuesto, los valores de offset y limit, pueden llegar como parámetros.
            return await usersModel.paginate(
                { gender: 'Female' },
                { offset: (page * 50) - 50, limit: limit, lean: true },
                //{ $sort: { firts_name: -1 } }, // No esta Habilitado ahora   

               
            )
        } catch (err) {
            return err.message
        }
    }

    // 3.8) Metodo para Restaurar el password de una usuario con el modulo bcrytp
    async updateUserPass(email, password) {

        //console.log('controllerPass:' , password)
        //console.log('controlerEmail:', email)

        try {

            const upDate = {
                process: false,
            }

            // uso el metodo .findByIdAndUpdate() que me proporciona mongoose
            const userPassUpdated = await userServices.restorePassByEmail (email, password)

            //console.log('userPassUpdated', userPassUpdated)
            
            if (userPassUpdated !== null) upDate.process = true;

            return upDate

        } catch (err) {

            return err.message
        }
    }


    // 3.9) Método para Generaer lista de usuarios fakers - persintencia del memoria volatil
    async generateMockUsers(qty) {

        // Array vacio para ir guardando usuarios Fakers
        const mockUsers = [];

        // Array vacio para ir guardando carrito del Usuario Fakers 
        const mockCarts = [];

        // Array para Asignar role al azar a un usuario Faker
        const possibleRoles = ['user', 'premium'];

        // Ciclador para crear la cantidad de carritosfakers que me viene por el parametro "qty"
        for (let i = 0; i < qty; i++) {

            const cart = {
                _id: faker.database.mongodbObjectId(),
                products: [],
                cantidad: 0
            }

            // Pusheando el carrito Falso/Mock al array mockUsers
            // Por ahora todo queda en memoria volatil no estoy generando Persistencia en la DB
            mockCarts.push(cart);
        }


        // Ciclador para crear la cantidad de userfakers que me viene por el parametro "qty"
        for (let i = 0; i < qty; i++) {

            // Aca voy Generando el usuario FALSO/MOCK nuevo 
            const mockUser = {

                _id: faker.database.mongodbObjectId(),
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                age: faker.number.int(70) + 1,
                gender: faker.person.sex(),
                password: createHash(faker.internet.password({ length: 8 })),
                cart: mockCarts[i]._id,
                role: faker.helpers.arrayElement(Object.values(possibleRoles))//toma al azar un role del array possibleRoles 
            }

            //mockUser.gender = mockUser.gender.charAt(0).toUpperCase() + mockUser.gender.slice(1);

            // Pusheando el Usuario Falso/Mock al array mockUsers
            // Por ahora todo queda en memoria volatil no estoy generando Persistencia en la DB
            mockUsers.push(mockUser);

        }

        // Aca solo los est
        return [mockUsers , mockCarts];
    }

    // 3.10) 
    async updateUserProperti(filter, update, options) {

        try {

            //console.log('filter',filter)
            //console.log('update',update)
            //console.log('options',options)

            // uso el metodo .findByIdAndUpdate() que me proporciona mongoose
            const user = await userServices.updateUserProperti(filter, update, options)

            return user

        } catch (err) {

            return err.message
        }
    }

    // 3.11)
    async deleteInactiveUsers() {

        try {

            const user = await userServices.deleteInactiveUsers()

            return user

        } catch (err) {

            return err.message
        }
    }

    // 3.11)
    async findInactiveUsers() {

        try {

            const user = await userServices.findInactiveUsers()

            return user

        } catch (err) {

            return err.message
        }
    }

}


