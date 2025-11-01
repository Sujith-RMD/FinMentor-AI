import React, { useState, useMemo } from 'react';
import { Sparkles, Loader } from './Icons';
import PieChart from './PieChart';
import * as geminiService from '../services/geminiService';
import { type PortfolioData, type PortfolioAnalysisResponse, type AIPortfolioAnalysisResponse } from '../types';
import MarkdownRenderer from '../utils/markdownParser';

interface PortfolioGeneratorProps {
  theme: 'dark' | 'light';
}

type RiskAppetite = 'Low' | 'Medium' | 'High';
const INVESTMENT_TOOLS = ['Mutual Funds', 'Stocks', 'Bonds', 'Debt Funds'];
const RISK_LEVELS: RiskAppetite[] = ['Low', 'Medium', 'High'];

const PortfolioGenerator: React.FC<PortfolioGeneratorProps> = ({ theme }) => {
  const [initialCapital, setInitialCapital] = useState('');
  const [monthlyInvestment, setMonthlyInvestment] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [riskAppetite, setRiskAppetite] = useState<RiskAppetite>('Medium');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PortfolioAnalysisResponse | null>(null);

  const handleToolToggle = (tool: string) => {
    setSelectedTools(prev => 
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  const portfolioChartData = useMemo(() => {
    if (!analysis || !analysis.allocations) return [];
    
    const colors = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];
    const otherColors = ['#F59E0B', '#FBBF24', '#FCD34D'];
    const debtColors = ['#6B7280', '#9CA3AF', '#D1D5DB'];

    return analysis.allocations.map((item, index) => {
        const lowerName = item.name.toLowerCase();
        let color = colors[index % colors.length];
        if (lowerName.includes('gold') || lowerName.includes('commodity')) {
            color = otherColors[index % otherColors.length];
        } else if (lowerName.includes('debt') || lowerName.includes('bond') || lowerName.includes('fd')) {
            color = debtColors[index % debtColors.length];
        }
        return {
            name: item.name,
            value: item.percentage,
            color: color,
        };
    });
  }, [analysis]);

  const handleGenerate = async () => {
      const capitalNum = parseInt(initialCapital.replace(/,/g, ''), 10) || 0;
      const sipNum = parseInt(monthlyInvestment.replace(/,/g, ''), 10) || 0;
      if (capitalNum === 0 && sipNum === 0) {
          alert('Please enter either Initial Capital or Monthly SIP.');
          return;
      }

      setIsLoading(true);
      setAnalysis(null);

      const portfolioData: PortfolioData = {
          initialCapital: capitalNum,
          monthlyInvestment: sipNum,
          riskAppetite,
          preferredTools: selectedTools,
      };

      const aiResult: AIPortfolioAnalysisResponse = await geminiService.generatePortfolioAnalysis(portfolioData);
      
      if (aiResult.allocations.length === 0) {
        setAnalysis({
          rationale: aiResult.rationale,
          projectedReturn: "N/A",
          allocations: []
        });
      } else {
        // Perform calculations on the client-side for accuracy and reliability
        const completeAllocations = aiResult.allocations.map(item => ({
          ...item,
          lumpSum: (item.percentage / 100) * capitalNum,
          sip: (item.percentage / 100) * sipNum,
        }));

        const finalAnalysis: PortfolioAnalysisResponse = {
          rationale: aiResult.rationale,
          projectedReturn: aiResult.projectedReturn,
          allocations: completeAllocations,
        };
        
        setAnalysis(finalAnalysis);
      }
      
      setIsLoading(false);
  };
  
  const isGenerateDisabled = (parseInt(initialCapital || '0') === 0 && parseInt(monthlyInvestment || '0') === 0) || isLoading;

  return (
    <div className="flex-1 flex flex-col h-full max-h-full overflow-y-auto p-4 sm:p-8 space-y-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold dark:text-white text-gray-900">Portfolio Generator</h1>
            <p className="text-md dark:text-gray-400 text-gray-600 mt-1">Create a personalized investment profile to get an AI-driven analysis.</p>
        </div>

        {/* Form Card */}
        <div className="dark:bg-gray-800/50 bg-white/80 p-6 rounded-2xl shadow-lg backdrop-blur-md border dark:border-gray-700 border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs */}
                <div>
                    <label className="text-sm font-medium dark:text-gray-300 text-gray-700">One-Time Capital (₹)</label>
                    <input type="text" value={initialCapital} onChange={e => setInitialCapital(e.target.value.replace(/\D/g, ''))} placeholder="e.g., 50000" className="w-full mt-1 px-4 py-2 rounded-lg dark:bg-gray-700 text-base dark:text-white text-gray-900 border dark:border-gray-600 border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                    <label className="text-sm font-medium dark:text-gray-300 text-gray-700">Monthly SIP (₹)</label>
                    <input type="text" value={monthlyInvestment} onChange={e => setMonthlyInvestment(e.target.value.replace(/\D/g, ''))} placeholder="e.g., 10000" className="w-full mt-1 px-4 py-2 rounded-lg dark:bg-gray-700 text-base dark:text-white text-gray-900 border dark:border-gray-600 border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>

            {/* Investment Tools */}
            <div className="mt-6">
                <label className="text-sm font-medium dark:text-gray-300 text-gray-700">Preferred Investment Tools</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {INVESTMENT_TOOLS.map(tool => (
                        <button key={tool} onClick={() => handleToolToggle(tool)} className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors ${selectedTools.includes(tool) ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold' : 'dark:border-gray-600 border-gray-300 dark:hover:bg-gray-700/50 hover:bg-gray-100'}`}>
                            {tool}
                        </button>
                    ))}
                </div>
            </div>

            {/* Risk Appetite */}
            <div className="mt-6">
                 <label className="text-sm font-medium dark:text-gray-300 text-gray-700">Risk Appetite</label>
                <div className="flex p-1 rounded-lg dark:bg-gray-700 bg-gray-200 mt-2">
                    {RISK_LEVELS.map(level => (
                        <button key={level} onClick={() => setRiskAppetite(level)} className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${riskAppetite === level ? 'bg-emerald-600 text-white shadow' : 'dark:text-gray-300 text-gray-600'}`}>
                            {level}
                        </button>
                    ))}
                </div>
            </div>
             <button onClick={handleGenerate} disabled={isGenerateDisabled} className="w-full mt-8 py-3 flex items-center justify-center gap-2 rounded-lg text-white font-semibold bg-gradient-to-br from-emerald-500 to-green-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100">
                {isLoading ? <><Loader size={18} className="animate-spin" /> Generating...</> : 'Generate Smart Portfolio'}
                {!isLoading && <Sparkles size={18} />}
            </button>
        </div>

        {/* Results Section */}
        {(isLoading || analysis) && (
            <div className="mt-8 animate-fade-in">
                <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-4">AI Analysis & Allocation</h2>
                <div className="dark:bg-gray-800/50 bg-white/80 p-6 rounded-2xl shadow-lg backdrop-blur-md border dark:border-gray-700 border-gray-200">
                    {isLoading && <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-emerald-500" size={32} /></div>}
                    
                    {!isLoading && analysis && analysis.allocations.length > 0 && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <PieChart data={portfolioChartData} />
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold dark:text-emerald-400 text-gray-800">Investment Rationale</h3>
                                        <div className="text-sm dark:text-gray-300 text-gray-700 mt-1">
                                          <MarkdownRenderer text={analysis.rationale} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold dark:text-emerald-400 text-gray-800">Projected Annual Return</h3>
                                        <p className="text-2xl font-bold dark:text-white text-gray-900">{analysis.projectedReturn}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                 <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-3">Detailed Allocation Plan</h3>
                                 <div className="overflow-x-auto rounded-lg border dark:border-gray-600 border-gray-300">
                                    <table className="min-w-full text-sm">
                                        <thead className="dark:bg-gray-700/40 bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-semibold dark:text-gray-200 text-gray-700">Asset Name</th>
                                                <th className="px-4 py-2 text-center font-semibold dark:text-gray-200 text-gray-700">Allocation</th>
                                                <th className="px-4 py-2 text-right font-semibold dark:text-gray-200 text-gray-700">Lump Sum (₹)</th>
                                                <th className="px-4 py-2 text-right font-semibold dark:text-gray-200 text-gray-700">Monthly SIP (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="dark:divide-gray-600 divide-gray-300">
                                            {analysis.allocations.map((item) => (
                                                <tr key={item.name} className="dark:even:bg-gray-800/20 even:bg-gray-50/50">
                                                    <td className="px-4 py-3 align-top">
                                                        <div className="font-medium dark:text-white">{item.name}</div>
                                                        <div className="text-xs dark:text-gray-400 text-gray-600">{item.metrics}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center align-middle">{item.percentage}%</td>
                                                    <td className="px-4 py-3 text-right align-middle font-mono dark:text-white">{item.lumpSum.toLocaleString('en-IN')}</td>
                                                    <td className="px-4 py-3 text-right align-middle font-mono dark:text-white">{item.sip.toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {!isLoading && analysis && analysis.allocations.length === 0 && (
                         <div className="text-center py-16">
                             <h3 className="text-lg font-semibold dark:text-white">Analysis Error</h3>
                             <p className="text-sm dark:text-gray-400 text-gray-600 mt-2">{analysis.rationale}</p>
                         </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioGenerator;
