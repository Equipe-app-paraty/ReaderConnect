import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBookSchema, insertUserBookSchema, updateUserBookSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Books routes
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBook(Number(req.params.id));
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  // UserBooks routes
  app.get("/api/user-books", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userBooks = await storage.getUserBooks(req.user.id);
      res.json(userBooks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user books" });
    }
  });

  app.get("/api/user-books/:status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const status = req.params.status;
    if (!["reading", "want_to_read", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    try {
      const userBooks = await storage.getUserBooksByStatus(req.user.id, status);
      res.json(userBooks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user books" });
    }
  });

  app.post("/api/user-books", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userBook = insertUserBookSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const savedUserBook = await storage.addUserBook(userBook);
      res.status(201).json(savedUserBook);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to add book to user" });
    }
  });

  app.patch("/api/user-books/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const updateData = updateUserBookSchema.parse(req.body);
      const updatedUserBook = await storage.updateUserBook(Number(req.params.id), updateData);
      
      if (!updatedUserBook) {
        return res.status(404).json({ message: "User book not found" });
      }
      
      res.json(updatedUserBook);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update user book" });
    }
  });

  app.delete("/api/user-books/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      await storage.removeUserBook(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove book from user" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
