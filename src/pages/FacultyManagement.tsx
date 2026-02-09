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
import { Plus, Search, Edit, Trash2, Loader2, UserCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface FacultyMember {
  id: string;
  employee_id: string;
  designation: string;
  qualification: string | null;
  specialization: string | null;
  experience_years: number;
  department_id: string | null;
  department?: Department;
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    user_id: string;
  };
}

const FacultyManagement: React.FC = () => {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    employeeId: '',
    departmentId: '',
    designation: 'Assistant Professor',
    qualification: '',
    specialization: '',
    experienceYears: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facultyRes, deptRes] = await Promise.all([
        supabase
          .from('faculty_profiles')
          .select(`
            *,
            profile:profiles!faculty_profiles_profile_id_fkey(id, first_name, last_name, email, user_id),
            department:departments(id, name, code)
          `),
        supabase.from('departments').select('*'),
      ]);

      if (facultyRes.data) {
        setFaculty(facultyRes.data as unknown as FacultyMember[]);
      }
      if (deptRes.data) {
        setDepartments(deptRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load faculty data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;

    try {
      const { error } = await supabase.from('faculty_profiles').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Faculty member deleted successfully',
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete faculty member',
        variant: 'destructive',
      });
    }
  };

  const filteredFaculty = faculty.filter((f) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      f.profile.first_name.toLowerCase().includes(searchLower) ||
      f.profile.last_name.toLowerCase().includes(searchLower) ||
      f.employee_id.toLowerCase().includes(searchLower) ||
      f.department?.name.toLowerCase().includes(searchLower)
    );
  });

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return <span className="rating-excellent">Excellent</span>;
    if (rating >= 3.5) return <span className="rating-good">Good</span>;
    if (rating >= 2.5) return <span className="rating-average">Average</span>;
    return <span className="rating-poor">Needs Improvement</span>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-40" />
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Faculty Management
            </h1>
            <p className="text-muted-foreground">
              Manage faculty profiles and assignments
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
                </DialogTitle>
                <DialogDescription>
                  Fill in the details for the faculty member.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeId: e.target.value })
                    }
                    placeholder="EMP001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, departmentId: value })
                    }
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
                  <Label htmlFor="designation">Designation</Label>
                  <Select
                    value={formData.designation}
                    onValueChange={(value) =>
                      setFormData({ ...formData, designation: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Assistant Professor">
                        Assistant Professor
                      </SelectItem>
                      <SelectItem value="Associate Professor">
                        Associate Professor
                      </SelectItem>
                      <SelectItem value="Professor">Professor</SelectItem>
                      <SelectItem value="HOD">Head of Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={formData.qualification}
                    onChange={(e) =>
                      setFormData({ ...formData, qualification: e.target.value })
                    }
                    placeholder="Ph.D. in Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({ ...formData, specialization: e.target.value })
                    }
                    placeholder="Machine Learning"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experienceYears: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button disabled={formLoading}>
                  {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingFaculty ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, employee ID, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Faculty table */}
        <div className="dashboard-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty Member</TableHead>
                  <TableHead className="hidden sm:table-cell">Employee ID</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead className="hidden lg:table-cell">Designation</TableHead>
                  <TableHead className="hidden xl:table-cell">Experience</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaculty.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchQuery
                        ? 'No faculty members found matching your search'
                        : 'No faculty members added yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFaculty.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                            {member.profile.first_name.charAt(0)}
                            {member.profile.last_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {member.profile.first_name} {member.profile.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.profile.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{member.employee_id}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {member.department?.name || 'Unassigned'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {member.designation}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {member.experience_years} years
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingFaculty(member);
                              setFormData({
                                userId: member.profile.user_id,
                                employeeId: member.employee_id,
                                departmentId: member.department_id || '',
                                designation: member.designation,
                                qualification: member.qualification || '',
                                specialization: member.specialization || '',
                                experienceYears: member.experience_years,
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
                            onClick={() => handleDelete(member.id)}
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

export default FacultyManagement;
