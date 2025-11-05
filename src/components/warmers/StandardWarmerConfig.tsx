
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Image, MessageSquare, Video, FileAudio, Sticker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface MediaFrequency {
  images: number;
  videos: number;
  audios: number;
  stickers: number;
}

interface StandardWarmerConfigProps {
  targetCount: number | null;
  onTargetCountChange: (count: number | null) => void;
  useEmojis: boolean;
  onUseEmojisChange: (value: boolean) => void;
  mediaEnabled?: boolean;
  onMediaEnabledChange?: (value: boolean) => void;
  mediaTypes?: string[];
  onMediaTypesChange?: (types: string[]) => void;
  mediaFrequency?: MediaFrequency;
  onMediaFrequencyChange?: (type: string, value: number) => void;
  aiEnabled?: boolean;
  onAiEnabledChange?: (value: boolean) => void;
  aiProvider?: string;
  onAiProviderChange?: (provider: string) => void;
  aiReplyPercentage?: number;
  onAiReplyPercentageChange?: (value: number) => void;
}

export function StandardWarmerConfig({
  targetCount,
  onTargetCountChange,
  useEmojis,
  onUseEmojisChange,
  mediaEnabled = false,
  onMediaEnabledChange = () => {},
  mediaTypes = ['image', 'sticker'],
  onMediaTypesChange = () => {},
  mediaFrequency = { images: 2, videos: 1, audios: 1, stickers: 3 },
  onMediaFrequencyChange = () => {},
  aiEnabled = false,
  onAiEnabledChange = () => {},
  aiProvider = 'deepseek',
  onAiProviderChange = () => {},
  aiReplyPercentage = 60,
  onAiReplyPercentageChange = () => {}
}: StandardWarmerConfigProps) {
  const toggleMediaType = (type: string) => {
    if (mediaTypes.includes(type)) {
      onMediaTypesChange(mediaTypes.filter(t => t !== type));
    } else {
      onMediaTypesChange([...mediaTypes, type]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Standard Warmer Settings</CardTitle>
        <CardDescription>
          Pre-configured warmer with best practices for WhatsApp account safety
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="target-count">Total de Mensagens por Número (Opcional)</Label>
            <div className="text-xs text-muted-foreground">
              Deixe em branco para warming contínuo
            </div>
          </div>
          <Input
            id="target-count"
            type="number"
            min={5}
            max={500}
            value={targetCount !== null ? targetCount : ''}
            onChange={(e) => {
              const value = e.target.value === '' ? null : parseInt(e.target.value);
              onTargetCountChange(value);
            }}
            placeholder="Sem limite"
          />
          <p className="text-sm text-muted-foreground">
            Quantas mensagens enviar para cada número durante o processo de warming. O warming continua indefinidamente se nenhum valor for definido.
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">Comportamento de Mensagens</h3>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="use-emojis"
              checked={useEmojis}
              onCheckedChange={(checked) => onUseEmojisChange(!!checked)}
            />
            <Label htmlFor="use-emojis" className="font-normal cursor-pointer">
              Usar emojis aleatórios nas mensagens
            </Label>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Anexos de Mídia</h3>
            <Switch 
              checked={mediaEnabled}
              onCheckedChange={onMediaEnabledChange}
              id="media-toggle"
            />
          </div>
          
          {mediaEnabled && (
            <>
              <div className="space-y-3">
                <Label>Tipos de Mídia</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={mediaTypes.includes('image') ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleMediaType('image')}
                    className="flex items-center gap-1"
                  >
                    <Image className="h-4 w-4" />
                    Imagens
                  </Button>
                  <Button
                    type="button"
                    variant={mediaTypes.includes('video') ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleMediaType('video')}
                    className="flex items-center gap-1"
                  >
                    <Video className="h-4 w-4" />
                    Vídeos
                  </Button>
                  <Button
                    type="button"
                    variant={mediaTypes.includes('audio') ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleMediaType('audio')}
                    className="flex items-center gap-1"
                  >
                    <FileAudio className="h-4 w-4" />
                    Áudios
                  </Button>
                  <Button
                    type="button"
                    variant={mediaTypes.includes('sticker') ? "default" : "outline"}
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
                <Label>Frequência de Mídia por Conversa</Label>
                <p className="text-sm text-muted-foreground">
                  Define quantas vezes cada tipo de mídia será incluído nas conversas
                </p>
                
                {mediaTypes.includes('image') && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="image-frequency" className="flex items-center gap-1">
                        <Image className="h-4 w-4" /> Imagens por conversa
                      </Label>
                      <Badge variant="outline">[{mediaFrequency.images}]</Badge>
                    </div>
                    <Slider 
                      id="image-frequency"
                      min={0}
                      max={10}
                      step={1}
                      value={[mediaFrequency.images]}
                      onValueChange={([value]) => onMediaFrequencyChange('images', value)}
                    />
                  </div>
                )}
                
                {mediaTypes.includes('video') && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="video-frequency" className="flex items-center gap-1">
                        <Video className="h-4 w-4" /> Vídeos por conversa
                      </Label>
                      <Badge variant="outline">[{mediaFrequency.videos}]</Badge>
                    </div>
                    <Slider 
                      id="video-frequency"
                      min={0}
                      max={10}
                      step={1}
                      value={[mediaFrequency.videos]}
                      onValueChange={([value]) => onMediaFrequencyChange('videos', value)}
                    />
                  </div>
                )}
                
                {mediaTypes.includes('audio') && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="audio-frequency" className="flex items-center gap-1">
                        <FileAudio className="h-4 w-4" /> Áudios por conversa
                      </Label>
                      <Badge variant="outline">[{mediaFrequency.audios}]</Badge>
                    </div>
                    <Slider 
                      id="audio-frequency"
                      min={0}
                      max={10}
                      step={1}
                      value={[mediaFrequency.audios]}
                      onValueChange={([value]) => onMediaFrequencyChange('audios', value)}
                    />
                  </div>
                )}
                
                {mediaTypes.includes('sticker') && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="sticker-frequency" className="flex items-center gap-1">
                        <Sticker className="h-4 w-4" /> Figurinhas por conversa
                      </Label>
                      <Badge variant="outline">[{mediaFrequency.stickers}]</Badge>
                    </div>
                    <Slider 
                      id="sticker-frequency"
                      min={0}
                      max={10}
                      step={1}
                      value={[mediaFrequency.stickers]}
                      onValueChange={([value]) => onMediaFrequencyChange('stickers', value)}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
