"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

type VoteType = 'up' | 'down' | null;

interface TopicVotingButtonsProps {
  topicId: string;
  initialVotes: number;
  initialVoted: VoteType;
}

export default function TopicVotingButtons({
  topicId,
  initialVotes,
  initialVoted,
}: TopicVotingButtonsProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [voted, setVoted] = useState<VoteType>(initialVoted);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (voteType: VoteType) => {
    try {
      setIsLoading(true);
      
      // If user clicks the same vote type, remove their vote
      const newVoteType = voted === voteType ? null : voteType;
      
      // Optimistically update UI
      if (voted === 'up' && newVoteType === null) {
        setVotes(v => v - 1);
      } else if (voted === 'down' && newVoteType === null) {
        setVotes(v => v + 1);
      } else if (voted === null && newVoteType === 'up') {
        setVotes(v => v + 1);
      } else if (voted === null && newVoteType === 'down') {
        setVotes(v => v - 1);
      } else if (voted === 'up' && newVoteType === 'down') {
        setVotes(v => v - 2);
      } else if (voted === 'down' && newVoteType === 'up') {
        setVotes(v => v + 2);
      }
      
      setVoted(newVoteType);
      
      // Make API call to update vote in database
      const response = await fetch(`/api/topics/${topicId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType: newVoteType }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Oy verme işlemi başarısız oldu');
      }
      
      // Update with actual value from server
      setVotes(data.votes);
      setVoted(data.userVote);
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu, lütfen tekrar deneyin.");
      // Revert optimistic updates
      setVotes(initialVotes);
      setVoted(initialVoted);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center mr-4">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-full transition-colors",
          voted === 'up' ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20" : "text-gray-500",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
        disabled={isLoading}
        onClick={() => handleVote('up')}
        aria-label="Upvote"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
      
      <span className={cn(
        "font-medium text-sm my-1",
        votes > 0 ? "text-blue-500" : votes < 0 ? "text-red-500" : "text-gray-500"
      )}>
        {votes}
      </span>
      
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-full transition-colors",
          voted === 'down' ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "text-gray-500",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
        disabled={isLoading}
        onClick={() => handleVote('down')}
        aria-label="Downvote"
      >
        <ArrowDown className="h-5 w-5" />
      </Button>
    </div>
  );
} 