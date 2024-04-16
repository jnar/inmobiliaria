import { unlink } from "node:fs/promises";
import { validationResult } from "express-validator";
import { Price, Category, Propertie, Message, User } from "../models/index.js";
import { isSeller, formateDate } from "../helpers/index.js";

const admin = async (req, res) => {
  //propiedad?page=1
  //leer query string
  const { page: paginaActual } = req.query;

  //expression regular
  const expresion = /^[0-9]$/;
  if (!expresion.test(paginaActual)) {
    return res.redirect("/mis-propiedades?page=1");
  }

  try {
    const { id } = req.user;

    // limit y offset para paginar
    const limit = 5;
    const offset = paginaActual * limit - limit;

    /**
     *  1 x 10 = 10 - 10= 0
     *  2 x 10 = 20 - 10 = 10
     *  3 x 10 = 30 -10 = 20
     *  4 x 10 = 40 - 10 = 30
     *
     *  1 x 4 = 4 - 4 = 0
     *  2 x 4 = 8 - 4 = 4
     */

    const [properties, total] = await Promise.all([
      Propertie.findAll({
        limit, //limite
        offset,
        where: {
          userId: id,
        },
        include: [{ model: Category }, { model: Price }, { model: Message }],
      }),
      Propertie.count({
        where: {
          userId: id,
        },
      }),
    ]);

    res.render("properties/admin", {
      page: "Mis propiedades",
      properties,
      paginacion: Math.ceil(total / limit),
      csrfToken: req.csrfToken(),
      paginaActual,
      offset,
      limit,
      total,
      userId: id,
    });
  } catch (error) {
    console.log(error);
  }
};

const crear = async (req, res) => {
  // consultar precios
  // const prices = Price.findAll()
  // //consultar categorias
  // const categories = Category.findAll()

  // Consultando Precios y Categorias
  const { id } = req.user;
  const [prices, categories] = await Promise.all([
    Price.findAll(),
    Category.findAll(),
  ]);

  res.render("properties/create", {
    page: "Crear propiedad",
    prices,
    categories,
    csrfToken: req.csrfToken(),
    data: {},
    userId: id,
  });
};

const guardar = async (req, res) => {
  // Resultado de la validación
  let result = validationResult(req);
  if (!result.isEmpty()) {
    const [prices, categories] = await Promise.all([
      Price.findAll(),
      Category.findAll(),
    ]);
    res.render("properties/create", {
      page: "Crear propiedad",
      prices,
      categories,
      errors: result.array(),
      csrfToken: req.csrfToken(),
      data: req.body,
    });
  }

  //crear registro
  const {
    title,
    description,
    rooms,
    parking,
    wc,
    address,
    lat,
    lng,
    price: priceId,
    category: categoryId,
  } = req.body;

  const { id: userId } = req.user;
  const upTitle = title.toUpperCase();
  try {
    const propiedad = await Propertie.create({
      title: upTitle,
      description,
      rooms,
      parking,
      wc,
      address,
      lat,
      lng,
      priceId,
      categoryId,
      userId,
      image: "",
    });

    const { id } = propiedad;

    res.redirect(`/propiedades/agregar-imagen/${id}`);
  } catch (error) {
    console.log(error);
  }
  console.log(req.body);
};

