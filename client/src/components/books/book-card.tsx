import { Book } from "@shared/schema";

interface BookCardProps {
  book: Book;
  onClick?: () => void;
}

export default function BookCard({ book, onClick }: BookCardProps) {
  return (
    <div 
      className="book-card bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="aspect-[2/3] overflow-hidden">
        <img 
          src={book.coverImage} 
          alt={`${book.title} by ${book.author}`} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="font-medium text-primary-dark text-sm truncate">{book.title}</h3>
        <p className="text-xs text-primary-light truncate">{book.author}</p>
      </div>
    </div>
  );
}
