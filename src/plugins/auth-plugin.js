const hapi = require('hapi')
const Bcrypt = require('bcrypt')
const User = require('../models/User')

const SALT = 10

const ROLES = {
	ADMIN: 'admin',	// manage users
	USER: 'user', 	// manage books
	GUEST: 'guest'	// not much, read only
}


module.exports = {
    name: "authPlugin",
    register: async (server, options) => {
    
    	server.route([
			{
				method: 'GET',
				path:'/login',
				config: {
					auth: options.auth,
					description: 'Login',
				},
				handler: async (req, res) => { 

					const {credentials} = req.auth

					const users = await User.find({username:credentials.username})
					
					if(users.length > 0){
						const user = users[0]
						console.log("Login:", user.username, user.role)
						return JSON.stringify({username: user.username, email: user.email, role: user.role, _id: user._id})
					} else {
						return JSON.stringify(
							{
								"statusCode": 404,
								"error": "Not found",
								"message": "User not found",
								"attributes": {
									"error": "User not found"
								}
							}
						)
					}
					
				}
			},
			{
				method: 'GET',
				path:'/users',
				config: {
					auth: options.auth,
					description: 'Get a list of users',

				},
				handler: (req, res) => { 
					const {credentials} = req.auth

					// Check is user has ADMIN role and is active
					if (credentials.role !== ROLES.ADMIN || credentials.active !== true){
						return JSON.stringify(
							{
								"statusCode": 403,
								"error": "Forbidden",
								"message": "User not authorized to perform this action",
								"attributes": {
									"error": "User not authorized to perform this action"
								}
							}
						)
					}
					return User.find()
				}
			},
			
			{
				method: 'POST',
				path: '/users',
				config: {
					auth: options.auth,
					description: 'Create a new user',
				},
				handler: async (req, res) => {
					const {username, password, email, role, active} = req.payload
					const {credentials} = req.auth

					// Check is user has ADMIN role and is active
					if (credentials.role !== ROLES.ADMIN || credentials.active !== true){
						return JSON.stringify(
							{
								"statusCode": 403,
								"error": "Forbidden",
								"message": "User not authorized to perform this action",
								"attributes": {
									"error": "User not authorized to perform this action"
								}
							}
						)
					}

					// Check that username doesn't already exist
					const duplicate = await User.find({username:username})
					if (duplicate.length > 0){
						return JSON.stringify(
							{
								"statusCode": 400,
								"error": "Bad request",
								"message": "Username already exists",
								"attributes": {
									"error": "Username already exists"
								}
							}
						)
					}

					// Create new user record
					const hash = await Bcrypt.hash(password, SALT)
					const user = new User({username, password: hash, email, role, active})
					
					return user.save()
				}
			},

			{
				method: 'PATCH',
				path: '/users',
				config: {
					auth: options.auth,
					description: 'Update user information',
				},
				handler: async (req, res) => {
					const {username, password, email, role, active} = req.payload
					const {credentials} = req.auth

					// Check is user has ADMIN role and is active
					if (credentials.role !== ROLES.ADMIN || credentials.active !== true){
						return JSON.stringify(
							{
								"statusCode": 403,
								"error": "Forbidden",
								"message": "User not authorized to perform this action",
								"attributes": {
									"error": "User not authorized to perform this action"
								}
							}
						)
					}
					let hash
					// If password is already encrypted, do not update it.
					if (password.startsWith("$2b$10")){
						hash = password
					} else {
						hash = await Bcrypt.hash(password, SALT)
					}
					 
					return User.findOneAndUpdate({username:username}, 
						{
							password: hash,
							email: email,
							role: role,
							active: active
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
				path: '/users',
				config: {
					auth: options.auth,
					description: 'Delete a user',
				},
				handler: async (req, res) => {
					const {username} = req.payload
					const {credentials} = req.auth

					// Check is user has ADMIN role and is active
					if (credentials.role !== ROLES.ADMIN || credentials.active !== true){
						return JSON.stringify(
							{
								"statusCode": 403,
								"error": "Forbidden",
								"message": "User not authorized to perform this action",
								"attributes": {
									"error": "User not authorized to perform this action"
								}
							}
						)
					}

					// Deleting the currently authenticated user is not allowed
					if (credentials.username === username){
						return JSON.stringify(
							{
								"statusCode": 403,
								"error": "Forbidden",
								"message": "Deleting the currently authenticated user is not permitted",
								"attributes": {
									"error": "Deleting the currently authenticated user is not permitted"
								}
							}
						)
					}

					return User.deleteOne({username:username})
				}
			},

			
		
		
	]);
	
	
    
  }
}
/*
username: String,
password: String,
email: String,
role: String,
active: Boolean

*/