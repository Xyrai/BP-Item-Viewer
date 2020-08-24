const convertToFile = (type) => {
  const conversion = { weapon: "weapons", skill: "skill_data" };
  return conversion[type] || "N/A";
};

const search = (req, res) => {
  const code = req.query.code;
  const isKeyword = isNaN(code);

  const type = req.query.type;
  const conversion = convertToFile(type);

  if (!type)
    return {
      title: "Error",
      error: "There was an error rendering this page (Did you hyperlink without the form)?",
    };

  if (conversion === "N/A") return { title: "Error", error: "Could not find the given type" };

  const fileToFind = JSON.parse(fs.readFileSync(`./json_dump/${conversion}.json`, "utf8"));

  const findId = fileToFind.filter((entry) => {
    return entry.id == code;
  });

  if (findId && findId.length === 1) {
    const entry = findId[0];
    if (conversion == "weapons") return convertTypeWeapon(entry);
  } else {
    return {
      title: "Error",
      error: "ID could not be found",
    };
  }
};
