import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function TestLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      try {
        const response = await apiRequest("POST", "/api/login", data);
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Logged in successfully!" });
      setLocation("/");
      window.location.reload(); // Refresh to update auth state
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    }
  });

  const handleTestLogin = async (email: string, role: string) => {
    try {
      const password = email === "cuongeurovnn@gmail.com" ? "abcd@1234" : "testpassword";
      setCredentials({ email, password });
      await loginMutation.mutateAsync({ email, password });
    } catch (error) {
      // Error is already handled by onError callback
      console.error('Login error:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync(credentials);
    } catch (error) {
      // Error is already handled by onError callback
      console.error('Login error:', error);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Test Login</h2>
            <p className="mt-2 text-gray-600">Login with test accounts to test the marketplace workflow</p>
          </div>

          {/* Quick Test Login Buttons */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Test Login</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleTestLogin("seller@test.com", "seller")}
                  disabled={loginMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Login as Test Seller
                </Button>
                <Button 
                  onClick={() => handleTestLogin("buyer@test.com", "buyer")}
                  disabled={loginMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Login as Test Buyer
                </Button>
                <Button 
                  onClick={() => handleTestLogin("cuongeurovnn@gmail.com", "admin")}
                  disabled={loginMutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Login as Admin
                </Button>
              </CardContent>
            </Card>

            {/* Manual Login Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manual Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loginMutation.isPending}
                    className="w-full"
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Test Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Account Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>
                <strong>Seller Account:</strong><br />
                Email: seller@test.com<br />
                Password: testpassword<br />
                Role: seller (can create and manage products)
              </div>
              <div>
                <strong>Buyer Account:</strong><br />
                Email: buyer@test.com<br />
                Password: testpassword<br />
                Role: buyer (can purchase products)
              </div>
              <div>
                <strong>Admin Account:</strong><br />
                Email: cuongeurovnn@gmail.com<br />
                Password: abcd@1234<br />
                Role: admin (full system access)
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}