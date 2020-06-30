const { writeJSON, readJSON } = require("fs-extra")

const readDB = async (filePath) => {
  try {
    const fileJSON = await readJSON(filePath)
    return fileJSON
  } catch (error) {
    throw new Error(error)
  }
}

const writeDB = async (filePath, data) => {
  try {
    await writeJSON(filePath, data)
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  readDB,
  writeDB,
}