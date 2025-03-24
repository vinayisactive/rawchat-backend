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
                return response
                .status(400)
                .json({ message: "Invalid OAuth access token."}) 
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
                return response
                .status(400) 
                .json({
                    message: "OAuth credentials are missing for google login."
                })
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


                return response
                .status(200)
                .json({
                    message: "User create successfully via OAuth.",
                    user: createUser,
                    token
                }); 
            }

            const token = jwt.sign({
                id: isExistingUser.id,
                email: isExistingUser.email
            }, 
            process.env.JWT_SECRET!,
            {
                expiresIn: "7d"
            }); 


            return response
            .status(200)
            .json({
                message: "User logged in successfully via OAuth.",
                user: isExistingUser,
                token
            }); 
   
        } catch (error) {
            console.log("OAuth login error: ", error); 
            return response
            .status(500)
            .json({ message: "An error occured during Oauth login."}); 
        }
      }

      const user = await db.user.findUnique({
        where: {
            email
        },
        select: {
            id: true,
            email: true,
            password: true
        }
      }); 

      if(!user){
        return response
        .status(404)
        .json({
            message: "User doesn't exists."
        })
      }

      if(!user.password){
        return response
        .status(400)
        .json({
            message: "Password for OAuth user is missing, set it up."
        })
      }

    if(!password){
        return response
        .status(400)
        .json({ message: "Password is required for Non-oAuth login."}); 
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password); 
    if(!isPasswordCorrect){
        return response
        .status(401)
        .json({ message: "Password is incorrect."}); 
    }

    const token = jwt.sign({
        id: user.id,
        email: user.email
    }, process.env.JWT_SECRET!, 
    {
        expiresIn: "7d"
    }
    ); 
    
    return response
    .status(200)
    .json({
        message: "User logged in successfully.",
        token,
        user: {
            id: user.id,
            email: user.email
        }
    })
  }
}

export default AuthController;