const agregarImagen = async (req, res) => {
  const { id } = req.params;

  // Validar que la propiedad exista
  const property = await Propertie.findByPk(id);
  if (!property) {
    return res.redirect("/mis-propiedades");
  }

  //validar que la propiedad NO este publicada
  if (property.published) {
    return res.redirect("/mis-propiedades");
  }

  //validar que la propiedad le pertenezca al usuario
  console.log(req.user);
  if (property.userId.toString() !== req.user.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  res.render("properties/agregar-imagen", {
    page: "Agregar imagen | " + property.title,
    csrfToken: req.csrfToken(),
    property,
  });
};

const saveImage = async (req, res, next) => {
  const { id } = req.params;
  try {
    const property = await Propertie.findByPk(id);
    console.log(req.file);
    //Almacenar la imagen y publicar la propiedad
    property.image = req.file.filename;
    property.published = 1;
    await property.save();
    next();
  } catch (error) {
    console.log(error);
  }
};

const editar = async (req, res) => {
  const { id } = req.params;
  //validar que la propiedad exista
  const property = await Propertie.findByPk(id);
  if (!property) {
    return res.redirect("/mis-propiedades");
  }

  //validar que la propiedad sea del usuario
  if (property.userId.toString() !== req.user.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  // Consultando Precios y Categorias
  const [prices, categories] = await Promise.all([
    Price.findAll(),
    Category.findAll(),
  ]);
  // property.category = property.categoryId;
  // property.price = property.priceId;
  res.render("properties/edit", {
    page: `Editar propiedad: ${property.title}`,
    prices,
    categories,
    csrfToken: req.csrfToken(),
    data: property,
    userId: property.userId,
  });
};

const actualizar = async (req, res) => {
  // Resultado de la validación
  let result = validationResult(req);
  if (!result.isEmpty()) {
    //si no paso la validación
    // Traemos los datos de la propiedad de la bd para mostrar el título
    const { id } = req.params;
    const propiedad = await Propertie.findByPk(id);
    let pagina = "Editar Propiedad";
    // Si existe la propiedad ponemos el titulo
    if (propiedad) {
      pagina = `Editar Propiedad ${propiedad.title}`;
    }

    const [prices, categories] = await Promise.all([
      Price.findAll(),
      Category.findAll(),
    ]);
    res.render("properties/edit", {
      page: pagina,
      prices,
      categories,
      csrfToken: req.csrfToken(),
      errors: result.array(),
      data: req.body,
    });
  } else {
    const { id } = req.params;
    //validar que la propiedad exista
    const property = await Propertie.findByPk(id);
    if (!property) {
      return res.redirect("/mis-propiedades");
    }

    //validar que la propiedad sea del usuario
    if (property.userId.toString() !== req.user.id.toString()) {
      return res.redirect("/mis-propiedades");
    }

    //actualizar datos de la propiedad
    try {
      const {
        title,
        description,
        rooms,
        parking,
        wc,
        address,
        lat,
        lng,
        price: priceId,
        category: categoryId,
      } = req.body;

      const upTitle = title.toUpperCase();
      // console.log("Titulo **" + upTitle);
      property.set({
        title: upTitle,
        description,
        rooms,
        parking,
        wc,
        address,
        lat,
        lng,
        priceId,
        categoryId,
      });
      await property.save();

      res.redirect("/mis-propiedades");
    } catch (error) {
      console.log(error);
    }
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;

  //validar que la propiedad exista
  const property = await Propertie.findByPk(id);
  if (!property) {
    return res.redirect("/mis-propiedades");
  }

  //validar que la propiedad sea del usuario
  if (property.userId.toString() !== req.user.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  //eliminar imagen
  await unlink(`public/uploads/${property.image}`);

  console.log(`imagen eliminada ${property.image}`);
  //eliminar propiedad
  await property.destroy();

  res.redirect("/mis-propiedades");
};

const actualizarEstado = async (req, res) => {
  const { id } = req.params;
  //validar que la propiedad exista
  const property = await Propertie.findByPk(id);
  if (!property) {
    return res.redirect("/mis-propiedades");
  }

  //validar que la propiedad sea del usuario
  if (property.userId.toString() !== req.user.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  const published = property.published == 1 ? 0 : 1;

  property.set({ published });

  await property.save();

  res.redirect("/mis-propiedades");
};

//Publico--------------

const verPropiedad = async (req, res) => {
  const { id } = req.params;
  //validar que la propiedad exista
  const property = await Propertie.findByPk(id, {
    include: [{ model: Price }, { model: Category }],
  });

  if (!property || !property.published) {
    return res.redirect("/404");
  }

  res.render("properties/show", {
    page: property.title,
    property,
    csrfToken: req.csrfToken(),
    user: req.user,
    isSeller: isSeller(req.user?.id, property.userId), //true o false
  });
};

const sendMessage = async (req, res) => {
  const { id } = req.params;
  //validar que la propiedad exista
  const property = await Propertie.findByPk(id, {
    include: [{ model: Price }, { model: Category }],
  });
  if (!property) {
    return res.redirect("/404");
  }

  //mostrar los errores
  let result = validationResult(req);
  if (!result.isEmpty()) {
    return res.render("properties/show", {
      page: property.title,
      property,
      csrfToken: req.csrfToken(),
      user: req.user,
      isSeller: isSeller(req.user?.id, property.userId), //true o false
      errors: result.array(),
    });
  }

  const { message } = req.body;
  const { id: propertyId } = req.params;
  const { id: userId } = req.user;
  //Almacenar el mensaje
  await Message.create({
    message,
    propertyId,
    userId,
  });

  res.redirect("/");

  // res.render('properties/show', {
  //     page: property.title,
  //     property,
  //     csrfToken : req.csrfToken(),
  //     user: req.user,
  //     isSeller : isSeller(req.user?.id, property.userId), //true o false
  //     send: true
  // })
};

//leer los mensajes
const showMessages = async (req, res) => {
  const { id } = req.params;

  //validar que la propiedad exista

  /**
   *  propiedades -> mensajes -> usuario (Daniel)
   *
   */
  const property = await Propertie.findByPk(id, {
    include: [
      { model: Message, include: [{ model: User.scope("deletePassword") }] },
    ],
  });
  if (!property) {
    return res.redirect("/mis-propiedades");
  }

  //validar que la propiedad sea del usuario
  if (property.userId.toString() !== req.user.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  res.render("properties/message", {
    page: "Mensajes",
    messages: property.messages,
    formateDate,
    userId: property.userId,
  });
};

export {
  admin,
  crear,
  guardar,
  agregarImagen,
  saveImage,
  editar,
  actualizar,
  eliminar,
  actualizarEstado,
  verPropiedad,
  sendMessage,
  showMessages,
};
