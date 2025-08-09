import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  MessageSquare, 
  Settings, 
  ShoppingCart, 
  Calendar, 
  Gift, 
  Shield, 
  Users, 
  Loader2,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveredCount?: number;
  failedCount?: number;
}

interface TestLog {
  timestamp: Date;
  type: string;
  status: 'success' | 'error';
  message: string;
  details?: any;
}

export default function PushNotificationTestPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [testLogs, setTestLogs] = useState<TestLog[]>([]);
  
  // Form states for different test scenarios
  const [userActivityForms, setUserActivityForms] = useState({
    newMessage: { userId: '', senderName: '', messagePreview: '' },
    comment: { userId: '', commenterName: '', contentTitle: '' }
  });

  const [systemNotificationForms, setSystemNotificationForms] = useState({
    maintenance: { maintenanceTime: '', details: '' },
    systemUpdate: { version: '', features: '' }
  });

  const [transactionalForms, setTransactionalForms] = useState({
    orderConfirmation: { userId: '', orderId: '', amount: '' },
    paymentFailure: { userId: '', orderId: '', reason: '' }
  });

  const [reminderForms, setReminderForms] = useState({
    eventReminder: { userId: '', eventName: '', eventTime: '' },
    subscriptionRenewal: { userId: '', expiryDate: '' }
  });

  const [marketingForm, setMarketingForm] = useState({
    offerTitle: '',
    offerDetails: '',
    validUntil: ''
  });

  const [securityForms, setSecurityForms] = useState({
    unusualLogin: { userId: '', location: '', device: '' },
    passwordChange: { userId: '' }
  });

  const [bulkForm, setBulkForm] = useState({
    title: '',
    body: '',
    userIds: '',
    clickAction: ''
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-4">
                  Only administrators can access the push notification testing page.
                </p>
                <Button onClick={() => navigate('/auth')}>Login as Admin</Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const addTestLog = (type: string, status: 'success' | 'error', message: string, details?: any) => {
    const newLog: TestLog = {
      timestamp: new Date(),
      type,
      status,
      message,
      details
    };
    setTestLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const sendNotification = async (endpoint: string, data: any, testType: string) => {
    setIsLoading(true);
    try {
      const result = await apiRequest('POST', endpoint, data) as NotificationResult;
      
      if (result.success) {
        addTestLog(testType, 'success', `Notification sent successfully`, result);
        toast({
          title: 'Notification Sent',
          description: `${testType} notification delivered successfully`,
        });
      } else {
        addTestLog(testType, 'error', `Failed to send notification: ${result.error}`, result);
        toast({
          title: 'Notification Failed',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestLog(testType, 'error', `Request failed: ${errorMessage}`, error);
      toast({
        title: 'Request Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (endpoint: string, formData: any, testType: string) => {
    // Validate required fields
    const missingFields = Object.entries(formData)
      .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
      .map(([key]) => key);

    if (missingFields.length > 0) {
      toast({
        title: 'Missing Fields',
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    await sendNotification(endpoint, formData, testType);
  };

  const clearLogs = () => {
    setTestLogs([]);
    toast({
      title: 'Logs Cleared',
      description: 'All test logs have been cleared',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header Section */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Admin Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Bell className="h-8 w-8 text-blue-600" />
                  Push Notification Testing
                </h1>
                <p className="text-gray-600 mt-2">
                  Test FCM push notifications across all user activity scenarios and system alerts
                </p>
              </div>
            </div>
            <Button
              onClick={clearLogs}
              variant="outline"
              disabled={testLogs.length === 0}
            >
              Clear Logs ({testLogs.length})
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Test Interface */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="user-activity" className="space-y-6">
                <TabsList className="grid grid-cols-6 w-full">
                  <TabsTrigger value="user-activity" className="text-xs">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Activity
                  </TabsTrigger>
                  <TabsTrigger value="system" className="text-xs">
                    <Settings className="h-4 w-4 mr-1" />
                    System
                  </TabsTrigger>
                  <TabsTrigger value="transactional" className="text-xs">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="reminders" className="text-xs">
                    <Calendar className="h-4 w-4 mr-1" />
                    Reminders
                  </TabsTrigger>
                  <TabsTrigger value="marketing" className="text-xs">
                    <Gift className="h-4 w-4 mr-1" />
                    Marketing
                  </TabsTrigger>
                  <TabsTrigger value="security" className="text-xs">
                    <Shield className="h-4 w-4 mr-1" />
                    Security
                  </TabsTrigger>
                </TabsList>

                {/* User Activity Alerts */}
                <TabsContent value="user-activity" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        User Activity Alerts
                      </CardTitle>
                      <CardDescription>
                        Test notifications for user interactions like messages and comments
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* New Message Notification */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">New Message Notification</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="messageUserId">User ID</Label>
                            <Input
                              id="messageUserId"
                              placeholder="1"
                              value={userActivityForms.newMessage.userId}
                              onChange={(e) => setUserActivityForms(prev => ({
                                ...prev,
                                newMessage: { ...prev.newMessage, userId: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="senderName">Sender Name</Label>
                            <Input
                              id="senderName"
                              placeholder="John Doe"
                              value={userActivityForms.newMessage.senderName}
                              onChange={(e) => setUserActivityForms(prev => ({
                                ...prev,
                                newMessage: { ...prev.newMessage, senderName: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="messagePreview">Message Preview</Label>
                          <Input
                            id="messagePreview"
                            placeholder="Hey, how's the project going?"
                            value={userActivityForms.newMessage.messagePreview}
                            onChange={(e) => setUserActivityForms(prev => ({
                              ...prev,
                              newMessage: { ...prev.newMessage, messagePreview: e.target.value }
                            }))}
                          />
                        </div>
                        <Button
                          onClick={() => handleFormSubmit(
                            '/api/notifications/test-new-message',
                            userActivityForms.newMessage,
                            'New Message'
                          )}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                          Send New Message Notification
                        </Button>
                      </div>

                      <Separator />

                      {/* Comment Notification */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Comment Notification</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="commentUserId">User ID</Label>
                            <Input
                              id="commentUserId"
                              placeholder="1"
                              value={userActivityForms.comment.userId}
                              onChange={(e) => setUserActivityForms(prev => ({
                                ...prev,
                                comment: { ...prev.comment, userId: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="commenterName">Commenter Name</Label>
                            <Input
                              id="commenterName"
                              placeholder="Jane Smith"
                              value={userActivityForms.comment.commenterName}
                              onChange={(e) => setUserActivityForms(prev => ({
                                ...prev,
                                comment: { ...prev.comment, commenterName: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="contentTitle">Content Title</Label>
                          <Input
                            id="contentTitle"
                            placeholder="Project Management Tips"
                            value={userActivityForms.comment.contentTitle}
                            onChange={(e) => setUserActivityForms(prev => ({
                              ...prev,
                              comment: { ...prev.comment, contentTitle: e.target.value }
                            }))}
                          />
                        </div>
                        <Button
                          onClick={() => handleFormSubmit(
                            '/api/notifications/test-comment',
                            userActivityForms.comment,
                            'Comment'
                          )}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                          Send Comment Notification
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* System Notifications */}
                <TabsContent value="system" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-orange-600" />
                        System Notifications
                      </CardTitle>
                      <CardDescription>
                        Test system-wide notifications for maintenance and updates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Maintenance Alert */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Maintenance Alert</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="maintenanceTime">Maintenance Time</Label>
                            <Input
                              id="maintenanceTime"
                              placeholder="Saturday 2:00 AM - 4:00 AM EST"
                              value={systemNotificationForms.maintenance.maintenanceTime}
                              onChange={(e) => setSystemNotificationForms(prev => ({
                                ...prev,
                                maintenance: { ...prev.maintenance, maintenanceTime: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="maintenanceDetails">Details</Label>
                            <Input
                              id="maintenanceDetails"
                              placeholder="Database optimization and security updates"
                              value={systemNotificationForms.maintenance.details}
                              onChange={(e) => setSystemNotificationForms(prev => ({
                                ...prev,
                                maintenance: { ...prev.maintenance, details: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleFormSubmit(
                            '/api/notifications/test-maintenance-alert',
                            systemNotificationForms.maintenance,
                            'Maintenance Alert'
                          )}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                          Send Maintenance Alert
                        </Button>
                      </div>

                      <Separator />

                      {/* System Update */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">System Update Announcement</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="version">Version</Label>
                            <Input
                              id="version"
                              placeholder="2.5.1"
                              value={systemNotificationForms.systemUpdate.version}
                              onChange={(e) => setSystemNotificationForms(prev => ({
                                ...prev,
                                systemUpdate: { ...prev.systemUpdate, version: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="features">New Features</Label>
                            <Input
                              id="features"
                              placeholder="Enhanced chat, better performance, bug fixes"
                              value={systemNotificationForms.systemUpdate.features}
                              onChange={(e) => setSystemNotificationForms(prev => ({
                                ...prev,
                                systemUpdate: { ...prev.systemUpdate, features: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleFormSubmit(
                            '/api/notifications/test-system-update',
                            systemNotificationForms.systemUpdate,
                            'System Update'
                          )}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                          Send System Update Notification
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Transactional Notifications */}
                <TabsContent value="transactional" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-green-600" />
                        Transactional Notifications
                      </CardTitle>
                      <CardDescription>
                        Test order-related and payment notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Order Confirmation */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Order Confirmation</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="orderUserId">User ID</Label>
                            <Input
                              id="orderUserId"
                              placeholder="2"
                              value={transactionalForms.orderConfirmation.userId}
                              onChange={(e) => setTransactionalForms(prev => ({
                                ...prev,
                                orderConfirmation: { ...prev.orderConfirmation, userId: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="orderId">Order ID</Label>
                            <Input
                              id="orderId"
                              placeholder="ORD-001"
                              value={transactionalForms.orderConfirmation.orderId}
                              onChange={(e) => setTransactionalForms(prev => ({
                                ...prev,
                                orderConfirmation: { ...prev.orderConfirmation, orderId: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                              id="amount"
                              placeholder="$99.99"
                              value={transactionalForms.orderConfirmation.amount}
                              onChange={(e) => setTransactionalForms(prev => ({
                                ...prev,
                                orderConfirmation: { ...prev.orderConfirmation, amount: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleFormSubmit(
                            '/api/notifications/test-order-confirmation',
                            transactionalForms.orderConfirmation,
                            'Order Confirmation'
                          )}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                          Send Order Confirmation
                        </Button>
                      </div>

                      <Separator />

                      {/* Payment Failure */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Payment Failure</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="paymentUserId">User ID</Label>
                            <Input
                              id="paymentUserId"
                              placeholder="2"
                              value={transactionalForms.paymentFailure.userId}
                              onChange={(e) => setTransactionalForms(prev => ({
                                ...prev,
                                paymentFailure: { ...prev.paymentFailure, userId: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="failedOrderId">Order ID</Label>
                            <Input
                              id="failedOrderId"
                              placeholder="ORD-002"
                              value={transactionalForms.paymentFailure.orderId}
                              onChange={(e) => setTransactionalForms(prev => ({
                                ...prev,
                                paymentFailure: { ...prev.paymentFailure, orderId: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="reason">Failure Reason</Label>
                            <Input
                              id="reason"
                              placeholder="Insufficient funds"
                              value={transactionalForms.paymentFailure.reason}
                              onChange={(e) => setTransactionalForms(prev => ({
                                ...prev,
                                paymentFailure: { ...prev.paymentFailure, reason: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleFormSubmit(
                            '/api/notifications/test-payment-failure',
                            transactionalForms.paymentFailure,
                            'Payment Failure'
                          )}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                          Send Payment Failure Notification
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Reminders and Alerts */}
                <TabsContent value="reminders" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        Reminders and Alerts
                      </CardTitle>
                      <CardDescription>
                        Test event reminders and subscription alerts
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Event Reminder */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Event Reminder</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="eventUserId">User ID</Label>
                            <Input
                              id="eventUserId"
                              placeholder="1"
                              value={reminderForms.eventReminder.userId}
                              onChange={(e) => setReminderForms(prev => ({
                                ...prev,
                                eventReminder: { ...prev.eventReminder, userId: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="eventName">Event Name</Label>
                            <Input
                              id="eventName"
                              placeholder="Product Launch Webinar"
                              value={reminderForms.eventReminder.eventName}
                              onChange={(e) => setReminderForms(prev => ({
                                ...prev,
                                eventReminder: { ...prev.eventReminder, eventName: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="eventTime">Event Time</Label>
                            <Input
                              id="eventTime"
                              placeholder="3:00 PM EST"
                              value={reminderForms.eventReminder.eventTime}
                              onChange={(e) => setReminderForms(prev => ({
                                ...prev,
                                eventReminder: { ...prev.eventReminder, eventTime: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleFormSubmit(
                            '/api/notifications/test-event-reminder',
                            reminderForms.eventReminder,
                            'Event Reminder'
                          )}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                          Send Event Reminder
                        </Button>
                      </div>

                      <Separator />

                      {/* Subscription Renewal */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Subscription Renewal Reminder</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="subscriptionUserId">User ID</Label>
                            <Input
                              id="subscriptionUserId"
                              placeholder="1"
                              value={reminderForms.subscriptionRenewal.userId}
                              onChange={(e) => setReminderForms(prev => ({
                                ...prev,
                                subscriptionRenewal: { ...prev.subscriptionRenewal, userId: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                              id="expiryDate"
                              placeholder="March 15, 2025"
                              value={reminderForms.subscriptionRenewal.expiryDate}
                              onChange={(e) => setReminderForms(prev => ({
                                ...prev,
                                subscriptionRenewal: { ...prev.subscriptionRenewal, expiryDate: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleFormSubmit(
                            '/api/notifications/test-subscription-renewal',
                            reminderForms.subscriptionRenewal,
                            'Subscription Renewal'
                          )}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                          Send Subscription Renewal Reminder
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Marketing */}
                <TabsContent value="marketing" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-pink-600" />
                        Marketing and Promotional
                      </CardTitle>
                      <CardDescription>
                        Test promotional offers and marketing notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="offerTitle">Offer Title</Label>
                        <Input
                          id="offerTitle"
                          placeholder="Flash Sale - 50% Off"
                          value={marketingForm.offerTitle}
                          onChange={(e) => setMarketingForm(prev => ({ ...prev, offerTitle: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="offerDetails">Offer Details</Label>
                        <Textarea
                          id="offerDetails"
                          placeholder="Get 50% off on all premium software packages. Limited time offer!"
                          value={marketingForm.offerDetails}
                          onChange={(e) => setMarketingForm(prev => ({ ...prev, offerDetails: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="validUntil">Valid Until</Label>
                        <Input
                          id="validUntil"
                          placeholder="March 31, 2025"
                          value={marketingForm.validUntil}
                          onChange={(e) => setMarketingForm(prev => ({ ...prev, validUntil: e.target.value }))}
                        />
                      </div>
                      <Button
                        onClick={() => handleFormSubmit(
                          '/api/notifications/test-promotional-offer',
                          marketingForm,
                          'Promotional Offer'
                        )}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                        Send Promotional Offer
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Alerts */}
                <TabsContent value="security" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        Security Alerts
                      </CardTitle>
                      <CardDescription>
                        Test security-related notifications and alerts
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Unusual Login */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Unusual Login Alert</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="loginUserId">User ID</Label>
                            <Input
                              id="loginUserId"
                              placeholder="1"
                              value={securityForms.unusualLogin.userId}
                              onChange={(e) => setSecurityForms(prev => ({
                                ...prev,
                                unusualLogin: { ...prev.unusualLogin, userId: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              placeholder="New York, USA"
                              value={securityForms.unusualLogin.location}
                              onChange={(e) => setSecurityForms(prev => ({
                                ...prev,
                                unusualLogin: { ...prev.unusualLogin, location: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="device">Device</Label>
                            <Input
                              id="device"
                              placeholder="iPhone 15 Pro"
                              value={securityForms.unusualLogin.device}
                              onChange={(e) => setSecurityForms(prev => ({
                                ...prev,
                                unusualLogin: { ...prev.unusualLogin, device: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleFormSubmit(
                            '/api/notifications/test-unusual-login',
                            securityForms.unusualLogin,
                            'Unusual Login'
                          )}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                          Send Unusual Login Alert
                        </Button>
                      </div>

                      <Separator />

                      {/* Password Change */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Password Change Confirmation</h4>
                        <div>
                          <Label htmlFor="passwordUserId">User ID</Label>
                          <Input
                            id="passwordUserId"
                            placeholder="1"
                            value={securityForms.passwordChange.userId}
                            onChange={(e) => setSecurityForms(prev => ({
                              ...prev,
                              passwordChange: { ...prev.passwordChange, userId: e.target.value }
                            }))}
                          />
                        </div>
                        <Button
                          onClick={() => handleFormSubmit(
                            '/api/notifications/test-password-change',
                            securityForms.passwordChange,
                            'Password Change'
                          )}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                          Send Password Change Confirmation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bulk Notifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        Bulk Notifications
                      </CardTitle>
                      <CardDescription>
                        Send notifications to multiple users simultaneously
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="bulkTitle">Notification Title</Label>
                        <Input
                          id="bulkTitle"
                          placeholder="Important System Announcement"
                          value={bulkForm.title}
                          onChange={(e) => setBulkForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bulkBody">Message Body</Label>
                        <Textarea
                          id="bulkBody"
                          placeholder="This is an important announcement for all users..."
                          value={bulkForm.body}
                          onChange={(e) => setBulkForm(prev => ({ ...prev, body: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="userIds">User IDs (comma-separated)</Label>
                          <Input
                            id="userIds"
                            placeholder="1,2,3"
                            value={bulkForm.userIds}
                            onChange={(e) => setBulkForm(prev => ({ ...prev, userIds: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="clickAction">Click Action (optional)</Label>
                          <Input
                            id="clickAction"
                            placeholder="/dashboard"
                            value={bulkForm.clickAction}
                            onChange={(e) => setBulkForm(prev => ({ ...prev, clickAction: e.target.value }))}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          const userIds = bulkForm.userIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                          if (userIds.length === 0) {
                            toast({
                              title: 'Invalid User IDs',
                              description: 'Please provide valid comma-separated user IDs',
                              variant: 'destructive',
                            });
                            return;
                          }
                          handleFormSubmit(
                            '/api/notifications/test-bulk',
                            { ...bulkForm, userIds },
                            'Bulk Notification'
                          );
                        }}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                        Send Bulk Notifications
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Test Results/Logs Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Test Results</span>
                    <Badge variant="secondary">{testLogs.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Real-time notification test results and logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {testLogs.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No test results yet</p>
                        <p className="text-sm">Run a notification test to see results here</p>
                      </div>
                    ) : (
                      testLogs.map((log, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                          log.status === 'success' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {log.status === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium text-sm">{log.type}</span>
                            <span className="text-xs text-gray-500 ml-auto">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{log.message}</p>
                          {log.details?.messageId && (
                            <p className="text-xs text-gray-500 mt-1">
                              ID: {log.details.messageId}
                            </p>
                          )}
                          {log.details?.deliveredCount !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              Delivered: {log.details.deliveredCount}, Failed: {log.details.failedCount || 0}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}