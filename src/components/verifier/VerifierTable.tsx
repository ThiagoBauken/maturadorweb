
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Flame, Send, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { VerificationData } from './types';
import { NumberDetailsDialog } from './NumberDetailsDialog';
import { useVerifiedNumbersTransfer } from './hooks/useVerifiedNumbersTransfer';
import { usePhoneNumberFormatter } from '@/pages/dashboard/BulkSender/hooks/recipient/usePhoneNumberFormatter';

interface VerifierTableProps {
  data: VerificationData[];
  filter: 'all' | 'valid' | 'invalid' | 'pending';
}

export function VerifierTable({ data, filter }: VerifierTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<VerificationData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const navigate = useNavigate();
  const { saveNumbersForTransfer } = useVerifiedNumbersTransfer();
  const { formatPhoneNumber } = usePhoneNumberFormatter();
  
  // Apply filter
  const filteredData = filter === 'all' 
    ? data 
    : data.filter(item => item.status === filter);
  
  const handleSelectAllRows = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredData.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };
  
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id]);
    } else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id));
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge variant="success">Valid</Badge>;
      case 'invalid':
        return <Badge variant="destructive">Invalid</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handleCreateWarmer = () => {
    const selectedData = data.filter(item => selectedRows.includes(item.id));
    if (selectedData.length === 0) {
      toast.error('Please select at least one valid number');
      return;
    }
    
    // Format phone numbers before saving
    const formattedData = selectedData.map(item => ({
      ...item,
      phoneNumber: formatPhoneNumber(item.phoneNumber)
    }));
    
    // Use the hook for transferring numbers
    if (saveNumbersForTransfer(formattedData, 'warmer')) {
      navigate('/warmers/standard?from=verifier&name=Selected+Numbers+Warmer');
      toast.success(`Creating warmer with ${formattedData.length} selected numbers`);
    }
  };
  
  const handleSendMessages = () => {
    const selectedData = data.filter(item => selectedRows.includes(item.id));
    if (selectedData.length === 0) {
      toast.error('Please select at least one valid number');
      return;
    }
    
    // Format phone numbers before saving
    const formattedData = selectedData.map(item => ({
      ...item,
      phoneNumber: formatPhoneNumber(item.phoneNumber)
    }));
    
    // Use the hook for transferring numbers
    if (saveNumbersForTransfer(formattedData, 'bulk sender')) {
      navigate('/bulk-sender?from=verifier');
      toast.success(`Prepared ${formattedData.length} selected numbers for bulk sending`);
    }
  };
  
  const handleViewDetails = (number: VerificationData) => {
    setSelectedNumber(number);
    setIsDetailsOpen(true);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center pb-4">
        <div className="text-sm text-muted-foreground">
          {selectedRows.length > 0 ? `${selectedRows.length} numbers selected` : ''}
        </div>
        
        {selectedRows.length > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSendMessages}
              className="flex items-center gap-2"
              size="sm"
            >
              <span className="flex items-center">
                <Send className="h-4 w-4 mr-2" />
                Send Messages
              </span>
            </Button>
            <Button 
              onClick={handleCreateWarmer} 
              className="flex items-center gap-2"
              size="sm"
            >
              <span className="flex items-center">
                <Flame className="h-4 w-4 mr-2" />
                Create Warmer
              </span>
            </Button>
          </div>
        )}
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={filteredData.length > 0 && selectedRows.length === filteredData.length} 
                onCheckedChange={handleSelectAllRows}
                aria-label="Select all rows"
              />
            </TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verification Date</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                No verification data available
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedRows.includes(item.id)} 
                    onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)}
                    aria-label={`Select row ${item.id}`}
                  />
                </TableCell>
                <TableCell>{formatPhoneNumber(item.phoneNumber)}</TableCell>
                <TableCell>{item.name || '-'}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>{item.verificationDate || '-'}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleViewDetails(item)}
                  >
                    <Info className="h-4 w-4" />
                    <span className="sr-only">View details</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <NumberDetailsDialog 
        number={selectedNumber} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
      />
    </div>
  );
}
