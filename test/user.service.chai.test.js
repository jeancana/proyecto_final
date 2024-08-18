import { expect } from 'chai'; // modulo de aseveraciones mas intuitivo que el nativo de nodejs
import mongoose from 'mongoose'; // Importamos mongoose para poder interactuar con BBDD
import userServices from '../src/services/user.service.js' // importamos el Objeto con todas las funciones 
import config from '../src/config/config.js' // Importamos el objeto config donde esta todas las variables de entorno


// GENERANDO LAS INSTANCIAS NECESARIAS PARA QUE FUNCIONES EL TEST
const connection = await mongoose.connect(config.MONGOOSE_URL_REMOTE); //Conectando a BBDD LOCAL

// Usuario de Prueba 
const testUser = {
    first_name : "Kyle",
    last_name : "Rodriguez",
    email : "Crystel_Blick13@hotmail.com",
    age : 67,
    gender : "female",
    password : "$2b$10$WR2.u5Nwnbker.Yd6YU1/OS5NXQ55P/T3iO24Nd7xD6xqboxUpiAW",
    cart : "74d3effdefbee907c79bdb3b",
    role : "user"
};

// ESTRUCTURA BASE DE TEST UNITARIO PARA TRABAJAR CON MODULO NATIVO Assert
// Vamos a realizar un test Unitario para el CRUD de User con el modulo Nativo Assert
// Aca si Inicializa el paquete de pruebas 
describe('Test user.service', function () {
    // Antes de Iniciar Cada Prueba Poner un pequena pausa de 3000 mls
    // this.timeout = 5000;

    // Metodo Auxuliar - Se ejecuta ANTES de comenzar el paquete de tests - Al principio 
    before(function () {
        
        // Vaciando la colección users - limpiando la BBDD
        // Cada vez que se corre el Test se corre limpio y no quedan datos innecesarios en la BBDD
        mongoose.connection.collections.users_test.drop();

    });
    
    // Metodo Auxuliar - Se ejecuta ANTES de CADA test
    beforeEach(function () {

     });
    
    // Metodo Auxuliar - Se ejecuta FINALIZADO el paquete de tests
    after(function () { });
    
    // Metodo Auxuliar - Se ejecuta FINALIZADO CADA test
    afterEach(function () { });


    // IMPORTANTE Lista test Unitarios que deseo realizar al user.service
    // Test-Unitario Nro.1
    it('createUser() debe retornar el usuario creado en la BBDD ', async function () { 
        
        // Pasando el Usuario de Prueba
        const result = await userServices.createUser(testUser)

        // Prueba Nro.1 : Verificando el usuario creado sea un objeto
        expect(result).to.be.an('object');

        // Prueba Nro.2 : Verificando que el objeto result contenga la propiedad _id      
        expect(result._id).to.be.not.null;

        // Prueba Nro.3 : Verificando Internamente que la Propiedad role sea por default "user"
        // Verifica la segunda capa del objeto - la Copia Profunda
        expect(result.role).to.be.deep.equal('user');
        

    });
    

    // Test-Unitario Nro.2
    it('getAllUsers() debe retornar un Array con Todos los usuarios Existentes en la BBDD ', async function () { 
        const result = await userServices.getAllUsers()

        // Prueba Nro.1 : Verificando que result sea un array
        expect(result).to.be.an('array');
        
        // Si pasa la prueba muestra el resultado 
        // console.log(result)
        
    }); 


    // Test-Unitario Nro.3
    it('findUserByEmail() debe retornar el usuario por su Email ', async function () {

        // Pasando el mail del Usuario de Prueba

        //console.log(testUser.email)
        const result = await userServices.findUserByEmail({ email: testUser.email })
        // Aprovechamos a guardar en testUser el _id que acabamos de recuperar,
        // para usarlo en siguientes tests.
        //console.log(result._id)
        testUser._id = result._id;
        
        // Prueba Nro.1 : Verificando Internamente que emial buscado sea igual al email del testUser
        expect(result.email).to.be.equal(testUser.email);
        
        // Prueba Nro.2 : Verificando que resultado de la busqueda sea objeto  
        expect(result).to.be.an('object');

        // Prueba Nro.3 : Verificando que la propiedad _id no sea nula
        expect(result._id).to.be.not.null;
        

    }); 


});

/**
 * Comando para Ejecutar el test 
 * npm run test 
 * */  