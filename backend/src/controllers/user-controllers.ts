import { Request, Response, NextFunction } from "express";
import { getUserByUserId } from "../services/user-services";

/**
 * Get user by ID
 * @param req - The request object
 * @param res - The response object
 */
export const getUserData = async (req: Request, res: Response) => {
    const sessionUser = req.session.user;
    const queries = Object.values(req.query)[0] as string[];

    const user = await getUserByUserId(sessionUser?.userId || '', queries || []);

    res.status(200).json({
        message: "User fetched successfully",
        success: true,
        user
    });
}