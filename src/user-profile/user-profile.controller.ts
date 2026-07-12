import type { NextFunction, Request, Response } from "express";
import { getUserProfileByQuery, upsertUserProfile } from "./user-profile.service.js";

function readSingleQueryValue(value: unknown): string | undefined {
	if (typeof value === "string") {
		return value;
	}

	return undefined;
}

export async function getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const user = await getUserProfileByQuery({
			email: readSingleQueryValue(req.query.email),
            contactNumber: readSingleQueryValue(req.query.contactNumber)
		});

		if (!user) {
			res.status(404).json({ message: "User profile not found" });
			return;
		}

		res.status(200).json(user);
	} catch (error) {
		next(error);
	}
}

export async function updateUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // implementation will likely change based on authentication process
        // TODO: modify according to authentication process/token
        const authUser = (req as any).user;

        if (!authUser || !authUser.id || !authUser.email) {
            res.status(401).json({ message: "Unauthorized: Missing authentication context" });
            return;
        }

        // from authenticated user
        const userId = authUser.id;
        const email = authUser.email;

        // from whatever forms
        const { fullName, contactNumber, avatarUrl } = req.body;

        if (!fullName) {
            res.status(400).json({ message: "Full name is required" });
            return;
        }

        const user = await upsertUserProfile(
            userId,
            email, {
                fullName,
                contactNumber: contactNumber ?? null,
                avatarUrl: avatarUrl ?? null,
        });

        if(!user) {
            res.status(404).json({ message: "User profile not found" });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        next(error)
    }
}
