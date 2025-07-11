import { useState, useCallback } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { ComponentConfig } from "@/types";
import { useDragDrop } from "@/hooks/use-drag-drop";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  List, 
  ArrowUpDown, 
  Wallet, 
  PieChart,
  Settings,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

interface DragDropBuilderProps {
  components: ComponentConfig[];
  onComponentsChange: (components: ComponentConfig[]) => void;
  previewMode: 'desktop' | 'mobile';
}

export default function DragDropBuilder({ 
  components, 
  onComponentsChange, 
  previewMode 
}: DragDropBuilderProps) {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<ComponentConfig | null>(null);
  
  const { sensors, handleDragStart, handleDragEnd } = useDragDrop({
    onDragEnd: (event: DragEndEvent) => {
      const { active, over } = event;
      
      if (over && active.id !== over.id) {
        const oldIndex = components.findIndex(c => c.id === active.id);
        const newIndex = components.findIndex(c => c.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newComponents = arrayMove(components, oldIndex, newIndex);
          onComponentsChange(newComponents);
        }
      }
      
      setDraggedComponent(null);
    },
    onDragStart: (event: DragStartEvent) => {
      const component = components.find(c => c.id === event.active.id);
      setDraggedComponent(component || null);
    }
  });

  const handleRemoveComponent = useCallback((id: string) => {
    const newComponents = components.filter(c => c.id !== id);
    onComponentsChange(newComponents);
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  }, [components, onComponentsChange, selectedComponent]);

  const handleToggleVisibility = useCallback((id: string) => {
    const newComponents = components.map(c => 
      c.id === id 
        ? { ...c, settings: { ...c.settings, hidden: !c.settings.hidden } }
        : c
    );
    onComponentsChange(newComponents);
  }, [components, onComponentsChange]);

  const handleUpdateSettings = useCallback((id: string, settings: Record<string, any>) => {
    const newComponents = components.map(c => 
      c.id === id 
        ? { ...c, settings: { ...c.settings, ...settings } }
        : c
    );
    onComponentsChange(newComponents);
  }, [components, onComponentsChange]);

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'tradingview-chart':
        return <BarChart3 className="w-5 h-5" />;
      case 'orderbook':
        return <List className="w-5 h-5" />;
      case 'trade-form':
        return <ArrowUpDown className="w-5 h-5" />;
      case 'portfolio':
        return <Wallet className="w-5 h-5" />;
      case 'market-data':
        return <PieChart className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getComponentColor = (type: string) => {
    switch (type) {
      case 'tradingview-chart':
        return 'border-liquid-green bg-liquid-green/10';
      case 'orderbook':
        return 'border-blue-500 bg-blue-500/10';
      case 'trade-form':
        return 'border-purple-500 bg-purple-500/10';
      case 'portfolio':
        return 'border-orange-500 bg-orange-500/10';
      case 'market-data':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const renderComponent = (component: ComponentConfig) => {
    const isSelected = selectedComponent === component.id;
    const isHidden = component.settings.hidden;
    const colorClasses = getComponentColor(component.type);
    
    return (
      <Card 
        key={component.id}
        className={`relative border-2 border-dashed cursor-pointer transition-all ${colorClasses} ${
          isSelected ? 'ring-2 ring-liquid-green' : ''
        } ${isHidden ? 'opacity-50' : ''}`}
        onClick={() => setSelectedComponent(component.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getComponentIcon(component.type)}
              <span className="text-sm font-medium">{component.type.replace('-', ' ')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleVisibility(component.id);
                }}
                className="h-6 w-6 p-0"
              >
                {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveComponent(component.id);
                }}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <div className="text-xs">
              {component.type === 'tradingview-chart' && 'TradingView Chart Widget'}
              {component.type === 'orderbook' && 'Live Order Book'}
              {component.type === 'trade-form' && 'Buy/Sell Interface'}
              {component.type === 'portfolio' && 'Portfolio Overview'}
              {component.type === 'market-data' && 'Market Data Display'}
            </div>
          </div>
          
          {component.settings.symbol && (
            <Badge variant="secondary" className="mt-2">
              {component.settings.symbol}
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={`bg-white rounded-lg p-4 min-h-80 ${
        previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
      }`}>
        {components.length > 0 ? (
          <SortableContext items={components.map(c => c.id)}>
            <div className={`grid gap-4 ${
              previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'
            }`}>
              {components.map(component => renderComponent(component))}
            </div>
          </SortableContext>
        ) : (
          <div className="text-center text-gray-500 py-16">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Start Building</h3>
            <p className="text-sm">
              Drag components from the left panel to start building your trading platform
            </p>
          </div>
        )}
      </div>
      
      <DragOverlay>
        {draggedComponent ? (
          <div className="bg-white border-2 border-dashed border-liquid-green rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              {getComponentIcon(draggedComponent.type)}
              <span className="text-sm font-medium">{draggedComponent.type.replace('-', ' ')}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
