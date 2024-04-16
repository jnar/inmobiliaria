import path from 'path'

export default {
    mode: 'development',
    entry:{
        mapa : './src/js/mapa.js',
        addImagen: './src/js/addImagen.js',
        verMapa: './src/js/verMapa.js',
        mapaHome: './src/js/mapaHome.js',
    },
    output:{
        filename : '[name].js',
        path: path.resolve('public/js')
    }
}