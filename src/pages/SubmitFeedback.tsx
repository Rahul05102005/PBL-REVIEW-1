import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, Star, Loader2, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

interface Course {
  id: string;
  code: string;
  name: string;
  semester: number;
  academic_year: string;
  faculty: {
    profile: {
      first_name: string;
      last_name: string;
    };
  } | null;
}

const feedbackSchema = z.object({
  courseId: z.string().min(1, 'Please select a course'),
  teachingQuality: z.number().min(1).max(5),
  courseContent: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  punctuality: z.number().min(1).max(5),
  availability: z.number().min(1).max(5),
  comments: z.string().max(1000).optional(),
});

const SubmitFeedback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    courseId: searchParams.get('course') || '',
    teachingQuality: 0,
    courseContent: 0,
    communication: 0,
    punctuality: 0,
    availability: 0,
    comments: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select(`
            id,
            code,
            name,
            semester,
            academic_year,
            faculty:faculty_profiles(
              profile:profiles(first_name, last_name)
            )
          `)
          .order('name');

        if (error) throw error;
        setCourses(data as unknown as Course[]);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleRatingChange = (field: string, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const calculateOverall = () => {
    const ratings = [
      formData.teachingQuality,
      formData.courseContent,
      formData.communication,
      formData.punctuality,
      formData.availability,
    ].filter((r) => r > 0);

    if (ratings.length === 0) return 0;
    return Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate all ratings are filled
    const ratingFields = ['teachingQuality', 'courseContent', 'communication', 'punctuality', 'availability'];
    const newErrors: Record<string, string> = {};
    
    ratingFields.forEach((field) => {
      if (formData[field as keyof typeof formData] === 0) {
        newErrors[field] = 'Please provide a rating';
      }
    });

    if (!formData.courseId) {
      newErrors.courseId = 'Please select a course';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    try {
      const overallRating = calculateOverall();
      const selectedCourse = courses.find((c) => c.id === formData.courseId);

      const { error } = await supabase.from('student_feedback').insert({
        course_id: formData.courseId,
        teaching_quality: formData.teachingQuality,
        course_content: formData.courseContent,
        communication: formData.communication,
        punctuality: formData.punctuality,
        availability: formData.availability,
        overall_rating: overallRating,
        comments: formData.comments || null,
        anonymous_token: crypto.randomUUID(),
        semester: `Semester ${selectedCourse?.semester || 1}`,
        academic_year: selectedCourse?.academic_year || '2024-25',
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your anonymous feedback!',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const RatingStars = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring rounded"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? 'fill-warning text-warning'
                  : 'fill-muted text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Feedback Submitted!</h1>
          <p className="text-muted-foreground">
            Thank you for taking the time to provide your feedback. Your responses are anonymous and will help improve instructional quality.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => {
              setSubmitted(false);
              setFormData({
                courseId: '',
                teachingQuality: 0,
                courseContent: 0,
                communication: 0,
                punctuality: 0,
                availability: 0,
                comments: '',
              });
            }}>
              Submit Another Feedback
            </Button>
            <Button variant="outline" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">FIQ Dashboard</h1>
            <p className="text-xs text-muted-foreground">Anonymous Feedback Portal</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="dashboard-card animate-fade-in">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Submit Anonymous Feedback</h2>
              <p className="text-muted-foreground">
                Your feedback is completely anonymous and helps improve teaching quality.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course selection */}
              <div className="space-y-2">
                <Label htmlFor="course">Select Course</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, courseId: value }));
                    if (errors.courseId) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.courseId;
                        return newErrors;
                      });
                    }
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className={errors.courseId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                        {course.faculty?.profile && (
                          <span className="text-muted-foreground ml-2">
                            ({course.faculty.profile.first_name} {course.faculty.profile.last_name})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.courseId && (
                  <p className="text-sm text-destructive">{errors.courseId}</p>
                )}
              </div>

              {/* Rating sections */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <RatingStars
                    value={formData.teachingQuality}
                    onChange={(v) => handleRatingChange('teachingQuality', v)}
                    label="Teaching Quality"
                  />
                  {errors.teachingQuality && (
                    <p className="text-sm text-destructive mt-1">{errors.teachingQuality}</p>
                  )}
                </div>

                <div>
                  <RatingStars
                    value={formData.courseContent}
                    onChange={(v) => handleRatingChange('courseContent', v)}
                    label="Course Content"
                  />
                  {errors.courseContent && (
                    <p className="text-sm text-destructive mt-1">{errors.courseContent}</p>
                  )}
                </div>

                <div>
                  <RatingStars
                    value={formData.communication}
                    onChange={(v) => handleRatingChange('communication', v)}
                    label="Communication"
                  />
                  {errors.communication && (
                    <p className="text-sm text-destructive mt-1">{errors.communication}</p>
                  )}
                </div>

                <div>
                  <RatingStars
                    value={formData.punctuality}
                    onChange={(v) => handleRatingChange('punctuality', v)}
                    label="Punctuality"
                  />
                  {errors.punctuality && (
                    <p className="text-sm text-destructive mt-1">{errors.punctuality}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <RatingStars
                    value={formData.availability}
                    onChange={(v) => handleRatingChange('availability', v)}
                    label="Availability & Support"
                  />
                  {errors.availability && (
                    <p className="text-sm text-destructive mt-1">{errors.availability}</p>
                  )}
                </div>
              </div>

              {/* Overall rating display */}
              {calculateOverall() > 0 && (
                <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Overall Rating:</span>
                  <span className="text-2xl font-bold text-primary">{calculateOverall()}</span>
                  <span className="text-muted-foreground">/5</span>
                </div>
              )}

              {/* Comments */}
              <div className="space-y-2">
                <Label htmlFor="comments">Additional Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  placeholder="Share any additional feedback or suggestions..."
                  value={formData.comments}
                  onChange={(e) => setFormData((prev) => ({ ...prev, comments: e.target.value }))}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.comments.length}/1000 characters
                </p>
              </div>

              {/* Submit button */}
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubmitFeedback;
