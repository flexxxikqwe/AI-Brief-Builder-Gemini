import jwt from "jsonwebtoken";

const PROTECTED_ROUTES = ['/api/tasks', '/api/generate'];

export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const JWT_SECRET = config.jwtSecret || "hiring-task-secret-key-123";

  if (JWT_SECRET === "hiring-task-secret-key-123") {
    console.warn('[AUTH] WARNING: Using default JWT_SECRET. Set JWT_SECRET env variable.');
  }

  const path = getRequestPath(event);
  
  // Check if current path is protected
  const isProtected = PROTECTED_ROUTES.some(route => path.startsWith(route));

  if (isProtected) {
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
