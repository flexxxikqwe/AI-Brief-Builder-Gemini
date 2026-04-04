import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { users } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const JWT_SECRET = config.jwtSecret || "hiring-task-secret-key-123";

  const body = await readBody(event);
  const { username, password } = body;
  
  const user = users.find(u => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials"
    });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
  
  return {
    token,
    user: { id: user.id, username: user.username, email: user.email }
  };
});
