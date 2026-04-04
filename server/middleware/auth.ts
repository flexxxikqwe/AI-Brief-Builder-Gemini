import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "hiring-task-secret-key-123";

export default defineEventHandler((event) => {
  const path = getRequestPath(event);
  
  // Only check auth for /api/tasks routes
  if (path.startsWith('/api/tasks')) {
    const authHeader = getHeader(event, 'authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      });
    }

    try {
      const user = jwt.verify(token, JWT_SECRET);
      event.context.user = user;
    } catch (err) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden'
      });
    }
  }
});
