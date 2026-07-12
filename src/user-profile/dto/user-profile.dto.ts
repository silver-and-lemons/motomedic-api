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
