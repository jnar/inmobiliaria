import Sequelize from "sequelize";
import { Price, Category, Propertie } from "../models/index.js";

const home = async (req, res) => {
  //consultar precio
  // const prices = await Price.findAll()

  //consultar categorias
  // const categories = await Category.findAll()

  const [categories, prices, houses, departments] = await Promise.all([
    Category.findAll({ raw: true }),

    Price.findAll({ raw: true }),

    Propertie.findAll({
      limit: 3,
      where: {
        categoryId: 1,
        published: 1,
      },
      include: [{ model: Price }, { model: Category }],
      order: [["createdAt", "DESC"]],
    }),

    Propertie.findAll({
      limit: 3,
      where: {
        categoryId: 2,
        published: 1,
      },
      include: [{ model: Price }, { model: Category }],
      order: [["createdAt", "DESC"]],
    }),
  ]);

  res.render("home", {
    page: "Inicio",
    categories,
    prices,
    houses,
    departments,
    csrfToken: req.csrfToken(),
  });
};

const categories = async (req, res) => {
  const { id } = req.params;

  //Comprobar que la propiedad exista
  const category = await Category.findByPk(id);
  if (!category) {
    return res.redirect("/404");
  }

  //listar propiedades
  const properties = await Propertie.findAll({
    where: {
      categoryId: id,
    },
    include: [{ model: Price }, { model: Category }],
  });

  res.render("category", {
    page: `Categoria | ${category.name}s`,
    properties,
    csrfToken: req.csrfToken(),
  });
};

const notFound = async (req, res) => {
  res.render("404", {
    page: "No encontrado",
    csrfToken: req.csrfToken(),
  });
};

const search = async (req, res) => {
  const { termino } = req.body;

  //validar que no este vacio el termino
  if (!termino.trim()) {
    return res.redirect("back");
  }

  //consultar propiedades
  const properties = await Propertie.findAll({
    where: {
      title: {
        [Sequelize.Op.like]: "%" + termino + "%",
      },
    },
    include: [{ model: Price }],
  });

  res.render("search", {
    page: "Resultado de busqueda",
    properties,
    csrfToken: req.csrfToken(),
  });
};

export { home, categories, notFound, search };
