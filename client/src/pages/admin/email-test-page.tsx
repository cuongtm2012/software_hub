import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Send, CheckCircle, XCircle, Loader2, TestTube, Users, Settings } from "lucide-react";

export default function EmailTestPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Single Email Test State
  const [singleTestData, setSingleTestData] = useState({
    testType: '',
    userEmail: 'cuongeurovnn@gmail.com',
    userName: 'Cuong Euro VN',
    additionalData: {}
  });

  // Bulk Test State
  const [bulkTestData, setBulkTestData] = useState({
    recipients: [{ email: 'cuongeurovnn@gmail.com', name: 'Cuong Euro VN' }],
    campaignData: {
      subject: 'Test Marketing Campaign',
      title: 'Special Offer',
      content: '<p>This is a test marketing email!</p>',
      ctaText: 'Learn More',
      ctaUrl: 'https://example.com'
    }
  });

  // Test Results State
  const [testResults, setTestResults] = useState<any[]>([]);

  // Single Email Test Mutation
  const singleTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      const response = await apiRequest("POST", "/api/email/test", testData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Test Email Sent",
        description: `${data.testType} email sent successfully to ${data.userEmail || singleTestData.userEmail}`,
      });
      
      setTestResults(prev => [{
        ...data,
        timestamp: new Date().toISOString(),
        type: 'single'
      }, ...prev]);
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
      
      setTestResults(prev => [{
        success: false,
        error: error.message,
        testType: singleTestData.testType,
        userEmail: singleTestData.userEmail,
        timestamp: new Date().toISOString(),
        type: 'single'
      }, ...prev]);
    }
  });

  // Bulk Email Test Mutation
  const bulkTestMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const response = await apiRequest("POST", "/api/email/marketing-campaign", campaignData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bulk Test Completed",
        description: `${data.summary.successful}/${data.summary.total} emails sent successfully`,
      });
      
      setTestResults(prev => [{
        ...data,
        timestamp: new Date().toISOString(),
        type: 'bulk'
      }, ...prev]);
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Test Failed",
        description: error.message || "Failed to send bulk emails",
        variant: "destructive",
      });
    }
  });

  const handleSingleTest = () => {
    if (!singleTestData.testType || !singleTestData.userEmail) {
      toast({
        title: "Missing Information",
        description: "Please select test type and enter email address",
        variant: "destructive",
      });
      return;
    }

    singleTestMutation.mutate(singleTestData);
  };

  const handleBulkTest = () => {
    const validRecipients = bulkTestData.recipients.filter(r => r.email);
    
    if (validRecipients.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please add at least one valid email address",
        variant: "destructive",
      });
      return;
    }

    bulkTestMutation.mutate({
      recipients: validRecipients,
      campaignData: bulkTestData.campaignData
    });
  };

  const addRecipient = () => {
    setBulkTestData(prev => ({
      ...prev,
      recipients: [...prev.recipients, { email: '', name: 'Test User' }]
    }));
  };

  const removeRecipient = (index: number) => {
    setBulkTestData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const updateRecipient = (index: number, field: string, value: string) => {
    setBulkTestData(prev => ({
      ...prev,
      recipients: prev.recipients.map((recipient, i) => 
        i === index ? { ...recipient, [field]: value } : recipient
      )
    }));
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Service Testing</h1>
          <p className="text-gray-600">Test all email scenarios and validate email service functionality</p>
        </div>

        <Tabs defaultValue="single" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">Single Email Tests</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Email Tests</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>

          {/* Single Email Tests */}
          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Single Email Test Scenarios
                </CardTitle>
                <CardDescription>
                  Test individual email types with custom parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-type">Email Test Type</Label>
                    <Select 
                      value={singleTestData.testType} 
                      onValueChange={(value) => setSingleTestData(prev => ({ ...prev, testType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">Welcome Email</SelectItem>
                        <SelectItem value="activation">Account Activation</SelectItem>
                        <SelectItem value="password-reset">Password Reset</SelectItem>
                        <SelectItem value="order-confirmation">Order Confirmation</SelectItem>
                        <SelectItem value="project-notification">Project Notification</SelectItem>
                        <SelectItem value="newsletter-confirmation">Newsletter Subscription</SelectItem>
                        <SelectItem value="account-deactivation">Account Deactivation</SelectItem>
                        <SelectItem value="account-reactivation">Account Reactivation</SelectItem>
                        <SelectItem value="marketing">Marketing Email</SelectItem>
                        <SelectItem value="support-notification">Support Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-email">Test Email Address</Label>
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="test@example.com"
                      value={singleTestData.userEmail}
                      onChange={(e) => setSingleTestData(prev => ({ ...prev, userEmail: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-name">Test User Name</Label>
                    <Input
                      id="user-name"
                      placeholder="Test User"
                      value={singleTestData.userName}
                      onChange={(e) => setSingleTestData(prev => ({ ...prev, userName: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Test Type Specific Fields */}
                {singleTestData.testType === 'order-confirmation' && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold">Order Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        placeholder="Order ID" 
                        onChange={(e) => setSingleTestData(prev => ({
                          ...prev,
                          additionalData: { ...prev.additionalData, orderDetails: { ...prev.additionalData.orderDetails, orderId: e.target.value }}
                        }))}
                      />
                      <Input 
                        placeholder="Product Name" 
                        onChange={(e) => setSingleTestData(prev => ({
                          ...prev,
                          additionalData: { ...prev.additionalData, orderDetails: { ...prev.additionalData.orderDetails, productName: e.target.value }}
                        }))}
                      />
                      <Input 
                        placeholder="Amount" 
                        onChange={(e) => setSingleTestData(prev => ({
                          ...prev,
                          additionalData: { ...prev.additionalData, orderDetails: { ...prev.additionalData.orderDetails, amount: e.target.value }}
                        }))}
                      />
                      <Input 
                        placeholder="Status" 
                        onChange={(e) => setSingleTestData(prev => ({
                          ...prev,
                          additionalData: { ...prev.additionalData, orderDetails: { ...prev.additionalData.orderDetails, status: e.target.value }}
                        }))}
                      />
                    </div>
                  </div>
                )}

                {singleTestData.testType === 'project-notification' && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold">Project Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        placeholder="Project Title" 
                        onChange={(e) => setSingleTestData(prev => ({
                          ...prev,
                          additionalData: { ...prev.additionalData, projectTitle: e.target.value }
                        }))}
                      />
                      <Select onValueChange={(value) => setSingleTestData(prev => ({
                        ...prev,
                        additionalData: { ...prev.additionalData, status: value }
                      }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {singleTestData.testType === 'support-notification' && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold">Support Request</h4>
                    <Input 
                      placeholder="Subject" 
                      onChange={(e) => setSingleTestData(prev => ({
                        ...prev,
                        additionalData: { ...prev.additionalData, subject: e.target.value }
                      }))}
                    />
                    <Textarea 
                      placeholder="Support message..." 
                      onChange={(e) => setSingleTestData(prev => ({
                        ...prev,
                        additionalData: { ...prev.additionalData, message: e.target.value }
                      }))}
                    />
                  </div>
                )}

                <Button 
                  onClick={handleSingleTest} 
                  disabled={singleTestMutation.isPending}
                  className="w-full"
                >
                  {singleTestMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Test Email
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Email Tests */}
          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Bulk Email Campaign Test
                </CardTitle>
                <CardDescription>
                  Test marketing email campaigns with multiple recipients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recipients */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Recipients</Label>
                    <Button variant="outline" size="sm" onClick={addRecipient}>
                      Add Recipient
                    </Button>
                  </div>
                  
                  {bulkTestData.recipients.map((recipient, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Email"
                        value={recipient.email}
                        onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                      />
                      <Input
                        placeholder="Name"
                        value={recipient.name}
                        onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                      />
                      {bulkTestData.recipients.length > 1 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeRecipient(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Campaign Data */}
                <div className="space-y-4">
                  <Label>Campaign Content</Label>
                  <Input
                    placeholder="Email Subject"
                    value={bulkTestData.campaignData.subject}
                    onChange={(e) => setBulkTestData(prev => ({
                      ...prev,
                      campaignData: { ...prev.campaignData, subject: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="Campaign Title"
                    value={bulkTestData.campaignData.title}
                    onChange={(e) => setBulkTestData(prev => ({
                      ...prev,
                      campaignData: { ...prev.campaignData, title: e.target.value }
                    }))}
                  />
                  <Textarea
                    placeholder="Email content (HTML allowed)"
                    value={bulkTestData.campaignData.content}
                    onChange={(e) => setBulkTestData(prev => ({
                      ...prev,
                      campaignData: { ...prev.campaignData, content: e.target.value }
                    }))}
                    rows={4}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Call-to-Action Text"
                      value={bulkTestData.campaignData.ctaText}
                      onChange={(e) => setBulkTestData(prev => ({
                        ...prev,
                        campaignData: { ...prev.campaignData, ctaText: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Call-to-Action URL"
                      value={bulkTestData.campaignData.ctaUrl}
                      onChange={(e) => setBulkTestData(prev => ({
                        ...prev,
                        campaignData: { ...prev.campaignData, ctaUrl: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleBulkTest} 
                  disabled={bulkTestMutation.isPending}
                  className="w-full"
                >
                  {bulkTestMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Send Bulk Test Campaign
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Results */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Test Results
                  </div>
                  {testResults.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearResults}>
                      Clear Results
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  View results and logs from email tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No test results yet. Run some email tests to see results here.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <Badge variant={result.type === 'bulk' ? 'secondary' : 'default'}>
                              {result.type === 'bulk' ? 'Bulk Test' : 'Single Test'}
                            </Badge>
                            {result.testType && (
                              <Badge variant="outline">{result.testType}</Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(result.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        {result.type === 'single' ? (
                          <div>
                            <p className="text-sm">
                              <strong>Email:</strong> {result.userEmail}
                            </p>
                            {result.messageId && (
                              <p className="text-sm text-green-600">
                                <strong>Message ID:</strong> {result.messageId}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm">
                              <strong>Recipients:</strong> {result.summary?.total || 0} 
                              (Success: {result.summary?.successful || 0}, Failed: {result.summary?.failed || 0})
                            </p>
                          </div>
                        )}
                        
                        {result.error && (
                          <p className="text-sm text-red-600">
                            <strong>Error:</strong> {result.error}
                          </p>
                        )}
                        
                        {result.message && (
                          <p className="text-sm text-gray-700">
                            {result.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}