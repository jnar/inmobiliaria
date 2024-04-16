import express from "express";
import { body } from "express-validator";
import {
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
} from "../controllers/usuarioController.js";

import identifyUser from "../middleware/identifyUser.js";

const router = express.Router();

router.get("/inicio", formLogin);
router.post("/inicio", auth);
router.post("/cerrar-sesion", logout);
router.get("/registro", formRegister);
router.post("/registro", register);
router.get("/olvide-clave", formForgotPassword);
router.get("/confirmar/:token", comprobar);
router.post("/recuperar/acceso", resetPassword);

router.get("/olvide-clave/:token", comprobarToken); //carga la vista
router.post("/olvide-clave", newPassword); // almacena la nueva contraseña

router.get("/perfil/:id", identifyUser, profile);

router.get("/cambiar-password/:id", identifyUser, changePassword);

router.post("/cambiar-password/:id", identifyUser, updatePassword);

export default router;
