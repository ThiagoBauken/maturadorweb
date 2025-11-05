
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessedData } from './FileProcessor';
import { ChevronLeft, ChevronRight, Search, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  data: ProcessedData;
  maxRows?: number;
  includeSearch?: boolean;
  onExport?: () => void;
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  data,
  maxRows = 5,
  includeSearch = true,
  onExport,
  className
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: fileData, columns, fileName } = data;
  
  // Filter data based on search term
  const filteredData = searchTerm 
    ? fileData.filter(row => 
        Object.values(row).some(
          value => 
            value && 
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : fileData;
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / maxRows);
  const startIndex = (currentPage - 1) * maxRows;
  const displayData = filteredData.slice(startIndex, startIndex + maxRows);
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg truncate max-w-[200px] md:max-w-md">
              {fileName}
            </CardTitle>
          </div>
          <div className="text-xs text-muted-foreground">
            {fileData.length} records
          </div>
        </div>
        
        {includeSearch && (
          <div className="flex mt-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8"
              />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index} className="truncate max-w-[150px]">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length > 0 ? (
                displayData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <TableCell 
                        key={`${rowIndex}-${colIndex}`}
                        className="truncate max-w-[150px]"
                      >
                        {row[column] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length} 
                    className="text-center py-6 text-muted-foreground"
                  >
                    {searchTerm ? 'No matching records found' : 'No data available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {onExport && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onExport}
            className="ml-auto"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
