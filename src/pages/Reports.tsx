import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import {
  FileText,
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
} from 'lucide-react';

const Reports: React.FC = () => {
  const reportTypes = [
    {
      id: 'faculty-performance',
      title: 'Faculty Performance Report',
      description: 'Comprehensive analysis of faculty teaching quality metrics',
      icon: BarChart3,
      variant: 'primary' as const,
    },
    {
      id: 'department-summary',
      title: 'Department Summary Report',
      description: 'Aggregated performance metrics by department',
      icon: PieChart,
      variant: 'accent' as const,
    },
    {
      id: 'semester-comparison',
      title: 'Semester Comparison Report',
      description: 'Track performance trends across semesters',
      icon: TrendingUp,
      variant: 'success' as const,
    },
    {
      id: 'feedback-analysis',
      title: 'Feedback Analysis Report',
      description: 'Detailed breakdown of student feedback responses',
      icon: FileText,
      variant: 'warning' as const,
    },
  ];

  const handleGenerateReport = (reportId: string) => {
    // Placeholder for report generation logic
    console.log('Generating report:', reportId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download comprehensive reports
          </p>
        </div>

        {/* Report stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Reports Generated"
            value="24"
            subtitle="This month"
            icon={FileText}
            variant="primary"
          />
          <StatCard
            title="Last Report"
            value="2 days ago"
            icon={Calendar}
            variant="default"
          />
          <StatCard
            title="Downloads"
            value="156"
            subtitle="Total downloads"
            icon={Download}
            variant="accent"
          />
        </div>

        {/* Report types */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {reportTypes.map((report) => (
            <div key={report.id} className="dashboard-card">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    report.variant === 'primary'
                      ? 'bg-primary/10'
                      : report.variant === 'accent'
                      ? 'bg-accent/10'
                      : report.variant === 'success'
                      ? 'bg-success/10'
                      : 'bg-warning/10'
                  }`}
                >
                  <report.icon
                    className={`h-6 w-6 ${
                      report.variant === 'primary'
                        ? 'text-primary'
                        : report.variant === 'accent'
                        ? 'text-accent'
                        : report.variant === 'success'
                        ? 'text-success'
                        : 'text-warning'
                    }`}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {report.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {report.description}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleGenerateReport(report.id)}
                    >
                      Generate Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent reports */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Recent Reports
          </h3>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reports generated yet.</p>
            <p className="text-sm">Generate your first report to see it here.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
