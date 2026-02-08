import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Package,
  TruckIcon,
  DollarSign,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  Users,
  AlertTriangle,
  Eye,
  LogOut,
  MapPin,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { useShipment, ShipmentStatus } from '@/app/context/ShipmentContext';
import { swal } from '@/app/lib/swal';

interface AdminDashboardProps {
  onNavigate: (screen: string) => void;
}

export function AdminDashboard({ onNavigate: _onNavigate }: AdminDashboardProps) {
  const { shipments, userProfile, signOut, allProfiles, fetchAllProfiles, issues, resolveIssue, fetchIssues, approveProfile } = useShipment();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    fetchAllProfiles();
    fetchIssues();
  }, []);

  // Dynamic Analytics Calculation
  const totalShipments = shipments.length;
  const pendingShipments = shipments.filter(s => s.status === 'pending_approval').length;
  const pendingUsers = allProfiles.filter(p => !p.is_approved).length;
  const deliveredShipments = shipments.filter(s => s.status === 'delivered').length;

  const totalRevenue = shipments.reduce((acc, s) => {
    const priceNum = parseFloat(s.price.replace(/[^\d.]/g, '')) || 0;
    return acc + priceNum;
  }, 0);

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 border-0 flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1" /> Delivered</Badge>;
      case 'in_transit':
        return <Badge className="bg-blue-100 text-blue-800 border-0 flex items-center w-fit"><TruckIcon className="w-3 h-3 mr-1" /> In Transit</Badge>;
      case 'pending_approval':
        return <Badge className="bg-amber-100 text-amber-800 border-0 flex items-center w-fit"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'assigned':
        return <Badge className="bg-purple-100 text-purple-800 border-0 flex items-center w-fit"><Users className="w-3 h-3 mr-1" /> Assigned</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-0 flex items-center w-fit"><AlertTriangle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="flex items-center w-fit">{status.replace('_', ' ')}</Badge>;
    }
  };

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch = s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Admin Control</h1>
              <p className="text-xs text-muted-foreground mt-1">Platform Oversight</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />
            <div className="h-8 w-px bg-border mx-1" />
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">{userProfile?.name || 'Admin'}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Super Admin</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {userProfile?.name?.[0] || 'A'}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut()} className="text-muted-foreground">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="bg-white border border-border p-1 gap-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-white">Users</TabsTrigger>
              <TabsTrigger value="approvals" className="data-[state=active]:bg-primary data-[state=active]:text-white relative">
                Approvals
                {pendingUsers > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white animate-bounce">
                    {pendingUsers}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="shipments" className="data-[state=active]:bg-primary data-[state=active]:text-white">Shipments</TabsTrigger>
              <TabsTrigger value="issues" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Issues
                {issues.filter(i => i.status === 'open').length > 0 && (
                  <span className="ml-2 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>

            <Button
              className="bg-primary hover:bg-primary/90 flex items-center shadow-md"
              onClick={() => swal.toast('Report generation started', 'info')}
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 m-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Shipments</p>
                    <h3 className="text-3xl font-bold mt-1">{totalShipments}</h3>
                  </div>
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+12% from last month</span>
                </div>
              </Card>

              <Card className="p-5 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <h3 className="text-3xl font-bold mt-1">₵{totalRevenue.toLocaleString()}</h3>
                  </div>
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+8% from last month</span>
                </div>
              </Card>

              <Card className="p-5 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                    <h3 className="text-3xl font-bold mt-1 text-amber-600">{pendingShipments}</h3>
                  </div>
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-muted-foreground">
                  <span>Action required for these</span>
                </div>
              </Card>

              <Card className="p-5 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fullfilled</p>
                    <h3 className="text-3xl font-bold mt-1">{deliveredShipments}</h3>
                  </div>
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-muted-foreground">
                  <span>Success rate: {totalShipments ? Math.round((deliveredShipments / totalShipments) * 100) : 0}%</span>
                </div>
              </Card>

              <Card className="p-5 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Users</p>
                    <h3 className="text-3xl font-bold mt-1 text-red-600">{pendingUsers}</h3>
                  </div>
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-muted-foreground underline cursor-pointer" onClick={() => setActiveTab('approvals')}>
                  <span>Action required for these</span>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 border-none shadow-sm bg-white">
                <h3 className="font-bold mb-4 flex items-center">
                  <Package className="w-4 h-4 mr-2 text-primary" />
                  Recent Shipments
                </h3>
                <div className="space-y-4">
                  {shipments.slice(0, 5).map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold">
                          {s.id.slice(-3)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold leading-none">{s.customerName}</p>
                          <p className="text-xs text-muted-foreground mt-1">{s.fromCity} → {s.toCity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(s.status)}
                        <p className="text-[10px] text-muted-foreground mt-1">{s.date}</p>
                      </div>
                    </div>
                  ))}
                  {shipments.length === 0 && <p className="text-center text-muted-foreground py-8">No recent activity</p>}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-xs" onClick={() => setActiveTab('shipments')}>
                  View All Shipments
                </Button>
              </Card>

              <Card className="p-6 border-none shadow-sm bg-white">
                <h3 className="font-bold mb-4 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                  Open Issues
                </h3>
                <div className="space-y-4">
                  {issues.filter(i => i.status === 'open').slice(0, 5).map(issue => (
                    <div key={issue.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50/30 border border-red-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold leading-none">{issue.issue_type}</p>
                          <p className="text-xs text-muted-foreground mt-1">Shipment {issue.shipment_id}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 text-xs bg-white" onClick={() => setActiveTab('issues')}>
                        Resolve
                      </Button>
                    </div>
                  ))}
                  {issues.filter(i => i.status === 'open').length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">All clear! No open issues.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="m-0 outline-none space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex bg-white border border-border p-1 rounded-lg gap-1">
                {['all', 'staff', 'agent', 'customer'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${userRoleFilter === role
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted'
                      }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}s
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 h-9 bg-white"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold">User</TableHead>
                    <TableHead className="font-bold">Role</TableHead>
                    <TableHead className="font-bold">Contact</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allProfiles
                    .filter(u => {
                      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                      const matchesSearch = u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.id?.toLowerCase().includes(userSearch.toLowerCase());
                      return matchesRole && matchesSearch;
                    })
                    .map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                              {user.name?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-[10px] text-muted-foreground">{user.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize border-0 ${user.role === 'admin' ? 'bg-red-50 text-red-700' :
                            user.role === 'staff' ? 'bg-blue-50 text-blue-700' :
                              user.role === 'agent' ? 'bg-purple-50 text-purple-700' :
                                'bg-gray-50 text-gray-700'
                            }`}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="font-medium">{user.phone || 'No phone'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={user.is_approved ? 'bg-green-100 text-green-800 border-0' : 'bg-red-100 text-red-800 border-0'}>
                            {user.is_approved ? 'Active' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!user.is_approved && (
                              <Button
                                size="sm"
                                className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs"
                                onClick={() => approveProfile(user.id)}
                              >
                                Approve
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-8 hover:bg-muted text-primary text-xs">
                              View Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  {allProfiles.filter(u => userRoleFilter === 'all' || u.role === userRoleFilter).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                        No {userRoleFilter}s found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Shipments Tab */}
          <TabsContent value="shipments" className="m-0 outline-none space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tracking ID or customer..."
                  className="pl-10 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold">Tracking ID</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold">Route</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-right">Price</TableHead>
                    <TableHead className="font-bold text-right">Proof</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments.map((s) => (
                    <TableRow key={s.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-xs font-bold">{s.id}</TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{s.customerName}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-xs gap-1.5 font-medium">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {s.fromCity}
                          <span className="text-muted-foreground">→</span>
                          {s.toCity}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(s.status)}</TableCell>
                      <TableCell className="text-right font-bold text-sm">{s.price}</TableCell>
                      <TableCell className="text-right">
                        {s.deliveryPhotoUrl ? (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => window.open(s.deliveryPhotoUrl, '_blank')}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Approvals Tab */}

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="m-0 outline-none">
            <Card className="border-none shadow-sm overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold">User</TableHead>
                    <TableHead className="font-bold">Requested Role</TableHead>
                    <TableHead className="font-bold">Contact</TableHead>
                    <TableHead className="font-bold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allProfiles.filter(u => !u.is_approved).map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {user.name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground">{user.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {user.phone || 'No phone'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white"
                          onClick={() => approveProfile(user.id)}
                        >
                          Approve Registration
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {allProfiles.filter(u => !u.is_approved).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                        No pending approvals.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="m-0 outline-none">
            <Card className="border-none shadow-sm overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Shipment</TableHead>
                    <TableHead className="font-bold">Issue Type</TableHead>
                    <TableHead className="font-bold">Description</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue.id} className="hover:bg-muted/20">
                      <TableCell className="text-xs">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold">{issue.shipment_id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
                          {issue.issue_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-[250px] truncate">
                        {issue.description}
                      </TableCell>
                      <TableCell>
                        <Badge className={issue.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                          {issue.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {issue.status === 'open' && (
                          <Button size="sm" variant="outline" onClick={() => resolveIssue(issue.id)}>
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {issues.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No issues reported yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
