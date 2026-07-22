import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const googleAuthentication = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: "Token is required" });
    }
    // 1. Explicitly check that the Client ID environmental variable is set
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        console.error("Missing GOOGLE_CLIENT_ID environment variable.");
        return res.status(500).json({ error: "Server authentication configuration error" });
    }
    try {
        // 2. Pass the verified string variable instead of process.env directly
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId, // TypeScript is now 100% happy because clientId is guaranteed to be a string
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ error: "Invalid token payload" });
        }
        // Extract verified user profile data securely
        const { email, name, picture, sub: googleId } = payload;
        console.log(`User authenticated: ${name} (${email})`);
        return res.json({
            message: "Login successful",
            user: {
                id: googleId,
                email,
                name,
                avatar: picture
            }
        });
    }
    catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ error: "Unauthorized token authentication failed" });
    }
};
//# sourceMappingURL=google.js.map