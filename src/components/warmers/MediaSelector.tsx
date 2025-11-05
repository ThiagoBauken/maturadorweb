
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Image, Video, FileAudio, Sticker, Edit, X, Check } from 'lucide-react';

interface MediaFrequency {
  images: number;
  videos: number;
  audios: number;
  stickers: number;
}

interface MediaSelectorProps {
  enabled: boolean;
  onEnableChange: (enabled: boolean) => void;
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
  mediaFrequency: MediaFrequency;
  onMediaFrequencyChange: (type: string, value: number) => void;
  mediaPerConversation?: boolean;
  editable?: boolean;
}

export function MediaSelector({
  enabled,
  onEnableChange,
  selectedTypes,
  onTypeChange,
  mediaFrequency,
  onMediaFrequencyChange,
  mediaPerConversation = false,
  editable = false
}: MediaSelectorProps) {
  const [editingFrequency, setEditingFrequency] = useState<{[key: string]: boolean}>({
    images: false,
    videos: false,
    audios: false,
    stickers: false
  });
  
  const [tempValues, setTempValues] = useState<{[key: string]: string}>({
    images: mediaFrequency.images.toString(),
    videos: mediaFrequency.videos.toString(),
    audios: mediaFrequency.audios.toString(),
    stickers: mediaFrequency.stickers.toString()
  });

  const toggleMediaType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  const startEditing = (type: string) => {
    if (!editable) return;
    
    setEditingFrequency(prev => ({
      ...prev,
      [type]: true
    }));
    setTempValues(prev => ({
      ...prev,
      [type]: mediaFrequency[type as keyof MediaFrequency].toString()
    }));
  };

  const saveEditing = (type: string) => {
    const value = parseInt(tempValues[type]);
    if (!isNaN(value) && value >= 0 && value <= 10) {
      onMediaFrequencyChange(type, value);
    } else {
      // Reset to current value if invalid
      setTempValues(prev => ({
        ...prev,
        [type]: mediaFrequency[type as keyof MediaFrequency].toString()
      }));
    }
    
    setEditingFrequency(prev => ({
      ...prev,
      [type]: false
    }));
  };

  const handleInputChange = (type: string, value: string) => {
    setTempValues(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="font-medium">Anexos de Mídia</Label>
        <Switch 
          checked={enabled} 
          onCheckedChange={onEnableChange}
        />
      </div>
      
      {enabled && (
        <>
          <div className="space-y-3">
            <Label>Tipos de Mídia</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={selectedTypes.includes('image') ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMediaType('image')}
                className="flex items-center gap-1"
              >
                <Image className="h-4 w-4" />
                Imagens
              </Button>
              <Button
                type="button"
                variant={selectedTypes.includes('video') ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMediaType('video')}
                className="flex items-center gap-1"
              >
                <Video className="h-4 w-4" />
                Vídeos
              </Button>
              <Button
                type="button"
                variant={selectedTypes.includes('audio') ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMediaType('audio')}
                className="flex items-center gap-1"
              >
                <FileAudio className="h-4 w-4" />
                Áudios
              </Button>
              <Button
                type="button"
                variant={selectedTypes.includes('sticker') ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMediaType('sticker')}
                className="flex items-center gap-1"
              >
                <Sticker className="h-4 w-4" />
                Figurinhas
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Frequência de {mediaPerConversation ? 'Mídia por Conversa' : 'Mídia'}</Label>
            <p className="text-sm text-muted-foreground">
              {mediaPerConversation 
                ? 'Define quantas vezes cada tipo de mídia será incluído nas conversas' 
                : 'Define com que frequência cada tipo de mídia será incluído nas mensagens'}
            </p>
            
            {selectedTypes.includes('image') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="image-frequency" className="flex items-center gap-1">
                    <Image className="h-4 w-4" /> Imagens{mediaPerConversation ? ' por conversa' : ''}
                  </Label>
                  {editable ? (
                    editingFrequency.images ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={tempValues.images}
                          onChange={(e) => handleInputChange('images', e.target.value)}
                          className="w-16 h-8"
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => saveEditing('images')}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">[{mediaFrequency.images}]</Badge>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => startEditing('images')}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  ) : (
                    <Badge variant="outline">[{mediaFrequency.images}]</Badge>
                  )}
                </div>
                {!editingFrequency.images && (
                  <Slider 
                    id="image-frequency"
                    min={0}
                    max={10}
                    step={1}
                    value={[mediaFrequency.images]}
                    onValueChange={([value]) => onMediaFrequencyChange('images', value)}
                  />
                )}
              </div>
            )}
            
            {selectedTypes.includes('video') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="video-frequency" className="flex items-center gap-1">
                    <Video className="h-4 w-4" /> Vídeos{mediaPerConversation ? ' por conversa' : ''}
                  </Label>
                  {editable ? (
                    editingFrequency.videos ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={tempValues.videos}
                          onChange={(e) => handleInputChange('videos', e.target.value)}
                          className="w-16 h-8"
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => saveEditing('videos')}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">[{mediaFrequency.videos}]</Badge>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => startEditing('videos')}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  ) : (
                    <Badge variant="outline">[{mediaFrequency.videos}]</Badge>
                  )}
                </div>
                {!editingFrequency.videos && (
                  <Slider 
                    id="video-frequency"
                    min={0}
                    max={10}
                    step={1}
                    value={[mediaFrequency.videos]}
                    onValueChange={([value]) => onMediaFrequencyChange('videos', value)}
                  />
                )}
              </div>
            )}
            
            {selectedTypes.includes('audio') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="audio-frequency" className="flex items-center gap-1">
                    <FileAudio className="h-4 w-4" /> Áudios{mediaPerConversation ? ' por conversa' : ''}
                  </Label>
                  {editable ? (
                    editingFrequency.audios ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={tempValues.audios}
                          onChange={(e) => handleInputChange('audios', e.target.value)}
                          className="w-16 h-8"
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => saveEditing('audios')}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">[{mediaFrequency.audios}]</Badge>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => startEditing('audios')}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  ) : (
                    <Badge variant="outline">[{mediaFrequency.audios}]</Badge>
                  )}
                </div>
                {!editingFrequency.audios && (
                  <Slider 
                    id="audio-frequency"
                    min={0}
                    max={10}
                    step={1}
                    value={[mediaFrequency.audios]}
                    onValueChange={([value]) => onMediaFrequencyChange('audios', value)}
                  />
                )}
              </div>
            )}
            
            {selectedTypes.includes('sticker') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="sticker-frequency" className="flex items-center gap-1">
                    <Sticker className="h-4 w-4" /> Figurinhas{mediaPerConversation ? ' por conversa' : ''}
                  </Label>
                  {editable ? (
                    editingFrequency.stickers ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={tempValues.stickers}
                          onChange={(e) => handleInputChange('stickers', e.target.value)}
                          className="w-16 h-8"
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => saveEditing('stickers')}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">[{mediaFrequency.stickers}]</Badge>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => startEditing('stickers')}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  ) : (
                    <Badge variant="outline">[{mediaFrequency.stickers}]</Badge>
                  )}
                </div>
                {!editingFrequency.stickers && (
                  <Slider 
                    id="sticker-frequency"
                    min={0}
                    max={10}
                    step={1}
                    value={[mediaFrequency.stickers]}
                    onValueChange={([value]) => onMediaFrequencyChange('stickers', value)}
                  />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
