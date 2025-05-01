import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIcon } from 'lucide-react'; // Optional: use proper icon
import axios from 'axios';
import Cookies from 'js-cookie';

type Activity = {
  _id: string;
  description: string;
  amount: number;
  createdAt: string;
};

const API_URL = import.meta.env.VITE_API_URL;

const CreditActivity = () => {
  const token = Cookies.get("feedflow_token");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users/credits`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setActivities(response.data || []);
      } catch (error) {
        console.error('Failed to fetch credit activities', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [token]);

  if (loading) {
    return <div>Loading activities...</div>;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ActivityIcon size={18} /> Recent Credit Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length > 0 ? (
          <ul className="space-y-2">
            {activities.map((activity) => (
              <li
                key={activity._id}
                className="flex justify-between items-center py-2 border-b border-dashed last:border-none"
              >
                <div>
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
                <span className={`font-semibold ${activity.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {activity.amount > 0 ? '+' : ''}{activity.amount}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            No recent activities found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditActivity;
