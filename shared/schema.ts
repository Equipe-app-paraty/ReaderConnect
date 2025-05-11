import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  profilePicture: text("profile_picture").default("https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  coverImage: text("cover_image").notNull(),
  totalPages: integer("total_pages").notNull(),
  description: text("description"),
  rating: integer("rating"),
});

export const userBooks = pgTable("user_books", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bookId: integer("book_id").notNull().references(() => books.id),
  status: text("status").notNull(), // "reading", "want_to_read", "completed"
  currentPage: integer("current_page").default(0),
  dateAdded: timestamp("date_added").defaultNow(),
  dateCompleted: timestamp("date_completed"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertBookSchema = createInsertSchema(books);

export const insertUserBookSchema = createInsertSchema(userBooks).pick({
  userId: true,
  bookId: true,
  status: true,
  currentPage: true,
});

export const updateUserBookSchema = z.object({
  currentPage: z.number().min(0).optional(),
  status: z.enum(["reading", "want_to_read", "completed"]).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type Book = typeof books.$inferSelect;
export type UserBook = typeof userBooks.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type InsertUserBook = z.infer<typeof insertUserBookSchema>;
export type UpdateUserBook = z.infer<typeof updateUserBookSchema>;
