
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search } from 'lucide-react';

// Common country codes for WhatsApp
export const COMMON_COUNTRY_CODES = [
  { code: '+1', name: 'USA/Canada' },
  { code: '+44', name: 'UK' },
  { code: '+91', name: 'India' },
  { code: '+55', name: 'Brazil' },
  { code: '+52', name: 'Mexico' },
  { code: '+234', name: 'Nigeria' },
  { code: '+27', name: 'South Africa' },
  { code: '+62', name: 'Indonesia' },
  { code: '+966', name: 'Saudi Arabia' },
  { code: '+971', name: 'UAE' },
  { code: '+49', name: 'Germany' },
  { code: '+33', name: 'France' },
  { code: '+34', name: 'Spain' },
  { code: '+39', name: 'Italy' },
  { code: '+7', name: 'Russia' },
];

interface CountryCodeSelectorProps {
  selectedCountryCode: string;
  onCountryCodeChange: (value: string) => void;
  className?: string;
  labelId?: string;
}

export function CountryCodeSelector({ 
  selectedCountryCode, 
  onCountryCodeChange,
  className,
  labelId = "country-code" 
}: CountryCodeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCountryCodes = searchTerm
    ? COMMON_COUNTRY_CODES.filter(country => 
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        country.code.includes(searchTerm)
      )
    : COMMON_COUNTRY_CODES;
  
  return (
    <div className={className}>
      <Label htmlFor={labelId} className="mb-2 block">Default Country Code</Label>
      <Select 
        value={selectedCountryCode} 
        onValueChange={onCountryCodeChange}
      >
        <SelectTrigger id={labelId}>
          <SelectValue placeholder="Select country code" />
        </SelectTrigger>
        <SelectContent>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {filteredCountryCodes.map(country => (
            <SelectItem key={country.code} value={country.code}>
              {country.code} ({country.name})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
