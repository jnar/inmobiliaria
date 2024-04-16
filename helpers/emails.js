import nodemailer from 'nodemailer'

const emailRegister = async (data) => {
    const transport = nodemailer.createTransport({
        host: "nodejs.tecnopymes.net",
        port: 465,
        secureConnection: true,
        debug: true,
        auth: {
            user: "inmobiliaria@nodejs.tecnopymes.net",
            pass: "z?i]L7$BN^GT"
        }
    });

    const {email, name, token} = data

    // Enviar el email
    await transport.sendMail({
        from: 'Bienes Raices',
        to: email,
        subject: 'Confirma tu cuenta en Bienes Raices',
        text:'Confirma tu cuenta en Bienes Raices',
        html: `
            <p>Hola, ${name}, comprueba tu cuenta en Bienes Raices</p>

            <p>Solo debes confirmar dando click en el siguiente enlace: <a href='${process.env.URL_BACKEND}:${process.env.PORT}/auth/confirmar/${token}'>Confirmar cuenta</a></p>

            <p>Si tu no creaste esta cuenta, has caso omiso al mensaje.</p>
        `
    })
}


const emailForgotPassword = async (data) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const {email, name, token} = data

    // Enviar el email
    await transport.sendMail({
        from: 'Bienes Raices',
        to: email,
        subject: 'Restablece tu contraseña en Bienes Raices',
        text:'Restablece tu contraseña en Bienes Raices',
        html: `
            <p>Hola, ${name}, has solicitado reestablecer tu contraseña en Bienes Raices</p>

            <p>Sigue el siguiente enlace para generar una nueva contraseña <a href='${process.env.URL_BACKEND}:${process.env.PORT}/auth/olvide-clave/${token}'>Recuperar contraseña</a></p>

            <p>Si tu no solicitaste la recuperación de contraseña, has caso omiso al mensaje.</p>
        `
    })
}

export {
    emailRegister,
    emailForgotPassword
}