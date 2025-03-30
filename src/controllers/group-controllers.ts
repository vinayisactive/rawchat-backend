import { Request, Response } from "express";
import db from "../database/database.config";
import { groupChatPayloadSchema, groupUpdatePayloadSchema } from "../utilities/zod-schemas";
import { object } from "zod";

class GroupControllers {
    static async create( request: Request, response: Response) {
        try {
            const requestPayload = request.body; 
            const user = request.user; 

            const validationResult = groupChatPayloadSchema.safeParse(requestPayload); 
            
            if(!validationResult.success){
                response
                .status(400)
                .json({
                    message: "Invalid request payload data.",
                    error: validationResult.error.errors
                })

                return; 
            }

            const {name, password} = validationResult.data; 

            const chatGroup = await db.chatGroup.create({
                data: {
                    name: name,
                    password: password,
                    owner_id: user?.id!
                },
                select: {
                    id: true,
                    name: true
                }
            }); 
            
            if(!chatGroup){
                response
                .status(500)
                .json({
                    message: "Failed to create group chat."
                })

                return; 
            }

            response
            .status(200)
            .json({
                message: "Chat group created successfully.",
                data: chatGroup
            });

        } catch (error) {
            console.error("Error creating chat group:", error);

            response
            .status(500)
            .json({
                message: "Something went wrong.",
                error: process.env.NODE_ENV === "development" ? error : undefined
            })
        }
    }

    static async showAll( request: Request, response: Response) {
        try {
            const user = request.user; 

            const chatGroups = await db.chatGroup.findMany({
              where: {
                owner_id: user?.id
              },
              orderBy: {
                created_at : "desc"
              },
              select: {
                id: true,
                name: true,
                created_at: true
              }
            }); 
            
            response
            .status(200)
            .json({
                message: "Chat groups fetched successfully.",
                data: chatGroups
            });

        } catch (error) {
            console.error("Error fetching chat groups:", error);

            response
            .status(500)
            .json({
                message: "Something went wrong.",
                error: process.env.NODE_ENV === "development" ? error : undefined
            })
        }
    }

    static async show(request: Request, response: Response){
        try {
            const user = request.user; 
            const {id} = request.params

            if(!id){
                response
                .status(400)
                .json({
                    message: "Chat group ID parameter is missing."
                })

                return; 
            }

            const group = await db.chatGroup.findUnique({
                where: {
                    id,
                    owner_id: user?.id
                },
                select: {
                    id: true,
                    name: true,
                    owner: {
                        select: {
                            id: true,
                            name: true,                      
                          }
                    },
                    users: {
                        select: {
                            id: true,
                            role: true,
                            created_at: true
                        }
                    },
                    _count: {
                        select: {
                            users: true
                        }
                    },
                    created_at: true
                }
            }); 

            if(!group){
                response
                .status(404)
                .json({
                    message: "Chat group doesn't exists."
                })

                return; 
            }

            response
            .status(200)
            .json({
                message: "Chat group fetched successfully.",
                data: {
                    id: group.id,
                    name: group.name,
                    owner: group.owner,
                    users: group.users,
                    total_users: group._count.users,
                    created_at: group.created_at
                }
            })

        } catch (error) {
            console.log("Error fetching chat group:", error)

            response
            .status(500)
            .json({
                message: "Something went wrong.",
                error: process.env.NODE_ENV === "development" ? error: undefined
            })
        }
    } 

    static async update(request: Request, response: Response){
        try {
            const user = request.user;  
            const {id} = request.params; 
            const requestPayload = request.body; 

            if(!id){
                response
                .status(400)
                .json({
                    message: "Chat group ID parameter is missing."
                })

                return; 
            }

            const validationResult = groupUpdatePayloadSchema.safeParse(requestPayload); 

            if(!validationResult.success){
                response
                .status(401)
                .json({
                    message: "Invalid request payload data.",
                    error : validationResult.error.errors
                }); 

                return; 
            }

            if(Object.keys(validationResult.data).length ===0){
                response
                .status(400)
                .json({
                    message: "No valid fields to update."
                }); 

                return; 
            }

            const group = await db.chatGroup.update({
                where: {
                    id,
                    owner_id: user?.id
                },
                data: validationResult.data,
                select: {
                    id: true,
                    name: true
                }
            }); 

            if(!group){
                response
                .status(500)
                .json({
                    message: "Failed to update chat group.",
                }); 

                return;
            }; 

            response
            .status(200)
            .json({
                message: "Updated chat group successfully.",
                data: group
            }); 

        } catch (error) {
            console.log("Error updating chat group:", error); 

            response
            .status(500)
            .json({
                message: "Something went wrong.",
                error: process.env.NODE_ENV=== "development" ? error : undefined
            })
        }
    }

    static async delete(request: Request, response: Response){
        try {
            const user = request.user; 
            const {id} = request.params; 
         
            if(!id){
                response
                .status(400)
                .json({
                    message: "Chat group ID parameter is missing."
                })

                return; 
            }

            const groups = await db.chatGroup.deleteMany({
                where: {
                    id,
                    owner_id: user?.id
                }
            }); 
            
            if(groups.count === 0){
                response
                .status(500)
                .json({
                    message: "Chat group not found or you do not have permission to delete it."
                }); 

                return; 
            }

            response
            .status(200)
            .json({
                message: "Deleted chat group successfully."
            }); 

        } catch (error) {
            console.log("Error deleting chat group:", error); 

            response
            .status(500)
            .json({
                message: "Something went wrong.",
                error: process.env.NODE_ENV === "development" ? error : undefined
            });
        }
    }
}

export default GroupControllers; 