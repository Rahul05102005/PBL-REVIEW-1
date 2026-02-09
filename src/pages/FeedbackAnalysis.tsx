import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Star, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import PerformanceChart from '@/components/charts/PerformanceChart';
import RatingDistributionChart from '@/components/charts/RatingDistributionChart';

interface Feedback {
  id: string;
  teaching_quality: number;
  course_content: number;
  communication: number;
  punctuality: number;
  availability: number;
  overall_rating: number;
  comments: string | null;
  submitted_at: string;
  semester: string;
  academic_year: string;
  course: {
    id: string;
    code: string;
    name: string;
    faculty?: {
      profile: {
        first_name: string;
        last_name: string;
      };
    };
  };
}

const FeedbackAnalysis: React.FC = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_feedback')
        .select(`
          *,
          course:courses(
            id,
            code,
            name,
            faculty:faculty_profiles(
              profile:profiles(first_name, last_name)
            )
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setFeedback(data as unknown as Feedback[]);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feedback data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedback = feedback.filter((f) => {
    const matchesSearch =
      f.course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.comments && f.comments.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSemester = semesterFilter === 'all' || f.semester === semesterFilter;

    return matchesSearch && matchesSemester;
  });

  // Calculate aggregate metrics
  const aggregateMetrics = () => {
    if (filteredFeedback.length === 0) return [];

    const totals = filteredFeedback.reduce(
      (acc, f) => ({
        teaching: acc.teaching + f.teaching_quality,
        content: acc.content + f.course_content,
        communication: acc.communication + f.communication,
        punctuality: acc.punctuality + f.punctuality,
        availability: acc.availability + f.availability,
      }),
      { teaching: 0, content: 0, communication: 0, punctuality: 0, availability: 0 }
    );

    const count = filteredFeedback.length;
    return [
      { name: 'Teaching Quality', value: Number((totals.teaching / count).toFixed(2)) },
      { name: 'Course Content', value: Number((totals.content / count).toFixed(2)) },
      { name: 'Communication', value: Number((totals.communication / count).toFixed(2)) },
      { name: 'Punctuality', value: Number((totals.punctuality / count).toFixed(2)) },
      { name: 'Availability', value: Number((totals.availability / count).toFixed(2)) },
    ];
  };

  const ratingDistribution = () => {
    const dist = { excellent: 0, good: 0, average: 0, poor: 0 };
    filteredFeedback.forEach((f) => {
      if (f.overall_rating >= 4.5) dist.excellent++;
      else if (f.overall_rating >= 3.5) dist.good++;
      else if (f.overall_rating >= 2.5) dist.average++;
      else dist.poor++;
    });
    return [
      { name: 'Excellent (4.5-5)', value: dist.excellent },
      { name: 'Good (3.5-4.4)', value: dist.good },
      { name: 'Average (2.5-3.4)', value: dist.average },
      { name: 'Poor (1-2.4)', value: dist.poor },
    ].filter((d) => d.value > 0);
  };

  const uniqueSemesters = [...new Set(feedback.map((f) => f.semester))];

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return <span className="rating-excellent">Excellent</span>;
    if (rating >= 3.5) return <span className="rating-good">Good</span>;
    if (rating >= 2.5) return <span className="rating-average">Average</span>;
    return <span className="rating-poor">Poor</span>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-[350px]" />
            <Skeleton className="h-[350px]" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Feedback Analysis
          </h1>
          <p className="text-muted-foreground">
            Analyze student feedback and identify improvement areas
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by course or comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {uniqueSemesters.map((sem) => (
                <SelectItem key={sem} value={sem}>
                  {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="stat-card">
            <p className="stat-label">Total Responses</p>
            <p className="stat-value">{filteredFeedback.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Avg. Rating</p>
            <p className="stat-value">
              {filteredFeedback.length > 0
                ? (
                    filteredFeedback.reduce((a, f) => a + f.overall_rating, 0) /
                    filteredFeedback.length
                  ).toFixed(2)
                : 'N/A'}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">With Comments</p>
            <p className="stat-value">
              {filteredFeedback.filter((f) => f.comments).length}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Courses Covered</p>
            <p className="stat-value">
              {new Set(filteredFeedback.map((f) => f.course.id)).size}
            </p>
          </div>
        </div>

        {/* Charts */}
        {filteredFeedback.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PerformanceChart
              data={aggregateMetrics()}
              title="Average Metrics Across All Feedback"
            />
            <RatingDistributionChart
              data={ratingDistribution()}
              title="Overall Rating Distribution"
            />
          </div>
        )}

        {/* Feedback table */}
        <div className="dashboard-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="hidden sm:table-cell">Faculty</TableHead>
                  <TableHead className="hidden md:table-cell">Rating</TableHead>
                  <TableHead className="hidden lg:table-cell">Semester</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No feedback found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedback.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{f.course.name}</p>
                          <Badge variant="outline" className="mt-1">{f.course.code}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {f.course.faculty?.profile
                          ? `${f.course.faculty.profile.first_name} ${f.course.faculty.profile.last_name}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="font-medium">{f.overall_rating}</span>
                          {getRatingBadge(f.overall_rating)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {f.semester}
                      </TableCell>
                      <TableCell>
                        {f.comments ? (
                          <div className="flex items-start gap-2 max-w-xs">
                            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {f.comments}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No comments</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FeedbackAnalysis;
