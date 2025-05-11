import { Book, UserBook } from "@shared/schema";
import { formatDistance } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReadingBookCardProps {
  userBook: UserBook & { book: Book };
}

export default function ReadingBookCard({ userBook }: ReadingBookCardProps) {
  const { toast } = useToast();
  const { book, currentPage } = userBook;
  
  const progressPercentage = Math.round((currentPage / book.totalPages) * 100);
  
  const updateProgress = useMutation({
    mutationFn: async (newPage: number) => {
      await apiRequest("PATCH", `/api/user-books/${userBook.id}`, { 
        currentPage: newPage,
        status: newPage === book.totalPages ? "completed" : "reading"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-books/reading"] });
      if (currentPage === book.totalPages) {
        queryClient.invalidateQueries({ queryKey: ["/api/user-books/completed"] });
      }
      toast({
        title: "Progress updated",
        description: currentPage === book.totalPages 
          ? "Congratulations on finishing the book!" 
          : "Your reading progress has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update progress",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleContinueReading = () => {
    // In a real app, this would open the book reader
    // For now, just update progress by 10 pages or complete the book
    const newPage = Math.min(currentPage + 10, book.totalPages);
    updateProgress.mutate(newPage);
  };
  
  return (
    <div className="book-card bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={book.coverImage} 
          alt={`${book.title} by ${book.author}`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
          <div className="text-xs font-medium mb-1">
            Page {currentPage} of {book.totalPages}
          </div>
          <div className="reading-progress h-1.5 bg-neutral-light rounded-full overflow-hidden">
            <div 
              className="h-full bg-success rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-primary-dark mb-1">{book.title}</h3>
        <p className="text-sm text-primary-light mb-3">{book.author}</p>
        <div className="flex justify-between items-center">
          <button 
            className="text-secondary hover:bg-neutral-lightest rounded-full p-1.5 transition-colors" 
            title="Continue reading"
            onClick={handleContinueReading}
            disabled={updateProgress.isPending}
          >
            {updateProgress.isPending ? (
              <i className="ri-loader-line text-lg animate-spin"></i>
            ) : (
              <i className="ri-book-open-line text-lg"></i>
            )}
          </button>
          <span className="text-sm text-primary-light">{progressPercentage}% complete</span>
        </div>
      </div>
    </div>
  );
}
