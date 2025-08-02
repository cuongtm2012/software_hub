import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Store, 
  Upload, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Shield, 
  User, 
  Building2, 
  CreditCard, 
  FileText,
  Mail,
  Phone,
  AlertCircle
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const sellerRegistrationSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  business_type: z.enum(["individual", "company"], {
    required_error: "Please select a business type",
  }),
  tax_id: z.string().optional(),
  business_address: z.string().min(10, "Please provide a complete business address"),
  bank_account: z.string().min(5, "Please provide bank account details"),
  phone: z.string().min(10, "Please provide a valid phone number"),
});

type SellerRegistrationForm = z.infer<typeof sellerRegistrationSchema>;

export default function SellerRegistrationPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const form = useForm<SellerRegistrationForm>({
    resolver: zodResolver(sellerRegistrationSchema),
    defaultValues: {
      business_name: "",
      business_type: "individual",
      tax_id: "",
      business_address: "",
      bank_account: "",
      phone: user?.phone || "",
    },
  });

  // Check if user already has a seller profile
  const { data: sellerProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/seller/profile"],
    enabled: !!user,
  });

  const registerMutation = useMutation({
    mutationFn: async (data: SellerRegistrationForm) => {
      return apiRequest("/api/seller/register", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          verification_documents: uploadedFiles,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/profile"] });
      toast({
        title: "Registration Submitted",
        description: "Your seller registration has been submitted for review. You'll be notified once verified.",
      });
      navigate("/seller/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SellerRegistrationForm) => {
    registerMutation.mutate(data);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-gray-600 mb-4">Please log in to register as a seller.</p>
              <Button onClick={() => navigate("/auth")}>Login</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (profileLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004080]"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // If user already has a seller profile, show status
  if (sellerProfile?.seller_profile) {
    const profile = sellerProfile.seller_profile;
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Seller Registration Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                {profile.verification_status === "verified" && (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <Badge className="bg-green-100 text-green-800">Verified Seller</Badge>
                  </>
                )}
                {profile.verification_status === "pending" && (
                  <>
                    <Clock className="h-6 w-6 text-yellow-500" />
                    <Badge className="bg-yellow-100 text-yellow-800">Verification Pending</Badge>
                  </>
                )}
                {profile.verification_status === "rejected" && (
                  <>
                    <XCircle className="h-6 w-6 text-red-500" />
                    <Badge className="bg-red-100 text-red-800">Verification Rejected</Badge>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Name</label>
                  <p className="font-medium">{profile.business_name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Type</label>
                  <p className="font-medium capitalize">{profile.business_type || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Sales</label>
                  <p className="font-medium">${Number(profile.total_sales || 0).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Rating</label>
                  <p className="font-medium">
                    {profile.rating ? `${Number(profile.rating).toFixed(1)} ⭐` : "No ratings yet"}
                  </p>
                </div>
              </div>

              {profile.verification_status === "verified" && (
                <Button onClick={() => navigate("/seller/dashboard")} className="w-full">
                  Go to Seller Dashboard
                </Button>
              )}

              {profile.verification_status === "pending" && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Your seller registration is being reviewed. This typically takes 1-2 business days.
                  </AlertDescription>
                </Alert>
              )}

              {profile.verification_status === "rejected" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your seller registration was rejected. Please contact support for more information.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const steps = [
    { number: 1, title: "Business Information", icon: Building2 },
    { number: 2, title: "Contact Details", icon: User },
    { number: 3, title: "Payment & Verification", icon: CreditCard },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Seller</h1>
            <p className="text-gray-600">Join our marketplace and start selling your digital products</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? "bg-[#004080] border-[#004080] text-white" 
                    : "border-gray-300 text-gray-500"
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="ml-3 text-sm">
                  <div className={`font-medium ${currentStep >= step.number ? "text-[#004080]" : "text-gray-500"}`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-4 h-0.5 w-16 ${
                    currentStep > step.number ? "bg-[#004080]" : "bg-gray-300"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Seller Registration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Step 1: Business Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="business_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your business name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="business_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select business type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="individual">Individual/Freelancer</SelectItem>
                                <SelectItem value="company">Company/Business</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tax_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax ID (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter tax identification number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="business_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Address *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter your complete business address" 
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 2: Contact Details */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Mail className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-600">Email: {user.email}</span>
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      </div>

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Phone Number *
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          We'll send an SMS verification code to this number to verify your identity.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Step 3: Payment & Verification */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="bank_account"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Bank Account Information *
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter your bank account details for payments" 
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4" />
                          Verification Documents (Optional)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Upload business license, ID, or other verification documents
                          </p>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            id="documents"
                            onChange={(e) => {
                              if (e.target.files) {
                                const fileNames = Array.from(e.target.files).map(f => f.name);
                                setUploadedFiles(fileNames);
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => document.getElementById('documents')?.click()}
                          >
                            Choose Files
                          </Button>
                        </div>
                        {uploadedFiles.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Uploaded files:</p>
                            <ul className="text-sm text-gray-800">
                              {uploadedFiles.map((file, index) => (
                                <li key={index}>• {file}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Commission Rate:</strong> We charge a 10% commission on all sales. 
                          You'll receive 90% of each sale directly to your bank account.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <Separator />
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                      disabled={currentStep === 1}
                    >
                      Previous
                    </Button>

                    {currentStep < 3 ? (
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                        className="bg-[#004080] hover:bg-[#003366]"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="bg-[#004080] hover:bg-[#003366]"
                      >
                        {registerMutation.isPending ? "Submitting..." : "Submit Registration"}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}