import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useState } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SendingHistory, MessageResponse } from "../types";

interface ViewRepliesButtonProps {
  sendingId: string;
  sendingHistory: SendingHistory[];
}

export function ViewRepliesButton({ sendingId, sendingHistory }: ViewRepliesButtonProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "positive" | "negative">("all");
  
  // Find the current campaign in history
  const campaign = sendingHistory.find(item => item.id === sendingId);
  
  // Get replies from the campaign
  const getReplies = () => {
    if (!campaign || !campaign.messageResponses) {
      return [];
    }
    
    const replies = campaign.messageResponses || [];
    
    // Apply filter
    if (filter === "positive") {
      return replies.filter(reply => reply.sentiment === "positive");
    } else if (filter === "negative") {
      return replies.filter(reply => reply.sentiment === "negative");
    }
    
    return replies;
  };
  
  const replies = getReplies();
  const hasReplies = replies.length > 0;
  
  // Count replies by sentiment
  const positiveCount = campaign?.messageResponses?.filter(r => r.sentiment === "positive").length || 0;
  const negativeCount = campaign?.messageResponses?.filter(r => r.sentiment === "negative").length || 0;
  const neutralCount = campaign?.messageResponses?.filter(r => r.sentiment === "neutral").length || 0;
  const totalReplies = campaign?.messageResponses?.length || 0;
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 gap-1"
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        View Replies
        {totalReplies > 0 && (
          <Badge variant="secondary" className="ml-1">{totalReplies}</Badge>
        )}
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Replies</DialogTitle>
            <DialogDescription>
              View and analyze responses to your messages
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 text-green-700 border border-green-200 rounded-md p-3 text-center">
                <div className="flex justify-center mb-1"><ThumbsUp className="h-5 w-5" /></div>
                <p className="text-sm font-medium">Positive</p>
                <p className="text-2xl font-bold">{positiveCount}</p>
              </div>
              
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-md p-3 text-center">
                <div className="flex justify-center mb-1"><ThumbsDown className="h-5 w-5" /></div>
                <p className="text-sm font-medium">Negative</p>
                <p className="text-2xl font-bold">{negativeCount}</p>
              </div>
              
              <div className="bg-slate-50 text-slate-700 border border-slate-200 rounded-md p-3 text-center">
                <div className="flex justify-center mb-1"><MessageSquare className="h-5 w-5" /></div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{totalReplies}</p>
              </div>
            </div>
            
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="all">All Replies</TabsTrigger>
                  <TabsTrigger value="positive">Positive</TabsTrigger>
                  <TabsTrigger value="negative">Negative</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center text-xs text-muted-foreground">
                  <Filter className="h-3 w-3 mr-1" />
                  Filtered by {filter} sentiment
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <TabsContent value="all" className="mt-0">
                <RepliesList replies={replies} />
              </TabsContent>
              
              <TabsContent value="positive" className="mt-0">
                <RepliesList replies={replies} />
              </TabsContent>
              
              <TabsContent value="negative" className="mt-0">
                <RepliesList replies={replies} />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface RepliesListProps {
  replies: any[];
}

function RepliesList({ replies }: RepliesListProps) {
  if (replies.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No replies found with the current filter</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[350px] pr-4">
      <div className="space-y-4">
        {replies.map((reply, index) => (
          <div key={index} className="border rounded-md p-3">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium">{reply.phoneNumber}</div>
              <SentimentBadge sentiment={reply.sentiment} />
            </div>
            <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
            <div className="text-xs text-muted-foreground mt-2">
              {new Date(reply.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  if (sentiment === "positive") {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex gap-1 items-center">
        <ThumbsUp className="h-3 w-3" />
        Positive
      </Badge>
    );
  }
  
  if (sentiment === "negative") {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex gap-1 items-center">
        <ThumbsDown className="h-3 w-3" />
        Negative
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
      Neutral
    </Badge>
  );
}
