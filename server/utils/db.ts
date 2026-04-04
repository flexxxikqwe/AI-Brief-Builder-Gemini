import bcrypt from "bcryptjs";

export const users = [
  {
    id: "1",
    username: "admin",
    password: bcrypt.hashSync("password", 10),
    email: "admin@example.com"
  }
];

export let tasks = [
  {
    id: "1",
    userId: "1",
    title: "Complete hiring task",
    description: "Implement Nuxt 3 and Express full-stack application",
    status: "in-progress",
    priority: "high",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    userId: "1",
    title: "Review documentation",
    description: "Read Nuxt 3 and Pinia documentation for best practices",
    status: "todo",
    priority: "medium",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function addTask(task: any) {
  tasks.push(task);
}

export function updateTask(id: string, userId: string, updates: any) {
  const index = tasks.findIndex(t => t.id === id && t.userId === userId);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
    return tasks[index];
  }
  return null;
}

export function deleteTask(id: string, userId: string) {
  const initialLength = tasks.length;
  tasks = tasks.filter(t => t.id !== id || t.userId !== userId);
  return tasks.length < initialLength;
}
