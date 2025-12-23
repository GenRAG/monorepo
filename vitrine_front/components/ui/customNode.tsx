import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Search, Database, Brain, FileText, Zap, CheckCircle } from 'lucide-react';
import { AnimatedGradientBorderTW } from '@/components/ui/animatedGradiantBorder';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';

const iconMap = {
  Search,
  Database,
  Brain,
  FileText,
  Zap,
  CheckCircle,
};

export const CustomNode = memo(({ data }: any) => {
  const Icon = iconMap[data.icon as keyof typeof iconMap];
  console.log(data);
  return (
    <div className="relative">
      {data.label != "Query" && (
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2.5 h-2.5 !bg-orange-500 !border-none"
      />
        )}

      <div className="relative min-w-[240px]">
        <AnimatedGradientBorderTW>
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-orange-500" />
              <span className="text-gray-100 font-medium">{data.label}</span>
            </div>
          </div>

          <div className="px-4 py-4 text-left">
            <p className="text-gray-400 text-sm mb-2">{data.description}</p>
            {data.label == "Query" && (
                <>
                    <Input value="Explain genRAG" readOnly />
                </>
            )}
            {data.label == "LLM" && (
                <>
                    <div className="relative">
                        <Input value="GPT" readOnly className="pr-8" />
                        <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                            <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </div>
                </>
            )}
            <div className="space-y-2 mt-2">
              <div className="text-xs text-gray-500">
                {data.detail || 'Processing node in RAG pipeline'}
              </div>
            </div>
          </div>

          <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 flex items-center justify-end">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
            </div>
          </div>
        </AnimatedGradientBorderTW>
      </div>
        {data.label != "Response" && (
            <Handle 
                type="source" 
                position={Position.Right} 
                className="w-2.5 h-2.5 !bg-orange-500 !border-none"
            />
        )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
});

CustomNode.displayName = 'CustomNode';