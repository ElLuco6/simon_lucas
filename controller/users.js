const usersService = require('../services/users');
const db = require('../models/index');
const createError = require('http-errors');
const apicache = require('apicache')
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.getUsers = async (req, res, next) => {
   const users = await usersService.getUsers();
   if (users && users.length != 0) {
      res.json({success: true, data: users});
   } else {
      next(createError(404, "no users in db"));
   }
}

exports.getUserById = async (req, res, next) => {
   let userId = parseInt(req.params.id); // We are sure here by using validator that we have a valid number, we can parseInt
   if (parseInt(req.params.id)){
      const users = await usersService.getUserById(userId);
      if (users && users.length === 1) {
         res.json({success: true, data: users[0]});
      } else {
         next(createError(404, "no user found for this id"));
      }
   }else {
      next(createError(400, "Incorrect args"));
   }
}

exports.addUser = async (req, res, next) => {
   let isAdmin=false;
   if (req.originalUrl!= '/logs/register'){isAdmin = req.body.isAdmin;}
   if (req.body && req.body.userName, req.body.password) {
      const userTest = await db.users.findOne({where: {userName: req.body.userName}});
      if (!userTest){
         const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds)
         console.log(encryptedPassword)
         const userCreated = await usersService.addUser(req.body.userName, encryptedPassword, isAdmin);
         if (userCreated) {
            res.status(201).json({success: true, userId: userCreated.id});
         } else {
            next(createError(400, "Error when creating this user, verify your args"));
         }
      } else{next(createError(400, 'This userName is already taken'));}
   } else {
      next(createError(400, "Cannot add this user, make sure all args has been sent"));
   }
}

exports.deleteUserById = async (req, res, next) => {
   if (req.params.id) {
      if (parseInt(req.params.id)){
         const id = parseInt(req.params.id);
         const users = await usersService.getUserById(id);
         if (users.length === 1) {
            const nbOfDeletion = await usersService.deleteUserById(id);
            if (nbOfDeletion === 1) {
               res.json({success: true});
            } else {
               next(createError(500, 'Unknown error when trying to delete this user, maybe it\'s already deleted'));
            }
         } else {
            next(createError(404, `The user with id '${id}' doesn't exists, it cannot be deleted`));
         }
      }else {
         next(createError(400, "Incorrect args"));
      }
   } else {
      next(createError(400, "The userId is required"));
   }
}

exports.updateUser = async (req, res, next) => {
    if (req.params.id) {
      if (parseInt(req.params.id)){
         const id = parseInt(req.params.id);
         const users = await usersService.getUserById(id);
         const userTest = await db.users.findOne({where: {userName: req.body.userName}});
         if (req.body.isAdmin == true || req.body.isAdmin == false){
            if (users.length === 1) {
               if ((!userTest || userTest.userId == users[0].userId)){
                  const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds)
                  const nbOfUpdate = await usersService.updateUser(id,req.body.userName, encryptedPassword, req.body.isAdmin);
                  if (nbOfUpdate == 1) {
                     res.json({success: true,userId: id,userName : req.body.userName ,password: encryptedPassword,isAdmin:req.body.isAdmin });
                  } else {
                     next(createError(500, 'User already updated with those args'));
                  }
               } else{next(createError(400, 'This userName is already taken'));}
            } else {
               next(createError(404, `The user with id '${id}' doesn't exists, it cannot be updated`));
            }
         } else{
            next(createError(400, 'Incorect args'));
         }
      }else {
         next(createError(400, "Incorrect args"));
      }
    } else {
       next(createError(400, "UserId missing"));
    }
 }

 exports.clearCache = async (req, res,next) => {
    if(apicache.clear("/users/")){
       res.json({success: true});
    }else{
      next(createError(400, "Failled to clear cache"))
    }
}