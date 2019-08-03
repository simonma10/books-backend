const hapi = require('hapi')
const axios = require('axios')
require('dotenv').config()

let GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY

module.exports = {
    name: "googleBooksPlugin",
    register: async (server, options) => {
    
      server.route([
        {
          method: 'GET',
          path: '/api/v1/external/google/volumes',
          config: {
            description: 'An extract of the search results from the google books volumes.list api',
            auth: options.auth
          },
          
          handler: async function(req, res){
              let q = req.query.q
              let books = []
              return await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${q}&key=${GOOGLE_BOOKS_API_KEY}`)
              .then(function(response){
                  
                  console.log(q, response.data.totalItems, response.data.items.length)
                  response.data.items.forEach((item)=>{
                      let ivi = item.volumeInfo
                      let snippet = ""
                      if(item.searchInfo){
                          snippet = item.searchInfo.textSnippet
					  }
					  let isbn10, isbn13 = ""
					  if(ivi.industryIdentifiers){
						  ivi.industryIdentifiers.forEach((item)=> {
							  if(item.type === "ISBN_10") { isbn10 = item.identifier}
							  if(item.type === "ISBN_13") { isbn13 = item.identifier}
						  })
					  }
                      let book = {
						  googleBooksId: item.id,
						  title: ivi.title,
						  subtitle: ivi.subtitle,
						  publisher: ivi.publisher,
                          authors: ivi.authors,
                          date: ivi.publishedDate,
                          pages: ivi.pageCount,
                          description: ivi.description,
                          categories: ivi.categories,
						  snippet: snippet,
						  isbn10: isbn10,
						  isbn13: isbn13
                      }
                      books.push(book)
                  })
                  return books
              })
              
          }
      },
      {
        method: 'GET',
        path: '/api/v1/external/google/volumes/full',
        config: {
		  description: 'Full search results from google books volumes.list api',
		  auth: options.auth
        },
        handler: async function(req, res){
            let q = req.query.q
            let books = []
            return await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${q}&key=${GOOGLE_BOOKS_API_KEY}`)
            .then(function(response){
                console.log(q, response.data.totalItems, response.data.items.length)
                
                return response.data
            })
            
        }
      },
    ]);
    
  }
}