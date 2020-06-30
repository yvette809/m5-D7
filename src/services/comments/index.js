const express = require("express")
const path = require("path")
const {check, validationResult,sanitizeBody} = require("express-validator")
const fs = require ("fs-extra")
const uniqid = require("uniqid")


const commentsFilePath = path.join(__dirname, "comments.json")
const getComments = ()=>{
    const commentsBuffer = fs.readFileSync(commentsFilePath)
    const commentsString = commentsBuffer.toString()
    const comments = JSON.parse(commentsString)
    return comments
}
const booksFilePath = path.join(__dirname, "../books/books.json")
const getBooks = ()=>{
    const booksBuffer = fs.readFileSync(booksFilePath)
    const booksString = commentsBuffer.toString()
    const books = JSON.parse(booksString)
    return books
}
/*
     {
        "_id": "123455", //SERVER GENERATED
        "comment": "A good book but definitely I don't like many parts of the plot", //REQUIRED
        "rate": 3, //REQUIRED, max 5
        "elementId": "5d318e1a8541744830bef139", //REQUIRED
        "createdAt": "2019-08-01T12:46:45.895Z" // SERVER GENERATED
    }
*/

// get comments for a specific book

const commentsRouter = express.Router()
commentsRouter.get("/:asin/comments", (req,res,next) =>{
    try{
        const comments = getComments()
        const filteredComments = comments.filter(comment=> comment._id === req.params.asin)
        if(filteredComments){
            res.send(filteredComments)
        }else{
            const error = new Error ("while getting comments, a prob occured")
            error.httpStatusCode = 404
            next(error)
        }
    }catch(error){
     next(error)

    }

})

// post comments on a book
const validation =  [
    check("_id").exists().withMessage("You should specify the _id"),
    check("comment").exists().withMessage("comment is required"),
    sanitizeBody("rate").toInt()
  ]
commentsRouter.post("/", validation, (req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new(Error)
        error.httpStatusCode =400
        error.message = errors
        next(error)
    }else{
        try{
            const  newComment = {...req.body, _id:uniqid()}
            const comments = getComments()
            comments.push(newComment)
            fs.writeFileSync(commentsFilePath, JSON.stringify(comments))
            const books = getBooks()
            const selectedBook = books.find(book => book.id=== newComment._id)
            selectedBook.comment +=1
            console.log("the selected b is", selectedBook)
            const filteredBooks = books.filter(book => book.id!== newComment._id)
            filteredBooks.push(selectedBook)
            fs.writeFileSync(booksFilePath, JSON.stringify(filteredBooks))
            res.status(201).send(newComment)
            
        }catch(error){
            next(error)
        }
    }
    
    
})

// delete comments for a particular book
commentsRouter.delete ("/:asin/comments", (req,res,next)=>{
    const comments = getComments()
    const singleComment = comments.find(comment => comment._id === req.params.asin)

})




module.exports = commentsRouter