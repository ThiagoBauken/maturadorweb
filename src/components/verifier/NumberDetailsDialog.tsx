
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VerificationData } from "./types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NumberIntelligence } from "./NumberIntelligence";
import { Button } from "@/components/ui/button";
import { Flame, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useVerifiedNumbersTransfer } from "./hooks/useVerifiedNumbersTransfer";

interface NumberDetailsDialogProps {
  number: VerificationData | null;
  isOpen: boolean;
  onClose: () => void;
  onSendToVerification?: (number: VerificationData) => void;
  onTransferToBulkSender?: (number: VerificationData) => void;
  onTransferToWarmer?: (number: VerificationData) => void;
}

export function NumberDetailsDialog({
  number,
  isOpen,
  onClose,
  onSendToVerification,
  onTransferToBulkSender,
  onTransferToWarmer,
}: NumberDetailsDialogProps) {
  const navigate = useNavigate();
  const { saveNumbersForTransfer } = useVerifiedNumbersTransfer();

  if (!number) return null;

  const createWarmer = () => {
    if (number.status !== "valid") {
      toast.error("Only valid numbers can be used for warming");
      return;
    }

    if (saveNumbersForTransfer([number], "warmer")) {
      navigate("/warmers/standard?from=verifier&name=Single+Number+Warmer");
    }
  };

  const sendMessage = () => {
    if (number.status !== "valid") {
      toast.error("Only valid numbers can be used for messaging");
      return;
    }

    if (saveNumbersForTransfer([number], "bulk sender")) {
      navigate("/bulk-sender?from=verifier");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge variant="success">Valid</Badge>;
      case "invalid":
        return <Badge variant="destructive">Invalid</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleTransferToWarmer = () => {
    if (onTransferToWarmer) {
      onTransferToWarmer(number);
    }
    
    // Save to localStorage for warmer
    saveNumbersForTransfer([number], 'warmer');
    
    toast.success('Number prepared for transfer to Warmer');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Number Details</span>
            {getStatusBadge(number.status)}
          </DialogTitle>
          <DialogDescription>
            Detailed information about {number.phoneNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Basic Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Phone Number:</span>
                  <span className="font-medium">{number.phoneNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{number.name || "Not available"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Status:</span>
                  <span>{getStatusBadge(number.status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verification Date:</span>
                  <span className="font-medium">{number.verificationDate || "Not verified"}</span>
                </div>
              </div>
            </div>

            {number.status === "valid" && (
              <div className="flex flex-col justify-center space-y-3">
                <Button
                  onClick={createWarmer}
                  className="w-full"
                  variant="default"
                >
                  <span className="flex items-center">
                    <Flame className="mr-2 h-4 w-4" />
                    Create Warmer
                  </span>
                </Button>
                <Button
                  onClick={sendMessage}
                  className="w-full"
                  variant="outline"
                >
                  <span className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </span>
                </Button>
              </div>
            )}
          </div>

          <Tabs defaultValue="intelligence">
            <TabsList className="w-full">
              <TabsTrigger value="intelligence">Number Intelligence</TabsTrigger>
              <TabsTrigger value="history">Verification History</TabsTrigger>
            </TabsList>
            <TabsContent value="intelligence">
              <NumberIntelligence number={number} />
            </TabsContent>
            <TabsContent value="history">
              <div className="py-8 text-center text-muted-foreground">
                <p>Verification history will be available in future updates</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
