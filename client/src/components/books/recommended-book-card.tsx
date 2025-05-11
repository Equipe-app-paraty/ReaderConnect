import { Book } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface RecommendedBookCardProps {
  book: Book;
}

export default function RecommendedBookCard({ book }: RecommendedBookCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const addToWantToRead = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/user-books", {
        bookId: book.id,
        status: "want_to_read",
        currentPage: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-books/want_to_read"] });
      toast({
        title: "Book added",
        description: `${book.title} has been added to your want to read list.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add book",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  if (!user) return null;
  
  const handleAddToWantToRead = () => {
    addToWantToRead.mutate();
  };
  
  // Helper function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`star-${i}`} className="ri-star-fill"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half-star" className="ri-star-half-fill"></i>);
    }
    
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<i key={`empty-${i}`} className="ri-star-line"></i>);
    }
    
    return stars;
  };
  
  return (
    <div className="book-card bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover">
      <div className="p-4 flex">
        <div className="w-24 h-36 flex-shrink-0 rounded overflow-hidden">
          <img 
            src={book.coverImage} 
            alt={`${book.title} by ${book.author}`} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="font-medium text-primary-dark">{book.title}</h3>
          <p className="text-sm text-primary-light mb-2">{book.author}</p>
          <div className="flex items-center mb-2">
            <div className="flex text-secondary">
              {book.rating && renderStars(book.rating)}
            </div>
            <span className="text-xs text-primary-light ml-1">{book.rating}</span>
          </div>
          <p className="text-xs text-primary-light line-clamp-3">{book.description}</p>
        </div>
      </div>
      <div className="border-t border-neutral-light px-4 py-3 flex justify-between">
        <button 
          className="text-secondary hover:bg-neutral-lightest rounded-full p-1.5 transition-colors" 
          title="Add to Want to Read"
          onClick={handleAddToWantToRead}
          disabled={addToWantToRead.isPending}
        >
          {addToWantToRead.isPending ? (
            <i className="ri-loader-line text-lg animate-spin"></i>
          ) : (
            <i className="ri-add-line text-lg"></i>
          )}
        </button>
        <button className="text-white bg-secondary hover:bg-secondary-light rounded-lg text-sm px-3 py-1 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}
