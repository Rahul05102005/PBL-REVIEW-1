import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Edit, Trash2, Loader2, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface FacultyProfile {
  id: string;
  profile: {
    first_name: string;
    last_name: string;
  };
}

interface Course {
  id: string;
  code: string;
  name: string;
  semester: number;
  academic_year: string;
  credits: number;
  department_id: string | null;
  faculty_id: string | null;
  department?: Department;
  faculty?: FacultyProfile;
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculty, setFaculty] = useState<FacultyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    semester: 1,
    academicYear: '2024-25',
    credits: 3,
    departmentId: '',
    facultyId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, deptRes, facultyRes] = await Promise.all([
        supabase
          .from('courses')
          .select(`
            *,
            department:departments(id, name, code),
            faculty:faculty_profiles(id, profile:profiles(first_name, last_name))
          `)
          .order('code'),
        supabase.from('departments').select('*').order('name'),
        supabase
          .from('faculty_profiles')
          .select('id, profile:profiles(first_name, last_name)')
          .order('employee_id'),
      ]);

      if (coursesRes.data) setCourses(coursesRes.data as unknown as Course[]);
      if (deptRes.data) setDepartments(deptRes.data);
      if (facultyRes.data) setFaculty(facultyRes.data as unknown as FacultyProfile[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in required fields',
        variant: 'destructive',
      });
      return;
    }

    setFormLoading(true);
    try {
      const courseData = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        semester: formData.semester,
        academic_year: formData.academicYear,
        credits: formData.credits,
        department_id: formData.departmentId || null,
        faculty_id: formData.facultyId || null,
      };

      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Course updated successfully' });
      } else {
        const { error } = await supabase.from('courses').insert(courseData);
        if (error) throw error;
        toast({ title: 'Success', description: 'Course created successfully' });
      }

      setIsDialogOpen(false);
      setEditingCourse(null);
      setFormData({
        code: '',
        name: '',
        semester: 1,
        academicYear: '2024-25',
        credits: 3,
        departmentId: '',
        facultyId: '',
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Operation failed',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'Success', description: 'Course deleted successfully' });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete course',
        variant: 'destructive',
      });
    }
  };

  const filteredCourses = courses.filter((c) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      c.code.toLowerCase().includes(searchLower) ||
      c.name.toLowerCase().includes(searchLower) ||
      c.department?.name.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Courses</h1>
            <p className="text-muted-foreground">Manage courses and faculty assignments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingCourse(null);
              setFormData({
                code: '',
                name: '',
                semester: 1,
                academicYear: '2024-25',
                credits: 3,
                departmentId: '',
                facultyId: '',
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                <DialogDescription>
                  {editingCourse ? 'Update course details' : 'Create a new course'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Course Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="CS101"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits</Label>
                    <Input
                      id="credits"
                      type="number"
                      min="1"
                      max="6"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Introduction to Computer Science"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select
                      value={formData.semester.toString()}
                      onValueChange={(v) => setFormData({ ...formData, semester: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <SelectItem key={s} value={s.toString()}>
                            Semester {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select
                      value={formData.academicYear}
                      onValueChange={(v) => setFormData({ ...formData, academicYear: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-25">2024-25</SelectItem>
                        <SelectItem value="2025-26">2025-26</SelectItem>
                        <SelectItem value="2026-27">2026-27</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(v) => setFormData({ ...formData, departmentId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assigned Faculty</Label>
                  <Select
                    value={formData.facultyId}
                    onValueChange={(v) => setFormData({ ...formData, facultyId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select faculty member" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculty.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.profile.first_name} {f.profile.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={formLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={formLoading}>
                  {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCourse ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Courses table */}
        <div className="dashboard-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="hidden sm:table-cell">Department</TableHead>
                  <TableHead className="hidden md:table-cell">Faculty</TableHead>
                  <TableHead className="hidden lg:table-cell">Semester</TableHead>
                  <TableHead className="hidden lg:table-cell">Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'No courses found' : 'No courses added yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                            <BookOpen className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{course.name}</p>
                            <Badge variant="outline" className="mt-1">{course.code}</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {course.department?.name || 'Unassigned'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {course.faculty?.profile
                          ? `${course.faculty.profile.first_name} ${course.faculty.profile.last_name}`
                          : 'Not assigned'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        Semester {course.semester}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {course.credits}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingCourse(course);
                              setFormData({
                                code: course.code,
                                name: course.name,
                                semester: course.semester,
                                academicYear: course.academic_year,
                                credits: course.credits,
                                departmentId: course.department_id || '',
                                facultyId: course.faculty_id || '',
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(course.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

export default Courses;
