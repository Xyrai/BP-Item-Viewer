const express = require("express");
const config = require("../config.json");
const fs = require("fs");

const router = express.Router();

const parser = (entry) => {
  const nameId = entry.name;
  const descId = entry.desc;
  const iconName = entry.icon_name;
  const levelTableName = entry.level_table;
  const equipClassId = entry.equip_class;

  const localeJP = JSON.parse(fs.readFileSync(`data/${config.files.base_locale}`, "utf8"));
  const localeEntry = localeJP.find((entry) => entry.name === config.locale_categories.weapon_name);
  const levelTableFile = JSON.parse(fs.readFileSync(`data/${config.files.level_data}`, "utf8"));
  const classes = JSON.parse(fs.readFileSync(`data/${config.files.class_ids}`, "utf8"));

  const name = localeEntry.texts.find((entry) => entry.id == nameId).text;
  const description = localeEntry.texts.find((entry) => entry.id == descId).text;
  const levelTable = levelTableFile.filter((entry) => entry.type == levelTableName);
  const classType = classes[equipClassId];

  return {
    id: entry.id,
    name: name,
    description: description,
    price: entry.price,
    class: classType,
    selling_price: entry.selling_price,
    equip_level: entry.equip_level,
    active: entry.active,
    icon: `/${config.files.ui.base_folder}/${config.files.ui.weapons}/${iconName}.png`,
    level_table_type: levelTable[0].type,
    level_table: levelTable,
  };
};

const byId = (id) => {
  const findFile = JSON.parse(fs.readFileSync(`data/${config.files.weapons}`, "utf8"));
  const findId = findFile.find((entry) => {
    return entry.id == id;
  });
  if (!findId) return;

  return parser(findId);
};

const fullList = () => {
  const findFile = JSON.parse(fs.readFileSync(`data/${config.files.weapons}`, "utf8"));
  const dataParser = findFile.map((entry) => parser(entry));
  return dataParser;
};

router.get("/", (req, res) => {
  res.render("weapons", { title: "Weapons", weapons_list: fullList() });
});

router.get("/:id", (req, res) => {
  const findById = byId(req.params.id);
  if (!findById) return res.redirect("404", { query: "Item not Found" });
  res.render("weapon", { title: findById.name, weapon: findById });
});

module.exports = {
  router: router,
  parser: parser,
};
