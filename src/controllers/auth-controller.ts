import { Request, Response } from "express";
import db from "../database/database.config";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import { OAuth2Client } from "google-auth-library";

interface UserLoginPayload {
  email: string;
  password?: string;
  idToken ?: string; 
}

class AuthController {
  static async login(request: Request, response: Response) {
    const { email, password, idToken  } =
      request.body as UserLoginPayload;

      if(idToken ){
        try {

            const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!); 
            const ticket =  await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            })
   
            const googleUser = ticket.getPayload(); 

            if(!googleUser?.email){
                response
                .status(400)
                .json({ message: "Invalid OAuth access token."}) 

                return; 
            }

            const isExistingUser = await db.user.findUnique({
                where: {
                    email: googleUser.email
                },
                select: {
                    id: true, 
                    email: true,
                    name: true
                }
            }); 

            if(!googleUser.name || !googleUser.aud){
                response
                .status(400) 
                .json({
                    message: "OAuth credentials are missing for google login."
                })

                return; 
            } 

            if(!isExistingUser){
                const createUser = await db.user.create({
                    data: {
                        name: googleUser.name,
                        email: googleUser.email,
                        oauth_id: googleUser.sub 
                    },
                    select: {
                        id: true,
                        email: true,
                    }
                }); 

                const token = jwt.sign({
                    id: createUser.id,
                    email: createUser.email
                },
                 process.env.JWT_SECRET!, 
                {
                    expiresIn: "7d"
                } )


                 response
                .status(200)
                .json({
                    message: "User create successfully via OAuth.",
                    user: createUser,
                    token
                }); 

                return; 
            }

            const token = jwt.sign({
                id: isExistingUser.id,
                name: isExistingUser.name,
                email: isExistingUser.email
            }, 
            process.env.JWT_SECRET!,
            {
                expiresIn: "7d"
            }); 


            response
            .status(200)
            .json({
                message: "User logged in successfully via OAuth.",
                user: isExistingUser,
                token
            }); 

            return; 
   
        } catch (error) {
            console.log("OAuth login error: ", error); 
             response
            .status(500)
            .json({ message: "An error occured during Oauth login."}); 

            return; 
        }
      }

      const user = await db.user.findUnique({
        where: {
            email
        },
        select: {
            id: true,
            name: true,
            email: true,
            password: true
        }
      }); 

      if(!user){
        response
        .status(404)
        .json({
            message: "User doesn't exists."
        }); 

        return; 
      }

      if(!user.password){
        response
        .status(400)
        .json({
            message: "Password for OAuth user is missing, set it up."
        })

        return; 
      }

    if(!password){
        response
        .status(400)
        .json({ message: "Password is required for Non-oAuth login."}); 

        return; 
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password); 
    if(!isPasswordCorrect){
        response
        .status(401)
        .json({ message: "Password is incorrect."}); 

        return; 
    }

    const token = jwt.sign({
        id: user.id,
        name: user.name,
        email: user.email
    }, process.env.JWT_SECRET!, 
    {
        expiresIn: "7d"
    }
    ); 
    
    response
    .status(200)
    .json({
        message: "User logged in successfully.",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    })

    return;
  }

  
}

export default AuthController;