import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.doctor = {
      id: Number(decoded.doctorId || decoded.id || decoded.userId),
    };
    console.log("JWT DECODED:", decoded);
    console.log("FINAL DOCTOR ID:", req.doctor.id);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
export default authMiddleware;
