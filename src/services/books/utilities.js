const {writeJSON, readJSON} = require("fs-extra")
const readDB = async (filePath) =>{
    try{
        const fileJSON = await readJSON(filePath)
    }catch(error){
        throw new Error(error)
    }
}


const writeDB = async (filepath,data)=>{
    try{
        const writeJSON = await (filePath,data)
    }catch(error){
        throw new Error(error)
    }
}






module.exports = {
    readDB,
    writeDB
}