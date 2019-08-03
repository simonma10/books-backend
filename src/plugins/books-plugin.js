const hapi = require('hapi')
const Book = require('../models/Book')


module.exports = {
    name: "booksPlugin",
    register: async (server, options) => {
    
      server.route([
        {
            method: 'GET',
            path:'/api/v1/books',
            config: {
                description: 'GET book by ID, title or author, or without params to get all',
                auth: options.auth
            },
            handler: async (req, res) => { 
                const {credentials} = req.auth
                console.log(credentials)
                if (req.query.id){

                    // find by Book.id
                    return Book.find({_id: req.query.id, userid: credentials._id})

                } else if (req.query.title){

                    // fuzzy match title
                    let re = new RegExp(req.query.title,"gi");
                    return Book.find({userid: credentials._id}).where('title').regex(re)

                } else if (req.query.author){

                    // fuzzy match author
                    let re = new RegExp(req.query.author,"gi");
                    return Book.find({userid: credentials._id}).where('author').regex(re)

                } else {
                    return Book.find({userid: credentials._id})
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/books',
            config: {
                description: 'Create a new book',
                auth: options.auth
            },
            handler: (req, res) => {
                const {title, author, year, status, priority, authors, categories, pages, description, 
                    snippet, googleBooksId, subtitle, publisher, isbn10, isbn13, date, userid} = req.payload
                const book = new Book({
                    title, author, year, status, priority, authors, categories, pages, description, 
                    snippet, googleBooksId, subtitle, publisher, isbn10, isbn13, date, userid
                })
                return book.save()
            }
        },
        {
            method: 'PATCH',
            path: '/api/v1/books',
            config: {
                description: 'Update a book, by ID',
                auth: options.auth
            },
            handler: (req, res) => {
                //console.log(req.payload)
                const {_id, title, author, year, status, priority, authors, categories, pages, description, 
                    snippet, googleBooksId, subtitle, publisher, isbn10, isbn13, date, userid} = req.payload

                return Book.findOneAndUpdate({_id: _id}, 
                    {
                        title: title,
                        author: author,
                        year: year,
                        status: status,
                        priority: priority,
                        authors: authors,
                        categories: categories,
                        pages: pages,
                        description: description,
                        snippet: snippet,
                        googleBooksId: googleBooksId,
                        subtitle: subtitle,
                        publisher: publisher,
                        isbn10: isbn10,
                        isbn13: isbn13,
                        date: date,
                        userid: userid
                    }, 
                    (err, doc, res) => {
                        if (err){
                            console.error(err)
                        }
                        return doc
                    }
                )
            }
        },
        {
            method: 'DELETE',
            path:'/api/v1/books',
            config: {
                description: 'Delete a book, by ID',
                auth: options.auth
            },
            handler: (req, res) => {
                let id = req.query.id
                return Book.deleteOne(
                    {_id : id}
                )
            }
        }
     
    ]);
    
  }
}