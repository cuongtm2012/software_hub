import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { requestNotificationPermission, setupForegroundMessageListener, storeFCMToken } from '@/lib/firebase-messaging';

interface NotificationSubscriptionProps {
  userId: number;
}

export function NotificationSubscription({ userId }: NotificationSubscriptionProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check current notification permission
    setPermissionStatus(Notification.permission);
    
    // Setup foreground message listener
    setupForegroundMessageListener();
    
    // Check if user is already subscribed
    const stored = localStorage.getItem('fcm-subscribed');
    const storedToken = localStorage.getItem('fcm-token');
    setIsSubscribed(stored === 'true');
    setFcmToken(storedToken);
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        // Store token on server
        const success = await storeFCMToken(token, userId);
        
        if (success) {
          setIsSubscribed(true);
          setPermissionStatus('granted');
          localStorage.setItem('fcm-subscribed', 'true');
          localStorage.setItem('fcm-token', token);
          
          toast({
            title: "Notifications Enabled",
            description: "You'll now receive push notifications for important updates.",
          });
        } else {
          toast({
            title: "Subscription Failed",
            description: "Failed to register for notifications. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Permission Denied",
          description: "Please allow notifications in your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = () => {
    setIsSubscribed(false);
    setFcmToken(null);
    localStorage.removeItem('fcm-subscribed');
    localStorage.removeItem('fcm-token');
    
    toast({
      title: "Notifications Disabled",
      description: "You'll no longer receive push notifications.",
    });
  };

  const getStatusText = () => {
    switch (permissionStatus) {
      case 'granted':
        return isSubscribed ? 'Subscribed to notifications' : 'Ready to subscribe';
      case 'denied':
        return 'Notifications blocked by browser';
      default:
        return 'Not subscribed';
    }
  };

  const getStatusColor = () => {
    switch (permissionStatus) {
      case 'granted':
        return isSubscribed ? 'text-green-600' : 'text-blue-600';
      case 'denied':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Enable push notifications to receive important updates even when the app is closed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium">Notification Status</p>
              <Badge variant={isSubscribed ? "default" : "secondary"}>
                {isSubscribed ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                ) : (
                  <><AlertCircle className="h-3 w-3 mr-1" /> Inactive</>
                )}
              </Badge>
            </div>
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            {fcmToken && (
              <p className="text-xs text-gray-500 mt-1 font-mono">
                Token: {fcmToken.substring(0, 20)}...
              </p>
            )}
          </div>
          
          {permissionStatus === 'denied' ? (
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Enable in browser settings
              </p>
            </div>
          ) : isSubscribed ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnsubscribe}
              className="flex items-center gap-2"
            >
              <BellOff className="h-4 w-4" />
              Unsubscribe
            </Button>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              {isLoading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
          )}
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Firebase Console Explanation</p>
              <p className="text-blue-700">
                Firebase shows "No data" because no browsers are subscribed yet. 
                Messages are being sent successfully (check server logs for message IDs).
                Click "Enable Notifications" to subscribe and see data in Firebase Console.
              </p>
            </div>
          </div>
        </div>
        
        {permissionStatus === 'denied' && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            To enable notifications:
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Click the notification icon in your browser's address bar</li>
              <li>Select "Allow" for notifications</li>
              <li>Refresh this page and try again</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}