const express = require("express");
const config = require("../config.json");
const fs = require("fs");

const router = express.Router();

const findSkillIcon = (id, classType) => {
  const classFolder = classType === 0 ? "Common" : "Class" + classType;
  const skillPath = `/${config.files.ui.base_folder}/${config.files.ui.skills}/${classFolder}/UI_PlayerSkill_${id}.png`;
  const skillPassivePath = `/${config.files.ui.base_folder}/${config.files.ui.passive_skills}/${classFolder}/UI_PlayerSkillP_${id}.png`;

  if (fs.existsSync("public/" + skillPath)) {
    return skillPath;
  } else if (fs.existsSync("public" + skillPassivePath)) {
    return skillPassivePath;
  }
};

const parser = (entry) => {
  const nameId = entry.skill_name;
  const descIds = entry.skill_desc_array;
  const classType = entry.class_type;
  const skillType = entry.skill_type;
  const conditionSkillId = entry.condition_skill_id;
  const conditionSkillLevel = entry.condition_skill_level;
  const defaultSkill = entry.is_default_skill;

  const skillMasteryParam = entry.skill_mastery_param;

  const localeJP = JSON.parse(fs.readFileSync(`data/${config.files.base_locale}`, "utf8"));
  const localeEntry = localeJP.find((entry) => entry.name === config.locale_categories.skills);
  const classes = JSON.parse(fs.readFileSync(`data/${config.files.class_ids}`, "utf8"));

  const name = localeEntry.texts.find((entry) => entry.id == nameId).text;
  const description = descIds
    .map((mapEntry) => localeEntry.texts.find((findEntry) => findEntry.id == mapEntry.desc).text)
    .concat(" ");
  const conditionSkill = localeEntry.texts.find((entry) => entry.id == conditionSkillId);
  const className = classes[classType];
  const UIPath = findSkillIcon(entry.skill_id, classType);

  return {
    id: entry.skill_id,
    name: name,
    description: description,
    class: className,
    condition_skill: conditionSkill,
    condition_skill_level: conditionSkillLevel,
    is_default_skill: defaultSkill,
    render_icon: !!UIPath,
    icon: UIPath,
  };
};

const byId = (id) => {
  const findFile = JSON.parse(fs.readFileSync(`data/${config.files.skill_data}`, "utf8"));
  const findId = findFile.find((entry) => {
    return entry.skill_id == id;
  });
  if (!findId) return;

  return parser(findId);
};

const fullList = () => {
  const findFile = JSON.parse(fs.readFileSync(`data/${config.files.skill_data}`, "utf8"));
  const dataParser = findFile.map((entry) => parser(entry));
  return dataParser;
};

router.get("/", (req, res) => {
  res.render("skills", { title: "Weapons", weapons_list: fullList() });
});

router.get("/:id", (req, res) => {
  const findById = byId(req.params.id);
  if (!findById) return res.redirect("404", { query: "Skill not Found" });
  res.render("skill", { title: findById.name, entry: findById });
});

module.exports = {
  router: router,
  parser: parser,
};
