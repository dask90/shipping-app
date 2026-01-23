import { useState, useRef } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Settings,
  Bell,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { useShipment, Shipment } from '@/app/context/ShipmentContext';
import { toast } from 'sonner';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}


export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { userProfile, currentUser, shipments, signOut, updateProfile, uploadAvatar } = useShipment();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [address, setAddress] = useState(userProfile?.address || '');

  // Filter shipments for the current user
  const myShipments = shipments.filter((s: Shipment) => s.customer_id === currentUser?.id).slice(0, 5);

  const handleLogout = async () => {
    await signOut();
    onNavigate('dashboard');
  };

  const handleSave = async () => {
    setIsUpdating(true);

    // Update basic profile
    const { error: profileError } = await updateProfile({ name, phone, address });

    // Update email if changed
    let emailError: any = null;
    if (email !== currentUser?.email) {
      const { error } = await updateEmail(email);
      emailError = error;
    }

    if (profileError || emailError) {
      toast.error(profileError?.message || emailError?.message || 'Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    }
    setIsUpdating(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUploading(true);
    const { publicUrl, error } = await uploadAvatar(file);

    if (error) {
      toast.error('Failed to upload image');
    } else if (publicUrl) {
      const { error: updateError } = await updateProfile({ avatar_url: publicUrl });
      if (updateError) {
        toast.error('Failed to update profile picture');
      } else {
        toast.success('Profile picture updated!');
      }
    }
    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-white p-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center mb-4 text-blue-100 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl mb-1">Profile & Settings</h1>
          <p className="text-blue-100">Manage your account</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-12">
        {/* Profile Card */}
        <Card className="p-6 shadow-lg mb-6">
          <div className="flex items-center mb-6">
            <div
              className="relative group cursor-pointer"
              onClick={handleAvatarClick}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-4 overflow-hidden border-2 border-transparent group-hover:border-primary transition-all">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full mr-4">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mb-1 h-8 font-semibold text-lg"
                  placeholder="Your Name"
                />
              ) : (
                <h2 className="mb-1">{userProfile?.name || 'User Profile'}</h2>
              )}
              <p className="text-sm text-muted-foreground">{userProfile?.role?.toUpperCase()} ID: {currentUser?.id?.slice(0, 8)}</p>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setName(userProfile?.name || '');
                  }}
                  disabled={isUpdating}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="Enter email address"
                  />
                ) : (
                  <Input
                    id="email"
                    value={currentUser?.email || ''}
                    className="pl-10 bg-muted/30"
                    readOnly
                  />
                )}
              </div>
              {isEditing && (
                <p className="text-[10px] text-amber-600 font-medium">Changing your email will require re-verification.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 hover:border-primary transition-colors"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <Input
                    id="phone"
                    value={userProfile?.phone || ''}
                    className="pl-10"
                    readOnly
                  />
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Saved Address */}
        <Card className="p-6 shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary" />
              Saved Pickup Address
            </h3>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
          <div className="bg-muted/50 rounded-lg p-4 transition-all hover:bg-muted">
            {isEditing ? (
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your default address"
                className="bg-transparent border-none p-0 focus-visible:ring-0 shadow-none text-sm h-auto"
              />
            ) : (
              <p className="text-sm">
                {userProfile?.address || 'No saved address found. Add one in settings.'}
              </p>
            )}
          </div>
        </Card>

        {/* Shipping History */}
        <Card className="p-6 shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary" />
              Recent History
            </h3>
            <button className="text-sm text-primary hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {myShipments.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No shipments found in your history.
              </div>
            ) : (
              myShipments.map((shipment: Shipment) => (
                <div
                  key={shipment.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <div className="text-sm mb-1">{shipment.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {shipment.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm mb-1">{shipment.price}</div>
                    <div className="text-xs text-muted-foreground">
                      {shipment.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Settings Options */}
        <Card className="p-6 shadow-md mb-6">
          <h3 className="mb-4">Settings</h3>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg px-3 -mx-3 text-left">
              <div className="flex items-center">
                <Bell className="w-5 h-5 mr-3 text-muted-foreground" />
                <span>Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg px-3 -mx-3 text-left">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 mr-3 text-muted-foreground" />
                <span>Payment Methods</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg px-3 -mx-3 text-left">
              <div className="flex items-center">
                <Settings className="w-5 h-5 mr-3 text-muted-foreground" />
                <span>Preferences</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg px-3 -mx-3 text-left">
              <div className="flex items-center">
                <HelpCircle className="w-5 h-5 mr-3 text-muted-foreground" />
                <span>Help & Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
