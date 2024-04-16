import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generatorJWT, generatorId } from "../helpers/tokens.js";
import { formateDate, isSeller } from "../helpers/index.js";
import { emailRegister, emailForgotPassword } from "../helpers/emails.js";

const formLogin = (req, res) => {
  res.render("auth/login", {
    page: "Inicio de sesión",
    csrfToken: req.csrfToken(),
  });
};

const auth = async (req, res) => {
  //validar formulario
  await check("email")
    .isEmail()
    .withMessage("El correo electronico es obligatorio")
    .run(req);
  await check("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .run(req);
  let result = validationResult(req);
  if (!result.isEmpty()) {
    //errores
    return res.render("auth/login", {
      page: "Inicio de sesión",
      csrfToken: req.csrfToken(),
      errors: result.array(),
    });
  }
  const { email, password } = req.body;

  //validar si el usuario existe
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.render("auth/login", {
      page: "Inicio de sesión",
      csrfToken: req.csrfToken(),
      errors: [{ msg: "El Correo y/o contraseña es incorrecto" }],
    });
  }

  // comprobar si la cuenta ya esta confirmada
  if (!user.confirmed) {
    return res.render("auth/login", {
      page: "Inicio de sesión",
      csrfToken: req.csrfToken(),
      errors: [{ msg: "La cuenta no esta confirmada" }],
    });
  }

  // comprobar la contraseña
  if (!user.verifyPassword(password)) {
    return res.render("auth/login", {
      page: "Inicio de sesión",
      csrfToken: req.csrfToken(),
      errors: [{ msg: "El Correo y/o contraseña es incorrecto" }],
    });
  }

  //autenticar al usuario
  const token = generatorJWT({
    id: user.id,
    name: user.name,
    email: user.email,
  });

  // almacenar token
  console.log(token);
  return res
    .cookie("_token", token, {
      httpOnly: true,
      // secure: true
    })
    .redirect("/mis-propiedades");
};

const formRegister = (req, res) => {
  res.render("auth/register", {
    page: "Crear Cuenta",
    csrfToken: req.csrfToken(),
  });
};

const formForgotPassword = (req, res) => {
  res.render("auth/forgot-password", {
    page: "Recuperar acceso a Bienes Raices",
    csrfToken: req.csrfToken(),
  });
};

const register = async (req, res) => {
  //validar
  await check("name")
    .notEmpty()
    .withMessage("El Nombre es obligatorio")
    .run(req);
  await check("email")
    .isEmail()
    .withMessage("Esto no parece un correo electronico")
    .run(req);
  await check("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe ser de minimo 6 caracteres")
    .run(req);
  // await check('repeat_password').withMessage('Las contraseñas no son iguales').run(req)
  let result = validationResult(req);

  //extraer datos
  const { name, email, password } = req.body;

  //verificar que que no haya errores
  if (!result.isEmpty()) {
    //errores
    return res.render("auth/register", {
      page: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errors: result.array(),
      user: {
        name: name,
        email: email,
      },
    });
  }

  //verificar que el usuario no este duplicado
  const userExist = await User.findOne({ where: { email } });

  if (userExist) {
    return res.render("auth/register", {
      page: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errors: [{ msg: "El correo electronico ya existe" }],
      user: {
        name: name,
        email: email,
      },
    });
  }

  //almacenar el usuario
  const user = await User.create({
    name,
    email,
    password,
    token: generatorId(),
  });

  //Enviar email de confirmación
  emailRegister({
    name: user.name,
    email: user.email,
    token: user.token,
  });

  // Mensaje de confirmación
  res.render("templates/mensaje", {
    page: "Cuenta creada correctamente",
    mensaje: "Hemos enviado un correo de confirmación, presiona en el enlace",
  });
};

const comprobar = async (req, res, next) => {
  const { token } = req.params;
  console.log(token);
  //verificar si el token es valido
  const user = await User.findOne({ where: { token } });
  if (!user) {
    //si no encontro el token
    return res.render("auth/account-confirm", {
      page: "Error al confirmar la cuenta",
      mensaje: "Hubo un error al confirmar tu cuenta, intentalo nuevamente",
      error: true,
    });
  }

  //Confirmar la cuenta
  user.token = null;
  user.confirmed = true;
  await user.save();

  return res.render("auth/account-confirm", {
    page: "Cuenta confirmada",
    mensaje: "La cuenta ha sido confirmada de forma satisfactoria",
    error: false,
  });
  next();
};

