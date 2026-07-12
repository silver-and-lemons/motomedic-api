import { desc, eq } from "drizzle-orm";
import { db } from "../shared/infrastructure/database/index.js";
import { users } from "../shared/infrastructure/database/schema.js";
import type { GetUserProfileQuery, UserProfileResponse } from "./dto/user-profile.dto.js";

function mapUserProfile(user: typeof users.$inferSelect): UserProfileResponse {
	return {
		id: user.id,
		googleId: user.googleId ?? null,
		email: user.email,
		fullName: user.fullName,
		contactNumber: user.contactNumber ?? null,
		avatarUrl: user.avatarUrl ?? null,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}

export async function getUserProfileByQuery(query: GetUserProfileQuery): Promise<UserProfileResponse | null> {
	const { email, contactNumber } = query;

	const whereClause = email
		? eq(users.email, email)
		: contactNumber
			? eq(users.contactNumber, contactNumber)
			: undefined;

	const [user] = await db.select().from(users).where(whereClause).limit(1)

	if (!user) {
		return null;
	}

	return mapUserProfile(user);
}
