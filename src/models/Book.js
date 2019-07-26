const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BookSchema = new Schema ({
    title: String,
    author: String,
    year: Number,
    status: String,
    priority: Number,
    categories: [String],
    authors: [String],
    pages: Number,
    description: String,
    snippet: String,
    googleBooksId: String,
    subtitle: String,
    publisher: String,
    isbn10: String,
    isbn13: String
})

module.exports = mongoose.model('Book', BookSchema)