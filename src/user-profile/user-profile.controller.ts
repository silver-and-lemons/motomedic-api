import type { NextFunction, Request, Response } from "express";
import { getUserProfileByQuery } from "./user-profile.service.js";

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
