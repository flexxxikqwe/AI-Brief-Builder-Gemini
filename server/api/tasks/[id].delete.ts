import { deleteTask } from "../../utils/db";

export default defineEventHandler((event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  
  const id = getRouterParam(event, 'id');
  const success = deleteTask(id!, user.id);
  
  if (!success) {
    throw createError({
      statusCode: 404,
      statusMessage: "Task not found"
    });
  }
  
  setResponseStatus(event, 204);
  return null;
});
