import { v4 as uuidv4 } from "uuid";
import { addTask } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  
  const body = await readBody(event);
  const { title, description, status, priority } = body;
  
  const newTask = {
    id: uuidv4(),
    userId: user.id,
    title,
    description: description || "",
    status: status || "todo",
    priority: priority || "medium",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  addTask(newTask);
  setResponseStatus(event, 201);
  return newTask;
});
