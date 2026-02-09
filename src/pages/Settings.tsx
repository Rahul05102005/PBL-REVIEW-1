import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Building2 } from 'lucide-react';

const Settings: React.FC = () => {
  const { profile, role, user } = useAuth();

  const getInitials = () => {
    if (profile) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        {/* Profile section */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Profile</h3>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div>
                <h4 className="text-lg font-medium text-foreground">
                  {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                </h4>
                <p className="text-sm text-muted-foreground capitalize">{role || 'User'}</p>
              </div>
              <Button variant="outline" size="sm">
                Change Avatar
              </Button>
            </div>
          </div>
        </div>

        {/* Account details */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Account Details
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    value={profile?.first_name || ''}
                    disabled
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    value={profile?.last_name || ''}
                    disabled
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || user?.email || ''}
                  disabled
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={profile?.phone || ''}
                  placeholder="Not provided"
                  disabled
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Security</h3>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage your password and security settings.
            </p>
            <Button variant="outline">Change Password</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
