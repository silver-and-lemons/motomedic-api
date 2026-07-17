import type { NextFunction, Request, Response } from "express";
import { getUserProfileByQuery, upsertUserProfile } from "./user-profile.service.js";

function readSingleQueryValue(value: unknown): string | undefined {
	if (typeof value === "string") {
		return value;
	}

	return undefined;
}

/**
 * GET /api/v1/user
 * Retrieves the profile details of the authenticated user.
 */
export async function getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
        const authUser = (req as any).user;
        if (!authUser || !authUser.id || !authUser.email) {
            res.status(401).json({ message: "Unauthorized: Missing authentication context" });
            return;
        }

        // Only search for the profile linked to the authenticated user's email
		const user = await getUserProfileByQuery({
			email: authUser.email
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
        const authUser = (req as any).user;

        if (!authUser || !authUser.id || !authUser.email) {
            res.status(401).json({ message: "Unauthorized: Missing authentication context" });
            return;
        }

        const userId = authUser.id;
        const email = authUser.email;
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

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}
