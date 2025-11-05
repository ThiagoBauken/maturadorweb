
import { Search, Filter, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScheduleManager } from '@/components/common/schedule';
import { Day } from '@/components/common/schedule/WeekdaySelector';
import { TimeRange } from '@/components/common/schedule/TimeRangePicker';

interface CampaignFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function CampaignFilters({ searchQuery, setSearchQuery }: CampaignFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [scheduleFilter, setScheduleFilter] = useState({
    days: [] as Day[],
    timeRanges: [] as TimeRange[],
  });
  
  return (
    <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search campaigns..."
          className="pl-8 md:w-[200px] lg:w-[300px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Popover open={showFilters} onOpenChange={setShowFilters}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Filter Campaigns</h4>
              <p className="text-sm text-muted-foreground">
                Select the criteria to filter campaigns
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="active" />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="paused" />
                    <Label htmlFor="paused">Paused</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="completed" />
                    <Label htmlFor="completed">Completed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="draft" />
                    <Label htmlFor="draft">Draft</Label>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="block">Schedule</Label>
                <ScheduleManager 
                  value={scheduleFilter}
                  onChange={setScheduleFilter}
                  className="border-none"
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => {
                    setScheduleFilter({ days: [], timeRanges: [] });
                    setShowFilters(false);
                  }}
                >
                  Reset
                </Button>
                <Button size="sm" onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
