import Assert from 'assert'; // No se necesita instalar, es un modulo nativo de nodejs
import mongoose from 'mongoose'; // Importamos mongoose para poder interactuar con BBDD
import userServices from '../src/services/user.service.js' // importamos el Objeto con todas las funciones 
import config from '../src/config.js' // Importamos el objeto config donde esta todas las variables de entorno

// GENERANDO LAS INSTANCIAS NECESARIAS PARA QUE FUNCIONES EL TEST
const connection = await mongoose.connect(config.MONGOOSE_URL_LOCAL); //Conectando a BBDD LOCAL
const assert = Assert.strict;

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

    // Metodo Auxuliar - Se ejecuta ANTES de comenzar el paquete de tests - Al principio 
    before(function () {
        
        // Vaciando la colección users - limpiando la BBDD
        // Cada vez que se corre el Test se corre limpio y no quedan datos innecesarios en la BBDD
        mongoose.connection.collections.users.drop();

    });
    
    // Metodo Auxuliar - Se ejecuta ANTES de CADA test
    beforeEach(function () {

        // Antes de Iniciar Cada Prueba Poner un pequena pausa de 3000 mls
        this.timeout = 5000;

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
        assert.strictEqual(typeof (result), 'object')
        
        // Prueba Nro.2 : Verificando que el objeto result contenga la propiedad _id
        assert.ok(result._id)

        // Prueba Nro.3 : Verificando Internamente que la Propiedad role sea por default "user" 
        // Verifica la segunda capa del objeto - la Copia Profunda 
        assert.deepStrictEqual(result.role, 'user');

        //console.log(typeof userServices )


    });
    

    // Test-Unitario Nro.2
    it('getAllUsers() debe retornar un Array con Todos los usuarios Existentes en la BBDD ', async function () { 
        const result = await userServices.getAllUsers()

        // Prueba Nro.1 : Verificando que result sea un array
        assert.strictEqual(Array.isArray(result), true)
        
        // Si pasa la prueba muestra el resultado 
        // console.log(result)

        // Haciendo que la prueba Falle
        //assert.strictEqual(result, Boolean)
        
    }); 


    // Test-Unitario Nro.3
    it('findUserByEmail() debe retornar el usuario por su Email ', async function () {

        // Pasando el mail del Usuario de Prueba

        //console.log(testUser.email)
        const result = await userServices.findUserByEmail({ email: testUser.email })

        // Prueba Nro.1 : Verificando Internamente que emial buscado sea igual al email del testUser
        // Nota: Utilizando deepStrictEqual que analiza la copia profunda 
        assert.deepStrictEqual(result.email, testUser.email);



    }); 


});

/**
 * Comando para Ejecutar el test 
 * npx mocha test/user.service.test.js
 * 
 * */  