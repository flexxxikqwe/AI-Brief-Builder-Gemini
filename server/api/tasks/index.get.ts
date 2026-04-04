import { tasks } from "../../utils/db";

export default defineEventHandler((event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  
  return tasks.filter(t => t.userId === user.id);
});
