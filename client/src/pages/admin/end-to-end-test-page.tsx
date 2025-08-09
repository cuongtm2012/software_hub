import React, { useState, useEffect } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Bell,
  Users,
  ShoppingCart,
  MessageSquare,
  Loader2,
  Eye,
  RefreshCw
} from 'lucide-react';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
  timestamp?: string;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
}

export default function EndToEndTestPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [currentScenario, setCurrentScenario] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testResults, setTestResults] = useState<any[]>([]);
  
  // Test user data
  const [testUserData, setTestUserData] = useState({
    email: 'test.user@softwarehub.com',
    name: 'Test User',
    userId: '12345'
  });

  // Test scenarios configuration
  const testScenarios: TestScenario[] = [
    {
      id: 'user_registration',
      name: '👥 User Registration Flow',
      description: 'Complete user registration with email and push notifications',
      steps: [
        {
          id: 'welcome_email',
          title: 'Send Welcome Email',
          description: 'Send welcome email with account activation link',
          status: 'pending'
        },
        {
          id: 'activation_email',
          title: 'Send Activation Email',
          description: 'Send account activation email with token',
          status: 'pending'
        },
        {
          id: 'registration_push',
          title: 'Send Welcome Push Notification',
          description: 'Send push notification welcoming new user',
          status: 'pending'
        }
      ]
    },
    {
      id: 'order_processing',
      name: '🛒 Order Processing Flow',
      description: 'Complete order processing with confirmations and notifications',
      steps: [
        {
          id: 'order_confirmation_email',
          title: 'Send Order Confirmation Email',
          description: 'Send email confirming order details and payment',
          status: 'pending'
        },
        {
          id: 'order_push',
          title: 'Send Order Confirmation Push',
          description: 'Send push notification for order confirmation',
          status: 'pending'
        },
        {
          id: 'project_notification_email',
          title: 'Send Project Update Email',
          description: 'Notify about project status update',
          status: 'pending'
        }
      ]
    },
    {
      id: 'security_alerts',
      name: '🔒 Security & Account Management',
      description: 'Security alerts and account management notifications',
      steps: [
        {
          id: 'password_reset_email',
          title: 'Send Password Reset Email',
          description: 'Send password reset email with secure token',
          status: 'pending'
        },
        {
          id: 'security_push',
          title: 'Send Security Alert Push',
          description: 'Send push notification for unusual login attempt',
          status: 'pending'
        },
        {
          id: 'password_change_push',
          title: 'Send Password Change Confirmation',
          description: 'Confirm password change via push notification',
          status: 'pending'
        }
      ]
    },
    {
      id: 'marketing_campaign',
      name: '📢 Marketing Campaign Flow',
      description: 'Marketing campaign with email and push notifications',
      steps: [
        {
          id: 'newsletter_email',
          title: 'Send Newsletter Confirmation',
          description: 'Send newsletter subscription confirmation email',
          status: 'pending'
        },
        {
          id: 'marketing_email',
          title: 'Send Marketing Email',
          description: 'Send promotional marketing email campaign',
          status: 'pending'
        },
        {
          id: 'promotional_push',
          title: 'Send Promotional Push',
          description: 'Send promotional push notification',
          status: 'pending'
        }
      ]
    },
    {
      id: 'system_notifications',
      name: '⚙️ System Notifications Flow',
      description: 'System maintenance and update notifications',
      steps: [
        {
          id: 'maintenance_push',
          title: 'Send Maintenance Alert',
          description: 'Send push notification about system maintenance',
          status: 'pending'
        },
        {
          id: 'system_update_push',
          title: 'Send System Update Notification',
          description: 'Notify users about system updates',
          status: 'pending'
        },
        {
          id: 'support_email',
          title: 'Send Support Notification',
          description: 'Send email notification to support team',
          status: 'pending'
        }
      ]
    }
  ];

  const [scenarios, setScenarios] = useState<TestScenario[]>(testScenarios);

  // Execute email test
  const executeEmailTest = async (stepId: string, emailType: string, additionalData: any = {}) => {
    const emailEndpoints: { [key: string]: string } = {
      'welcome_email': '/api/email/test-welcome',
      'activation_email': '/api/email/test-activation',
      'order_confirmation_email': '/api/email/test-order-confirmation',
      'password_reset_email': '/api/email/test-password-reset',
      'newsletter_email': '/api/email/test-newsletter-confirmation',
      'marketing_email': '/api/email/test-marketing',
      'project_notification_email': '/api/email/test-project-notification',
      'support_email': '/api/email/test-support-notification'
    };

    const endpoint = emailEndpoints[stepId];
    if (!endpoint) {
      throw new Error(`No endpoint found for step: ${stepId}`);
    }

    const payload = {
      userEmail: testUserData.email,
      userName: testUserData.name,
      ...additionalData
    };

    const response = await apiRequest('POST', endpoint, payload);
    return await response.json();
  };

  // Execute push notification test
  const executePushTest = async (stepId: string, additionalData: any = {}) => {
    const pushEndpoints: { [key: string]: string } = {
      'registration_push': '/api/notifications/test-new-message',
      'order_push': '/api/notifications/test-order-confirmation',
      'security_push': '/api/notifications/test-unusual-login',
      'password_change_push': '/api/notifications/test-password-change',
      'promotional_push': '/api/notifications/test-promotional-offer',
      'maintenance_push': '/api/notifications/test-maintenance-alert',
      'system_update_push': '/api/notifications/test-system-update'
    };

    const endpoint = pushEndpoints[stepId];
    if (!endpoint) {
      throw new Error(`No endpoint found for step: ${stepId}`);
    }

    const payload = {
      userId: testUserData.userId,
      ...additionalData
    };

    const response = await apiRequest('POST', endpoint, payload);
    return await response.json();
  };

  // Execute a single step
  const executeStep = async (scenarioId: string, stepId: string): Promise<any> => {
    const stepData: { [key: string]: any } = {
      // User Registration Flow
      'welcome_email': () => executeEmailTest(stepId, 'welcome', {}),
      'activation_email': () => executeEmailTest(stepId, 'activation', { 
        activationToken: 'test_token_' + Date.now() 
      }),
      'registration_push': () => executePushTest(stepId, { 
        senderName: 'SoftwareHub Team',
        messagePreview: 'Welcome to SoftwareHub! Your account is ready.'
      }),

      // Order Processing Flow
      'order_confirmation_email': () => executeEmailTest(stepId, 'order', {
        orderDetails: {
          orderId: 'ORDER-' + Date.now(),
          amount: '$149.99',
          items: ['Premium Software Package', 'Developer Tools License']
        }
      }),
      'order_push': () => executePushTest(stepId, {
        orderId: 'ORDER-' + Date.now(),
        amount: '$149.99'
      }),
      'project_notification_email': () => executeEmailTest(stepId, 'project', {
        projectDetails: {
          projectName: 'E-commerce Website',
          status: 'In Progress',
          message: 'Developer has started working on your project'
        }
      }),

      // Security & Account Management
      'password_reset_email': () => executeEmailTest(stepId, 'password-reset', {
        resetToken: 'reset_token_' + Date.now()
      }),
      'security_push': () => executePushTest(stepId, {
        location: 'New York, USA',
        device: 'Chrome Browser on Windows'
      }),
      'password_change_push': () => executePushTest(stepId, {}),

      // Marketing Campaign
      'newsletter_email': () => executeEmailTest(stepId, 'newsletter', {}),
      'marketing_email': () => executeEmailTest(stepId, 'marketing', {
        campaignData: {
          title: 'Special Offer - 50% Off Premium Plans',
          content: 'Limited time offer on all premium software packages!',
          ctaText: 'Claim Offer',
          ctaUrl: 'https://softwarehub.com/offers',
          validUntil: 'March 31, 2025'
        }
      }),
      'promotional_push': () => executePushTest(stepId, {
        offerTitle: 'Special Offer',
        offerDetails: '50% off all premium plans',
        validUntil: 'March 31, 2025'
      }),

      // System Notifications
      'maintenance_push': () => executePushTest(stepId, {
        maintenanceTime: '2:00 AM - 4:00 AM UTC',
        details: 'Scheduled system maintenance for performance improvements'
      }),
      'system_update_push': () => executePushTest(stepId, {
        version: '2.1.0',
        features: 'New dashboard, improved performance, bug fixes'
      }),
      'support_email': () => executeEmailTest(stepId, 'support', {
        supportEmail: 'support@softwarehub.com',
        userEmail: testUserData.email,
        subject: 'Test Support Request',
        message: 'This is a test support request from the end-to-end testing flow.'
      })
    };

    const executor = stepData[stepId];
    if (!executor) {
      throw new Error(`No executor found for step: ${stepId}`);
    }

    return await executor();
  };

  // Run complete scenario
  const runScenario = async (scenarioId: string) => {
    setIsRunning(true);
    setCurrentScenario(scenarioId);
    setTestProgress(0);

    const scenarioIndex = scenarios.findIndex(s => s.id === scenarioId);
    if (scenarioIndex === -1) return;

    const scenario = { ...scenarios[scenarioIndex] };
    const totalSteps = scenario.steps.length;

    try {
      for (let i = 0; i < scenario.steps.length; i++) {
        const step = scenario.steps[i];
        
        // Update step status to running
        scenario.steps[i] = { ...step, status: 'running', timestamp: new Date().toISOString() };
        setScenarios(prev => {
          const newScenarios = [...prev];
          newScenarios[scenarioIndex] = scenario;
          return newScenarios;
        });

        try {
          // Execute the step
          const result = await executeStep(scenarioId, step.id);
          
          // Update step status to success
          scenario.steps[i] = { 
            ...step, 
            status: 'success', 
            result,
            timestamp: new Date().toISOString()
          };

          toast({
            title: "Step Completed",
            description: `${step.title} completed successfully`,
          });

        } catch (error: any) {
          // Update step status to error
          scenario.steps[i] = { 
            ...step, 
            status: 'error', 
            error: error.message,
            timestamp: new Date().toISOString()
          };

          toast({
            title: "Step Failed",
            description: `${step.title}: ${error.message}`,
            variant: "destructive",
          });
        }

        // Update progress
        setTestProgress(((i + 1) / totalSteps) * 100);
        
        // Update scenarios state
        setScenarios(prev => {
          const newScenarios = [...prev];
          newScenarios[scenarioIndex] = scenario;
          return newScenarios;
        });

        // Small delay between steps for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Add to test results
      const result = {
        scenarioId,
        scenarioName: scenario.name,
        timestamp: new Date().toISOString(),
        totalSteps: totalSteps,
        successSteps: scenario.steps.filter(s => s.status === 'success').length,
        failedSteps: scenario.steps.filter(s => s.status === 'error').length,
        steps: scenario.steps
      };

      setTestResults(prev => [result, ...prev]);

      toast({
        title: "Scenario Completed",
        description: `${scenario.name} completed with ${result.successSteps}/${totalSteps} successful steps`,
      });

    } finally {
      setIsRunning(false);
      setCurrentScenario('');
      setTestProgress(0);
    }
  };

  // Reset scenario
  const resetScenario = (scenarioId: string) => {
    setScenarios(prev => prev.map(scenario => 
      scenario.id === scenarioId 
        ? {
            ...scenario,
            steps: scenario.steps.map(step => ({
              ...step,
              status: 'pending' as const,
              result: undefined,
              error: undefined,
              timestamp: undefined
            }))
          }
        : scenario
    ));
  };

  // Reset all scenarios
  const resetAllScenarios = () => {
    setScenarios(testScenarios.map(scenario => ({
      ...scenario,
      steps: scenario.steps.map(step => ({
        ...step,
        status: 'pending' as const,
        result: undefined,
        error: undefined,
        timestamp: undefined
      }))
    })));
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              End-to-End System Testing
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Complete functional flow testing for email and push notification systems
            </p>
          </div>
        </div>

        {/* Test Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Test Configuration
            </CardTitle>
            <CardDescription>
              Configure test user data for all scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="testEmail">Test Email</Label>
                <Input
                  id="testEmail"
                  value={testUserData.email}
                  onChange={(e) => setTestUserData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <Label htmlFor="testName">Test Name</Label>
                <Input
                  id="testName"
                  value={testUserData.name}
                  onChange={(e) => setTestUserData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Test User"
                />
              </div>
              <div>
                <Label htmlFor="testUserId">Test User ID</Label>
                <Input
                  id="testUserId"
                  value={testUserData.userId}
                  onChange={(e) => setTestUserData(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="12345"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-6">
              <Button
                onClick={resetAllScenarios}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset All Tests
              </Button>
              <Badge variant="outline">
                Total Scenarios: {scenarios.length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        {isRunning && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-medium">Running: {currentScenario}</span>
                </div>
                <span className="text-sm text-gray-600">{Math.round(testProgress)}%</span>
              </div>
              <Progress value={testProgress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Test Scenarios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => runScenario(scenario.id)}
                      disabled={isRunning}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Run
                    </Button>
                    <Button
                      onClick={() => resetScenario(scenario.id)}
                      disabled={isRunning}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scenario.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50/50 dark:bg-gray-800/50">
                      <div className="flex-shrink-0">
                        {step.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                        {step.status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                        {step.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {step.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{step.title}</span>
                          <Badge variant="outline" className="text-xs">
                            Step {index + 1}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {step.description}
                        </p>
                        
                        {step.error && (
                          <Alert className="mt-2">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              {step.error}
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {step.result && (
                          <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                            ✓ {step.result.message || 'Completed successfully'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Test Results History */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Test Results History
              </CardTitle>
              <CardDescription>
                Previous test executions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{result.scenarioName}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.failedSteps > 0 ? "destructive" : "default"}>
                          {result.successSteps}/{result.totalSteps} Passed
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex gap-4">
                        <span className="text-green-600">✓ {result.successSteps} successful</span>
                        {result.failedSteps > 0 && (
                          <span className="text-red-600">✗ {result.failedSteps} failed</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}