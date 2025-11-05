
import { CheckCircle, Send } from 'lucide-react';

interface ContextBannersProps {
  fromCampaign: boolean;
  fromVerifier: boolean;
}

export function ContextBanners({ fromCampaign, fromVerifier }: ContextBannersProps) {
  if (!fromCampaign && !fromVerifier) return null;
  
  return (
    <>
      {fromCampaign && (
        <div className="bg-muted p-4 rounded-lg mb-4">
          <h3 className="font-medium flex items-center">
            <Send className="h-4 w-4 mr-2" />
            Campaign Mode
          </h3>
          <p className="text-sm text-muted-foreground">
            You're sending a campaign using the bulk sender engine. The campaign settings have been imported.
          </p>
        </div>
      )}
      
      {fromVerifier && (
        <div className="bg-muted p-4 rounded-lg mb-4">
          <h3 className="font-medium flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Verified Numbers Imported
          </h3>
          <p className="text-sm text-muted-foreground">
            Verified numbers have been imported from the Verifier tool. You can now continue creating your message.
          </p>
        </div>
      )}
    </>
  );
}
