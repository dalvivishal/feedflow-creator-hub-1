import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, Search, User, Flag, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFeed } from '@/contexts/FeedContext';
import { useToast } from '@/hooks/use-toast';
import StatsCard from '@/components/StatsCard';
import { fetchAllUsers, updateUserCreditTransaction } from '@/lib/api';
import FeedCard from '@/components/FeedCard';

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { reportedItems, toggleSaveItem, toggleReportItem, toggleShareItem } = useFeed();
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [creditAmount, setCreditAmount] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAllUsers();
        setUsers(data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load users');
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    if (searchQuery.trim() === '') return true;
    const query = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  });

  const updateUserCredits = async (userId: string) => {
    console.log(`Updated credits for user ${userId}: ${creditAmount[userId] || 0}`);
    // TODO: Call API to update credits
    await updateUserCreditTransaction(userId, creditAmount[userId] || 0, "Manual Credit");
    setCreditAmount(prev => ({
      ...prev,
      [userId]: 0
    }));

    toast({
      title: "Credits successful.",
      // description: "Thank you for keeping our community safe.",
      duration: 2000,
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Manage users, view analytics, and monitor reported content
      </p>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <StatsCard
          title="Total Users"
          value={users.length}
          icon={<User size={20} />}
          description="Registered accounts"
        />
        <StatsCard
          title="Reported Content"
          value={reportedItems.length}
          icon={<Flag size={20} />}
          description="Items flagged by users"
        />
        <StatsCard
          title="Active Feed Sources"
          value="2"
          icon={<BarChart3 size={20} />}
          description="Twitter, Reddit"
        />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="reports">Reported Content</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Management</CardTitle>
              <CardDescription>View and manage user accounts and credit balances</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">Loading users...</div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">{error}</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                              }`}>
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>{user.credits}</TableCell>
                          <TableCell>{user.lastActive}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="Amount"
                                className="w-20 h-8"
                                value={creditAmount[user._id] || ''}
                                onChange={(e) => setCreditAmount({
                                  ...creditAmount,
                                  [user._id]: parseInt(e.target.value) || 0
                                })}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() => updateUserCredits(user._id)}
                                disabled={!creditAmount[user._id]}
                              >
                                Update
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No users found matching your search.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reported Content</CardTitle>
              <CardDescription>View and manage reported content</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search content..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {reportedItems.length > 0 ? (
                <div className="space-y-4">
                  {reportedItems.map(item => (
                    <FeedCard
                      key={item.id}
                      item={item}
                      onSave={toggleSaveItem}
                      onReport={toggleReportItem}
                      onShare={toggleShareItem}
                    />
                  ))}
                  {/* {reportedItems.length > 2 && (
                    <div className="text-center mt-4">
                      <Link to="/saved">
                        <Button variant="outline">View all saved items</Button>
                      </Link>
                    </div>
                  )} */}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No records found!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
