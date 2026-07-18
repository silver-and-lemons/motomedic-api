export type GetUserProfileQuery = {
	email?: string;
    contactNumber?: string | null;
};

export type UserProfileResponse = {
	id: string;
	googleId: string | null;
	email: string;
	fullName: string;
	contactNumber: string | null;
	avatarUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
};

/**
 * Includes only the things that can be modified. id and email are omitted for this reason
 * unless contactNumber becomes the focal reference.
 */
export type UpsertUserProfileInput = {
    fullName: string;
    contactNumber?: string | null;
    avatarUrl?: string | null;
};