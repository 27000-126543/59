import { useEffect, useState } from 'react';
import {
  FileText,
  DollarSign,
  Users,
  Star,
  GalleryHorizontalEnd,
  Calendar,
  ArrowLeft,
  Smartphone,
  Check,
  ChevronRight,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Badge from '@/components/Common/Badge';
import DataCard from '@/components/Common/DataCard';
import { get } from '@/utils/request';
import { cn } from '@/lib/utils';

interface MonthlyReport {
  id: string;
  month: string;
  year: number;
  generatedAt: string;
  revenue: {
    total: number;
    ticketCount: number;
    avgPrice: number;
    changePercent: number;
  };
  visitors: {
    total: number;
    changePercent: number;
  };
  exhibitions: Array<{
    id: string;
    name: string;
    booked: number;
    visited: number;
    revenue: number;
    isSpecial: boolean;
  }>;
  conservation: {
    totalInspections: number;
    completedInspections: number;
    pendingWorkOrders: number;
    activeWorkOrders: number;
    completedWorkOrders: number;
  };
  security: {
    totalAlerts: number;
    unresolvedAlerts: number;
    avgDensity: number;
    criticalCount: number;
  };
  satisfaction: number;
  dailyTrend: Array<{ day: string; revenue: number; visitors: number }>;
  suggestions: string[];
}

interface ReportSummary {
  month: string;
  generatedAt: string;
  revenue: number;
  visitors: number;
  satisfaction: number;
  exhibitions: number;
}

function formatCurrency(value: number) {
  return `¥${value.toLocaleString('zh-CN')}`;
}

function generateReports(): ReportSummary[] {
  return [
    {
      month: '2026年5月',
      generatedAt: '2026-06-01 09:00:00',
      revenue: 128450,
      visitors: 2358,
      satisfaction: 4.4,
      exhibitions: 4,
    },
    {
      month: '2026年4月',
      generatedAt: '2026-05-01 09:00:00',
      revenue: 114280,
      visitors: 2105,
      satisfaction: 4.3,
      exhibitions: 3,
    },
    {
      month: '2026年3月',
      generatedAt: '2026-04-01 09:00:00',
      revenue: 98650,
      visitors: 1820,
      satisfaction: 4.5,
      exhibitions: 3,
    },
    {
      month: '2026年2月',
      generatedAt: '2026-03-01 09:00:00',
      revenue: 85200,
      visitors: 1580,
      satisfaction: 4.2,
      exhibitions: 2,
    },
    {
      month: '2026年1月',
      generatedAt: '2026-02-01 09:00:00',
      revenue: 76800,
      visitors: 1420,
      satisfaction: 4.4,
      exhibitions: 2,
    },
  ];
}

function generateDailyTrend() {
  const data = [];
  for (let i = 1; i <= 30; i++) {
    data.push({
      day: `${i}日`,
      revenue: 3000 + Math.round(Math.sin(i / 3) * 1500) + Math.floor(Math.random() * 1000),
      visitors: 60 + Math.round(Math.sin(i / 4) * 30) + Math.floor(Math.random() * 20),
    });
  }
  return data;
}

const PIE_COLORS = ['#B8860B', '#8B6341', '#A68154', '#DCB03C', '#6B4A31'];

const visitorTypeData = [
  { name: '成人', value: 58 },
  { name: '学生', value: 22 },
  { name: '老人', value: 12 },
  { name: '儿童', value: 8 },
];

export default function Reports() {
  const [reports, setReports] = useState<ReportSummary[]>(generateReports());
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null);
  const [pushing, setPushing] = useState(false);
  const [pushSuccess, setPushSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleViewReport = async (summary: ReportSummary) => {
    setLoading(true);
    try {
      const data = await get<MonthlyReport>('/analytics/monthly-report');
      const fullReport: MonthlyReport = {
        ...data,
        id: `report-${summary.month}`,
        month: summary.month,
        year: 2026,
        generatedAt: summary.generatedAt,
        dailyTrend: generateDailyTrend(),
        suggestions: [
          '本月客流增长显著，建议在周末高峰期增加临时工作人员和引导标识',
          '特展"华夏文明五千年"表现优异，建议延长展期或策划类似主题特展',
          '第三展厅满意度略低，建议检查设施设备并优化参观动线',
          '建议增加亲子互动项目，吸引更多家庭观众',
          '学生票占比提升，可考虑与周边学校合作推出研学套餐',
        ],
      };
      setSelectedReport(fullReport);
    } catch (error) {
      console.error('获取报告详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePushToMobile = async () => {
    setPushing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPushing(false);
    setPushSuccess(true);
    setTimeout(() => setPushSuccess(false), 3000);
  };

  if (selectedReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedReport(null)}
              className="flex items-center gap-1 rounded-lg border border-museum-brown-200 px-3 py-1.5 text-sm text-museum-brown-600 transition-colors hover:bg-museum-cream"
            >
              <ArrowLeft className="h-4 w-4" />
              返回列表
            </button>
            <h1 className="text-2xl font-bold font-serif text-museum-brown-900">
              {selectedReport.month}华夏博物馆运营报告
            </h1>
          </div>
          <button
            onClick={handlePushToMobile}
            disabled={pushing}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              pushSuccess
                ? 'bg-museum-jade text-white'
                : 'bg-museum-gold-500 text-white hover:bg-museum-gold-600 shadow-gold hover:shadow-gold-hover'
            )}
          >
            {pushSuccess ? (
              <>
                <Check className="h-4 w-4" />
                推送成功
              </>
            ) : pushing ? (
              <>
                <Smartphone className="h-4 w-4 animate-pulse" />
                推送中...
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4" />
                推送至手机端
              </>
            )}
          </button>
        </div>

        <div className="rounded-xl border border-museum-gold-200 bg-gradient-to-r from-museum-gold-50 to-museum-cream p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-museum-gold-100 text-museum-gold-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-museum-brown-800">月度运营报告</h2>
                <p className="text-sm text-museum-brown-500">
                  生成时间：{selectedReport.generatedAt}
                </p>
              </div>
            </div>
            <Badge variant="gold">系统自动生成</Badge>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-museum-brown-800">月度核心指标总览</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DataCard
              title="月度总收入"
              value={formatCurrency(selectedReport.revenue.total)}
              subtitle={`${selectedReport.revenue.ticketCount} 张门票 · 均价 ${formatCurrency(selectedReport.revenue.avgPrice)}`}
              trend={selectedReport.revenue.changePercent}
              icon={<DollarSign className="h-6 w-6" />}
              color="gold"
            />
            <DataCard
              title="月度总客流"
              value={selectedReport.visitors.total.toLocaleString()}
              subtitle="参观人次"
              trend={selectedReport.visitors.changePercent}
              icon={<Users className="h-6 w-6" />}
              color="brown"
            />
            <DataCard
              title="举办展览数"
              value={selectedReport.exhibitions.length}
              subtitle={`特展 ${selectedReport.exhibitions.filter((e) => e.isSpecial).length} 个`}
              icon={<GalleryHorizontalEnd className="h-6 w-6" />}
              color="jade"
            />
            <DataCard
              title="平均满意度"
              value={selectedReport.satisfaction.toFixed(1)}
              subtitle="基于访客评分"
              icon={<Star className="h-6 w-6" />}
              color="crimson"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-xl border border-museum-brown-100 bg-white p-5 shadow-museum lg:col-span-2">
            <h3 className="mb-4 font-semibold text-museum-brown-800">月度收入与客流趋势</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedReport.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8B6341' }} axisLine={{ stroke: '#E8DCC8' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#8B6341' }} axisLine={{ stroke: '#E8DCC8' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#8B6341' }} axisLine={{ stroke: '#E8DCC8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FDF8F3',
                      border: '1px solid #E8DCC8',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" name="收入(元)" stroke="#B8860B" strokeWidth={2.5} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="visitors" name="客流(人)" stroke="#6B4A31" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-museum-brown-100 bg-white p-5 shadow-museum">
            <h3 className="mb-4 font-semibold text-museum-brown-800">观众类型分布</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visitorTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {visitorTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FDF8F3',
                      border: '1px solid #E8DCC8',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, '占比']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {visitorTypeData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                  <span className="text-xs text-museum-brown-600">
                    {item.name} {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-museum-brown-100 bg-white p-5 shadow-museum">
          <h3 className="mb-4 font-semibold text-museum-brown-800">各展览运营数据</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-museum-brown-100 text-left text-museum-brown-500">
                  <th className="pb-3 font-medium">展览名称</th>
                  <th className="pb-3 font-medium">预约数</th>
                  <th className="pb-3 font-medium">实际参观</th>
                  <th className="pb-3 font-medium">收入</th>
                  <th className="pb-3 font-medium">类型</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-museum-brown-50">
                {selectedReport.exhibitions.map((ex) => (
                  <tr key={ex.id} className="transition-colors hover:bg-museum-cream/30">
                    <td className="py-3 font-medium text-museum-brown-800">{ex.name}</td>
                    <td className="py-3 text-museum-brown-600">{ex.booked.toLocaleString()}</td>
                    <td className="py-3 text-museum-brown-600">{ex.visited.toLocaleString()}</td>
                    <td className="py-3 font-medium text-museum-gold-700">{formatCurrency(ex.revenue)}</td>
                    <td className="py-3">
                      <Badge variant={ex.isSpecial ? 'gold' : 'default'}>
                        {ex.isSpecial ? '特展' : '常规'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-museum-brown-100 bg-white p-5 shadow-museum">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-museum-gold-600" />
            <h3 className="font-semibold text-museum-brown-800">系统运营建议</h3>
          </div>
          <div className="space-y-3">
            {selectedReport.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg bg-museum-cream/40 p-3"
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-museum-gold-100 text-xs font-bold text-museum-gold-700">
                  {index + 1}
                </div>
                <p className="text-sm text-museum-brown-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-museum-brown-900">
          运营报告
        </h1>
        <p className="mt-1 text-sm text-museum-brown-500">
          每月自动生成，全维度分析博物馆运营状况
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-museum-brown-500">加载中...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report, index) => (
            <div
              key={report.month}
              onClick={() => handleViewReport(report)}
              className={cn(
                'cursor-pointer rounded-xl border bg-white p-5 shadow-museum transition-all hover:shadow-museum-hover',
                index === 0 ? 'border-museum-gold-300' : 'border-museum-brown-100'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl',
                      index === 0
                        ? 'bg-museum-gold-100 text-museum-gold-600'
                        : 'bg-museum-brown-100 text-museum-brown-500'
                    )}
                  >
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-museum-brown-900">{report.month}</h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-museum-brown-400">
                      <Calendar className="h-3 w-3" />
                      {report.generatedAt}
                    </div>
                  </div>
                </div>
                {index === 0 && <Badge variant="gold">最新</Badge>}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-museum-cream/50 p-3">
                  <p className="text-xs text-museum-brown-400">总收入</p>
                  <p className="mt-0.5 text-lg font-bold text-museum-gold-700">
                    {formatCurrency(report.revenue)}
                  </p>
                </div>
                <div className="rounded-lg bg-museum-cream/50 p-3">
                  <p className="text-xs text-museum-brown-400">总客流</p>
                  <p className="mt-0.5 text-lg font-bold text-museum-brown-700">
                    {report.visitors.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-museum-cream/50 p-3">
                  <p className="text-xs text-museum-brown-400">满意度</p>
                  <p className="mt-0.5 text-lg font-bold text-museum-crimson">
                    {report.satisfaction}
                    <span className="text-xs font-normal">/5.0</span>
                  </p>
                </div>
                <div className="rounded-lg bg-museum-cream/50 p-3">
                  <p className="text-xs text-museum-brown-400">展览数</p>
                  <p className="mt-0.5 text-lg font-bold text-museum-jade">
                    {report.exhibitions}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-museum-brown-100 pt-3">
                <span className="text-sm text-museum-gold-600">查看详情</span>
                <ChevronRight className="h-4 w-4 text-museum-gold-600" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
