import { updateTask } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  
  const updatedTask = updateTask(id!, user.id, body);
  
  if (!updatedTask) {
    throw createError({
      statusCode: 404,
      statusMessage: "Task not found"
    });
  }
  
  return updatedTask;
});
