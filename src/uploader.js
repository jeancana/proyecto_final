// ******* PEQUENO CARGADOR DE ARCHIVOS ******** 

import multer from 'multer'
import { __dirname } from './utils.js'

// Multer: Modulo que  seInyecta como Middleware que se encarga de subida de documentos, Imagenes y Videos 
// Esta pieza de Codigo sale de documentacion del Modulo de Multer / es una configuracion Esencial 
const storage = multer.diskStorage({

    // Destino del video/Img o Archivo que se suba
    destination: (req, file, cb) => {
        
        // Direccion estatica: todo se guardar en la carpeta /public/img
        cb(null, `${__dirname}public/img`)
    },

    // Asignamos como Nombre al archivo SUBIDO el nombre Original con el viene
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})


export const uploader = multer({ storage })





