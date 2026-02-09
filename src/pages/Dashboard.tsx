import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import PerformanceChart from '@/components/charts/PerformanceChart';
import TrendChart from '@/components/charts/TrendChart';
import RatingDistributionChart from '@/components/charts/RatingDistributionChart';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Building2,
  Award,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  totalFaculty: number;
  totalCourses: number;
  totalFeedback: number;
  averageRating: number;
  totalDepartments: number;
}

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalFaculty: 0,
    totalCourses: 0,
    totalFeedback: 0,
    averageRating: 0,
    totalDepartments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [facultyRes, coursesRes, feedbackRes, departmentsRes] = await Promise.all([
          supabase.from('faculty_profiles').select('id', { count: 'exact', head: true }),
          supabase.from('courses').select('id', { count: 'exact', head: true }),
          supabase.from('student_feedback').select('overall_rating'),
          supabase.from('departments').select('id', { count: 'exact', head: true }),
        ]);

        const totalFeedback = feedbackRes.data?.length || 0;
        const avgRating = totalFeedback > 0
          ? feedbackRes.data!.reduce((sum, f) => sum + f.overall_rating, 0) / totalFeedback
          : 0;

        setStats({
          totalFaculty: facultyRes.count || 0,
          totalCourses: coursesRes.count || 0,
          totalFeedback,
          averageRating: Number(avgRating.toFixed(2)),
          totalDepartments: departmentsRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Sample data for charts (replace with actual data)
  const performanceData = [
    { name: 'Teaching Quality', value: 4.2 },
    { name: 'Course Content', value: 4.0 },
    { name: 'Communication', value: 4.3 },
    { name: 'Punctuality', value: 4.5 },
    { name: 'Availability', value: 3.9 },
  ];

  const trendData = [
    { name: 'Jan', overall: 4.0, teaching: 4.1, content: 3.9 },
    { name: 'Feb', overall: 4.1, teaching: 4.2, content: 4.0 },
    { name: 'Mar', overall: 4.0, teaching: 4.0, content: 4.1 },
    { name: 'Apr', overall: 4.2, teaching: 4.3, content: 4.1 },
    { name: 'May', overall: 4.3, teaching: 4.4, content: 4.2 },
    { name: 'Jun', overall: 4.4, teaching: 4.5, content: 4.3 },
  ];

  const ratingDistribution = [
    { name: 'Excellent', value: 45 },
    { name: 'Good', value: 30 },
    { name: 'Average', value: 15 },
    { name: 'Poor', value: 10 },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-[350px]" />
            <Skeleton className="h-[350px]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Welcome back, {profile?.first_name || 'Admin'}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of the instructional quality metrics across all departments.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Faculty"
            value={stats.totalFaculty}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Departments"
            value={stats.totalDepartments}
            icon={Building2}
            variant="accent"
          />
          <StatCard
            title="Active Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            variant="default"
          />
          <StatCard
            title="Feedback Received"
            value={stats.totalFeedback}
            icon={MessageSquare}
            variant="success"
          />
          <StatCard
            title="Avg. Rating"
            value={stats.averageRating || 'N/A'}
            subtitle="out of 5.0"
            icon={Award}
            variant="warning"
            trend={stats.averageRating > 0 ? { value: 5.2, isPositive: true } : undefined}
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PerformanceChart
            data={performanceData}
            title="Average Metrics by Category"
          />
          <RatingDistributionChart
            data={ratingDistribution}
            title="Rating Distribution"
          />
        </div>

        {/* Charts row 2 */}
        <TrendChart
          data={trendData}
          lines={[
            { dataKey: 'overall', color: 'hsl(var(--chart-1))', name: 'Overall' },
            { dataKey: 'teaching', color: 'hsl(var(--chart-2))', name: 'Teaching' },
            { dataKey: 'content', color: 'hsl(var(--chart-3))', name: 'Content' },
          ]}
          title="Performance Trend Over Time"
        />

        {/* Quick actions */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/faculty"
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted"
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Manage Faculty</span>
            </a>
            <a
              href="/courses"
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted"
            >
              <BookOpen className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">View Courses</span>
            </a>
            <a
              href="/feedback"
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted"
            >
              <MessageSquare className="h-5 w-5 text-success" />
              <span className="text-sm font-medium">Analyze Feedback</span>
            </a>
            <a
              href="/reports"
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted"
            >
              <TrendingUp className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium">Generate Reports</span>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
