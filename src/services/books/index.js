const express = require("express")
const path = require("path")
const { check, validationResult, sanitizeBody } = require("express-validator")
const fs = require("fs-extra")
const multer = require("multer")
const { join } = require("path")
const { readDB, writeDB } = require("./utilities")

const booksJsonPath = path.join(__dirname, "books.json")

const booksFolder = join(__dirname, "../../../public/img/books/")
const upload = multer({})
const booksRouter = express.Router()

booksRouter.get("/", async (req, res, next) => {
  try {
    const data = await readDB(booksJsonPath)

    res.send({ numberOfItems: data.length, data })
  } catch (error) {
    console.log(error)
    const err = new Error("While reading books list a problem occurred!")
    next(err)
  }
})

booksRouter.get("/:asin", async (req, res, next) => {
  try {
    const books = await readDB(booksJsonPath)
    const book = books.find((b) => b.asin === req.params.asin)
    if (book) {
      res.send(book)
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next("While reading books list a problem occurred!")
  }
})

booksRouter.post(
  "/",
  [
    check("asin").exists().withMessage("You should specify the asin"),
    check("title").exists().withMessage("Title is required"),
    check("category").exists().withMessage("Category is required"),
    check("img").exists().withMessage("Img is required"),
    sanitizeBody("price").toFloat(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const error = new Error()
      error.httpStatusCode = 400
      error.message = errors
      next(error)
    }
    try {
      const books = await readDB(booksJsonPath)
      const asinCheck = books.find((x) => x.asin === req.body.asin) //get a previous element with the same asin
      if (asinCheck) {
        //if there is one, just abort the operation
        const error = new Error()
        error.httpStatusCode = 400
        error.message = "ASIN should be unique"
        next(error)
      } else {
        books.push(req.body)
        await writeDB(booksJsonPath, books)
        res.status(201).send("Created")
      }
    } catch (error) {
      next(error)
    }
  }
)

booksRouter.put("/:asin", async (req, res, next) => {
  try {
    const books = await readDB(booksJsonPath)
    const book = books.find((b) => b.asin === req.params.asin)
    if (book) {
      const position = books.indexOf(book)
      const bookUpdated = { ...book, ...req.body } // In this way we can also implement the "patch" endpoint
      books[position] = bookUpdated
      await writeDB(booksJsonPath, books)
      res.status(200).send("Updated")
    } else {
      const error = new Error(`Book with asin ${req.params.asin} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

booksRouter.delete("/:asin", async (req, res, next) => {
  try {
    const books = await readDB(booksJsonPath)
    const book = books.find((b) => b.asin === req.params.asin)
    if (book) {
      await writeDB(
        booksJsonPath,
        books.filter((x) => x.asin !== req.params.asin)
      )
      res.send("Deleted")
    } else {
      const error = new Error(`Book with asin ${req.params.asin} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

booksRouter.post("/upload", upload.single("avatar"), async (req, res, next) => {
  try {
    await fs.writeFile(
      join(booksFolder, req.file.originalname),
      req.file.buffer
    )
  } catch (error) {
    next(error)
  }
  res.send("OK")
})

module.exports = booksRouter