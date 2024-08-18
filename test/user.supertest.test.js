import { expect } from 'chai'; // modulo de aseveraciones mas intuitivo que el nativo de nodejs
import supertest from 'supertest'; // Importamos el modulo de supertest - para test de integracion


//const expect = chai.expect; // No es necesario lo uso directamente

// El TEST DE INTEGRACION se va correr desde los endpoinst CON EL MODULO supertest
// El requester nos va a permitir accesar a los endpoints y realizar las solicitudes HTTP GET/POST/PUT/DELETE
const requester = supertest('http://localhost:5000'); 

// Usuario de Prueba 
const testUser = {

    first_name: "Kyle",
    last_name: "Rodriguez",
    email: "rantaro500@gmail.com",
    password: "superTest",
    
};

// ESTRUCTURA BASE DE TEST UNITARIO PARA TRABAJAR CON MODULO NATIVO Assert
// Vamos a realizar un test Unitario para el CRUD de User con el modulo Nativo Assert
// Aca si Inicializa el paquete de pruebas 
describe('superTest user.service', function () {
    // Antes de Iniciar Cada Prueba Poner un pequena pausa de 3000 mls
    //this.timeout = 5000;


    // Metodo Auxuliar - Se ejecuta ANTES de comenzar el paquete de tests - Al principio 
    before(function () {});
    // Metodo Auxuliar - Se ejecuta ANTES de CADA test
    beforeEach(function () {});
    // Metodo Auxuliar - Se ejecuta FINALIZADO el paquete de tests
    after(function () { });
    // Metodo Auxuliar - Se ejecuta FINALIZADO CADA test
    afterEach(function () { });


    // Test_de_Integracion  
    it('POST /api/users/register debe registrar un nuevo usuario', async function () {

        // Desestructuramos el body que me llega del requester
        //console.log(requester)

        // Logica Operando sintaxisis del supertest: 
        //   1-  Desestructuramos            2 - Peticion HTTP             3 - .send() Envia los Datos al endpoint 
        const { _body } = await requester.post('/api/users/register').send(testUser);
        
       // console.log(statusCode)
       // console.log(_body.data)
       // console.log(ok)

        // Prueba Nro.1 : Verificando el objeto que me llega por el _body no este vacio 
        expect(_body.data).to.be.ok;
    });


    it('POST /api/sessions/login debe loguear correctamente al usuario', async function () {
        const result = await requester.post('/api/sessions/login').send(testUser);
        //const cookieData = result.headers['set-cookie'][0];
       // cookie = { name: cookieData.split('=')[0], value: cookieData.split('=')[1] };

        // console.log(result)
        expect(result.body).to.be.ok;
        //expect(cookieData.name).to.be.equals('coderCookie');
        //expect(cookie.value).to.be.ok;
    });

});

/**
 * Comando para Ejecutar el test 
 * npm run test 
 * */