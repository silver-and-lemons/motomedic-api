declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      fullName: string;
      contactNumber: string | null;
    };
  }
}
