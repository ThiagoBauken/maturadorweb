
import { CardDescription } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { MessageTemplateStats } from '../types';
import { ChartBarIcon, TrendingUpIcon } from 'lucide-react';

interface TemplatePerformanceProps {
  templates: MessageTemplateStats[];
}

export function TemplatePerformanceSection({ templates }: TemplatePerformanceProps) {
  // Format data for the chart
  const chartData = templates.map(template => {
    // Truncate long template content
    const displayContent = template.content.length > 25
      ? template.content.substring(0, 25) + '...'
      : template.content;
    
    return {
      name: displayContent,
      deliveryRate: Math.round(template.deliveryRate * 100),
      readRate: Math.round(template.readRate * 100),
      responseRate: Math.round(template.responseRate * 100),
    };
  });

  const chartConfig = {
    deliveryRate: {
      label: "Delivery Rate",
      color: "#10b981" // green
    },
    readRate: {
      label: "Read Rate",
      color: "#3b82f6" // blue
    },
    responseRate: {
      label: "Response Rate", 
      color: "#8b5cf6" // purple
    }
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-2">
        <ChartBarIcon className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Top Performing Templates</h3>
        <CardDescription className="ml-auto flex items-center gap-1">
          <TrendingUpIcon className="h-4 w-4" />
          Based on delivery and response rates
        </CardDescription>
      </div>
      
      {templates.length > 0 ? (
        <div className="h-80 w-full">
          <ChartContainer
            config={chartConfig}
            className="h-full w-full"
          >
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <ChartTooltip
                content={({ active, payload, label }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    label={label}
                    formatter={(value) => `${value}%`}
                  />
                )}
              />
              <Legend />
              <Bar dataKey="deliveryRate" fill={chartConfig.deliveryRate.color} name="Delivery Rate" />
              <Bar dataKey="readRate" fill={chartConfig.readRate.color} name="Read Rate" />
              <Bar dataKey="responseRate" fill={chartConfig.responseRate.color} name="Response Rate" />
            </BarChart>
          </ChartContainer>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-md bg-muted/50">
          <p className="text-muted-foreground">
            Not enough data yet. Template statistics will appear here after more messages are sent.
          </p>
        </div>
      )}
    </div>
  );
}
