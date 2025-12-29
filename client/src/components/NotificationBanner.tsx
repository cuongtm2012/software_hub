import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requestNotificationPermission, storeFCMToken } from '@/lib/firebase-messaging';
import { useToast } from '@/hooks/use-toast';

interface NotificationBannerProps {
    userId: number;
}

export function NotificationBanner({ userId }: NotificationBannerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Check if user has already enabled notifications
        const checkNotificationStatus = async () => {
            // Check if browser supports notifications
            if (!('Notification' in window)) {
                return;
            }

            // Check if user has already granted permission
            if (Notification.permission === 'granted') {
                return;
            }

            // Check if user has dismissed the banner before
            const dismissed = localStorage.getItem('notification-banner-dismissed');
            if (dismissed === 'true') {
                return;
            }

            // Show banner after a short delay
            setTimeout(() => {
                setIsVisible(true);
            }, 2000);
        };

        checkNotificationStatus();
    }, []);

    const handleEnableNotifications = async () => {
        setIsLoading(true);
        try {
            const token = await requestNotificationPermission();

            if (token) {
                const success = await storeFCMToken(token, userId);

                if (success) {
                    toast({
                        title: "Notifications Enabled",
                        description: "You'll now receive push notifications for important updates.",
                    });
                    setIsVisible(false);
                    localStorage.setItem('notification-banner-dismissed', 'true');
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
            console.error('Notification error:', error);
            toast({
                title: "Error",
                description: "Failed to enable notifications. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('notification-banner-dismissed', 'true');
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-5 max-w-md min-w-[380px]">
                <div className="flex items-start gap-4">
                    {/* Bell Icon */}
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bell className="h-5 w-5 text-blue-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                            Push Notifications
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Enable push notifications to receive important updates even when the app is closed.
                        </p>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-medium text-gray-500">Notification Status</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                Inactive
                            </span>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                            <p className="text-xs text-blue-800">
                                <span className="font-medium">Firebase Console Explanation</span>
                                <br />
                                Firebase shows "No data" because no browsers are subscribed yet. Messages are being sent successfully (check server logs for message IDs). Click "Enable Notifications" to subscribe and see data in Firebase Console.
                            </p>
                        </div>

                        {/* Action Button */}
                        <Button
                            onClick={handleEnableNotifications}
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Enabling...
                                </>
                            ) : (
                                <>
                                    <Bell className="h-4 w-4 mr-2" />
                                    Enable Notifications
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
