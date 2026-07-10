import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("VERIFY TOKEN:", token);
    console.log("VERIFY SECRET EXISTS:", !!process.env.JWT_SECRET);
    console.log("VERIFY SECRET LENGTH:", process.env.JWT_SECRET?.length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED:", decoded);

    req.doctor = {
      id: Number(decoded.id),
    };

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);

    return res.status(401).json({
      message: "Unauthorized",
      error: err.message,
    });
  }
};
export default authMiddleware;
