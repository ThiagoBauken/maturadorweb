
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash, Save } from 'lucide-react';
import { MessageDraft } from '../../types';

interface MessagePreviewProps {
  activeTab: string;
  messageText: string;
  messageTemplates: string[];
  showSavedDrafts: boolean;
  savedMessageDrafts: MessageDraft[];
  activeDraftId: string | null;
  handleLoadDraft: () => void;
  handleDeleteDraft: (e: React.MouseEvent) => void;
  saveMessageDraft: () => void;
}

export function MessagePreview({
  activeTab,
  messageText,
  messageTemplates,
  showSavedDrafts,
  savedMessageDrafts,
  activeDraftId,
  handleLoadDraft,
  handleDeleteDraft,
  saveMessageDraft
}: MessagePreviewProps) {
  return (
    <div>
      <div className="bg-muted rounded-lg p-4 border">
        <div className="bg-background rounded-lg p-3 max-w-[85%] ml-auto shadow-sm border">
          {activeTab === 'basic' ? (
            messageText ? (
              <p className="text-sm whitespace-pre-wrap">{messageText}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Your message will appear here...</p>
            )
          ) : (
            messageTemplates.length > 0 && messageTemplates[0] ? (
              <p className="text-sm whitespace-pre-wrap">{messageTemplates[0]}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Your message template will appear here...</p>
            )
          )}
        </div>
      </div>
      
      {showSavedDrafts && savedMessageDrafts.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Saved Drafts</h3>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {savedMessageDrafts.map(draft => (
                <div 
                  key={draft.id} 
                  className={`p-2 rounded-md border cursor-pointer hover:bg-muted transition-colors ${draft.id === activeDraftId ? 'border-primary bg-primary/5' : ''}`}
                  onClick={handleLoadDraft}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">{draft.name || 'Untitled Draft'}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteDraft}
                      className="h-6 w-6 p-0 text-muted-foreground"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {draft.messageTemplates[0]?.substring(0, 50) || 'Empty draft'}
                    {draft.messageTemplates[0]?.length > 50 ? '...' : ''}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-muted px-1 rounded">
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </span>
                    {draft.messageTemplates.length > 1 && (
                      <span className="text-xs bg-muted px-1 rounded">
                        {draft.messageTemplates.length} templates
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {showSavedDrafts && savedMessageDrafts.length === 0 && (
        <div className="mt-4 p-4 border border-dashed rounded-md text-center">
          <p className="text-sm text-muted-foreground">No saved drafts yet.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={saveMessageDraft} 
            className="mt-2"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Current as Draft
          </Button>
        </div>
      )}
    </div>
  );
}