const resetPassword = async (req, res) => {
  //validar
  await check("email")
    .isEmail()
    .withMessage("Esto no parece un correo electronico")
    .run(req);
  let result = validationResult(req);
  //verificar que que no haya errores
  if (!result.isEmpty()) {
    //errores
    return res.render("auth/forgot-password", {
      page: "Recuperar Acceso a Bienes Raices",
      csrfToken: req.csrfToken(),
      errors: result.array(),
    });
  }
  const { email } = req.body;
  //buscar el correo en la base de datos
  const user = await User.findOne({ where: { email } });

  if (!user) {
    //errores
    return res.render("auth/forgot-password", {
      page: "Recuperar Acceso a Bienes Raices",
      csrfToken: req.csrfToken(),
      errors: [
        { msg: "El correo electronico no se encuentra es nuestro sistema" },
      ],
    });
  }

  // Generar un nuevo token
  user.token = generatorId();
  await user.save();

  //Enviar el email
  emailForgotPassword({
    email: user.email,
    name: user.name,
    token: user.token,
  });

  // Mostrar vista con mensaje de exito
  res.render("templates/mensaje", {
    page: "Restableciendo contraseña",
    mensaje:
      "Hemos enviado un correo con las instrucciónes para recuperar tu acceso a Bienes Raices",
  });
};

const comprobarToken = async (req, res, next) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { token } });
  if (!user) {
    return res.render("auth/account-confirm", {
      page: "Restablece tu contraseña",
      mensaje: "Hubo un error al validar tu información, intenta de nuevo",
      error: true,
    });
  }

  //mostrar vista para modificar la contraseña
  res.render("auth/new-password", {
    page: "Restablece tu contraseña",
    token,
  });

  next();
};

const newPassword = async (req, res) => {
  // validar contraseña
  await check("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe ser de minimo 6 caracteres")
    .run(req);
  let result = validationResult(req);
  //verificar que que no haya errores
  if (!result.isEmpty()) {
    //errores
    return res.render("auth/new-password", {
      page: "Restablece tu contraseña",
      csrfToken: req.csrfToken(),
      errors: result.array(),
    });
  }

  const { password, token } = req.body;

  // identificar al usuario
  const user = await User.findOne({ where: { token } });
  if (!user) {
    res.render("templates/mensaje", {
      page: "Hay un intento de suplantación",
      mensaje: "404",
    });
  }
  //hashear la nueva contraseña
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.token = null;
  user.save();

  return res.render("auth/account-confirm", {
    page: "Acceso recuperado",
    mensaje: "Tu nueva contraseña se ha almacenado correctamente",
    error: false,
  });
};

const logout = async (req, res) => {
  return res.clearCookie("_token").status(200).redirect("/auth/inicio");
};

const profile = async (req, res) => {
  const { id } = req.params;
  const { id: userId } = req.user;

  //validar que el usuario exista
  const user = await User.findByPk(id);

  if (!user || !user.confirmed) {
    return res.redirect("/404");
  }

  let esUsr = isSeller(Number(userId), Number(user.id)) == true ? true : false; //true o false
  console.log("usr " + esUsr);
  res.render("auth/profile", {
    page: "Perfil de " + user.name,
    user,
    formateDate,
    csrfToken: req.csrfToken(),
    esUsr, //true o false
  });
};

const changePassword = async (req, res) => {
  const { id } = req.params;
  //validar que el usuario exista
  const user = await User.findByPk(id);
  if (!user) {
    return res.redirect("/mis-propiedades");
  }

  let esUsr = isSeller(Number(id), Number(user.id)) == true ? true : false; //true o false
  console.log("usr " + esUsr);

  // user.category = user.categoryId;
  // user.price = user.priceId;
  res.render("auth/change-password", {
    page: `Cambiar Password: ${user.name}`,
    csrfToken: req.csrfToken(),
    userId: id,
  });
};
const updatePassword = async (req, res) => {
  // validar contraseña
  await check("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe ser de minimo 6 caracteres")
    .run(req);
  let result = validationResult(req);
  //verificar que que no haya errores
  if (!result.isEmpty()) {
    //errores
    const { id } = req.body;
    const usuario = await User.findByPk(id);
    console.log("usr " + usuario);
    let pagina = "Cambiar Password";
    // Si existe el usuario ponemos el nombre
    if (usuario) {
      pagina = `Cambiar Password ${usuario.name}`;
    }
    return res.render("auth/change-password", {
      page: pagina,
      csrfToken: req.csrfToken(),
      errors: result.array(),
    });
  }
  const { password, id } = req.body;

  // identificar al usuario
  const user = await User.findOne({ where: { id } });
  if (!user) {
    res.render("templates/mensaje", {
      page: "Hay un intento de suplantación",
      mensaje: "404",
    });
  }
  //hashear la nueva contraseña
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.token = null;
  user.save();

  return res.render("auth/account-confirm", {
    page: "Contraseña Actualizada",
    mensaje: "Tu nueva contraseña se ha almacenado correctamente",
    error: false,
  });
};

export {
  formLogin,
  auth,
  formRegister,
  formForgotPassword,
  register,
  comprobar,
  resetPassword,
  comprobarToken,
  newPassword,
  logout,
  profile,
  changePassword,
  updatePassword,
};
