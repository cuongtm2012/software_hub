import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
// @ts-ignore - vietqr doesn't have TypeScript definitions
import { VietQR } from 'vietqr';

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

const sellerRegistrationSchema = z.object({
  business_name: z.string().min(2, "Business / Store Name is required"),
  contact_phone: z.string().min(10, "Contact Phone Number is required"),
  contact_email: z.string().email("Valid Contact Email is required"),
  business_address: z.string().min(10, "Business Address is required"),
  tax_id: z.string().min(1, "Tax ID / Registration Number is required"),
  bank_code: z.string().min(1, "Bank selection is required"),
  bank_name: z.string().min(2, "Bank Name is required"),
  account_number: z.string().min(5, "Account Number is required"),
  account_holder_name: z.string().min(2, "Account Holder Name is required"),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: "You must agree to the Seller Terms and Conditions"
  }),
});

type SellerRegistrationForm = z.infer<typeof sellerRegistrationSchema>;

// Initialize VietQR client
const vietQR = new VietQR({
  clientID: '27f69663-48e7-430e-88a5-c5f4ae1fbbe5',
  apiKey: '64c1060c-098a-4b19-b272-d56f12e70583',
});

export default function SellerRegistrationPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);

  const form = useForm<SellerRegistrationForm>({
    resolver: zodResolver(sellerRegistrationSchema),
    defaultValues: {
      business_name: "",
      contact_phone: user?.phone || "",
      contact_email: user?.email || "",
      business_address: "",
      tax_id: "",
      bank_code: "",
      bank_name: "",
      account_number: "",
      account_holder_name: "",
      terms_accepted: false,
    },
  });

  // Load banks from VietQR API
  useEffect(() => {
    const loadBanks = async () => {
      try {
        setIsLoadingBanks(true);
        const banksList = await vietQR.getBanks();
        setBanks((banksList as any).data || []);
      } catch (error) {
        console.error('Error loading banks:', error);
        toast({
          title: "Error",
          description: "Failed to load banks list. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingBanks(false);
      }
    };

    loadBanks();
  }, [toast]);

  // Handle bank selection
  const handleBankSelect = (bankCode: string) => {
    const selectedBank = banks.find(bank => bank.code === bankCode);
    if (selectedBank) {
      form.setValue('bank_code', bankCode);
      form.setValue('bank_name', selectedBank.shortName);
    }
  };

  // Check if user already has a seller profile
  const { data: sellerProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/seller/profile"],
    enabled: !!user,
  });

  const registerMutation = useMutation({
    mutationFn: async (data: SellerRegistrationForm) => {
      // Combine bank information into single bank_account field
      const bankAccount = JSON.stringify({
        bank_code: data.bank_code,
        bank_name: data.bank_name,
        account_number: data.account_number,
        account_holder_name: data.account_holder_name
      });

      return apiRequest("/api/seller/register", "POST", {
        business_name: data.business_name,
        business_type: "individual", // Default to individual for now
        tax_id: data.tax_id,
        business_address: data.business_address,
        bank_account: bankAccount,
        verification_documents: uploadedFiles,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/profile"] });
      setIsSubmitted(true);
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
    console.log('Form submission data:', data);
    
    if (!data.terms_accepted) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Seller Terms and Conditions to continue.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Submitting seller registration...');
    registerMutation.mutate(data);
  };

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest("/api/objects/upload", "POST", {}) as { uploadURL: string };
      return {
        method: "PUT" as const,
        url: response.uploadURL,
      };
    } catch (error) {
      throw new Error("Failed to get upload URL");
    }
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    const newFiles = result.successful?.map(file => file.uploadURL || "") || [];
    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast({
      title: "Upload Complete",
      description: `${result.successful?.length || 0} file(s) uploaded successfully.`,
    });
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

  // Show success message after submission
  if (isSubmitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for registering as a seller. Your application is under review. 
                We will notify you once approved.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // If user already has a seller profile, show status
  if ((sellerProfile as any)?.seller_profile) {
    const profile = (sellerProfile as any).seller_profile;
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Register as a Seller</h1>
          </div>

          {/* Registration Form */}
          <Card>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Business / Store Name */}
                  <FormField
                    control={form.control}
                    name="business_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Business / Store Name</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} className="border-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contact Phone Number */}
                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Contact Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} className="border-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contact Email */}
                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Contact Email</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} className="border-gray-300" disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Business Address */}
                  <FormField
                    control={form.control}
                    name="business_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Business Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="" 
                            className="min-h-[80px] border-gray-300"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tax ID / Registration Number */}
                  <FormField
                    control={form.control}
                    name="tax_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Tax ID / Registration Number</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} className="border-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Upload Documents */}
                  <div className="space-y-2">
                    <FormLabel className="text-base font-medium">Upload Documents</FormLabel>
                    <ObjectUploader
                      maxNumberOfFiles={5}
                      maxFileSize={10485760}
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handleUploadComplete}
                      buttonClassName="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      Choose File
                    </ObjectUploader>
                    <p className="text-sm text-gray-500">
                      (Allowed formats: PDF, JPG, PNG)
                      <br />
                      <em>Upload your business license or ID proof</em>
                    </p>
                    {uploadedFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600">
                          {uploadedFiles.length} file(s) uploaded successfully
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* Payment Details Header */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                  </div>

                  {/* Bank Selection */}
                  <FormField
                    control={form.control}
                    name="bank_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Select Bank</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          handleBankSelect(value);
                        }} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-gray-300">
                              <SelectValue placeholder={isLoadingBanks ? "Loading banks..." : "Select your bank"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {isLoadingBanks ? (
                              <SelectItem value="loading" disabled>Loading banks...</SelectItem>
                            ) : banks.length > 0 ? (
                              banks.map((bank) => (
                                <SelectItem key={bank.code} value={bank.code}>
                                  {bank.shortName} - {bank.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>No banks available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bank Name (Auto-filled) */}
                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Bank Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Bank name will be auto-filled" 
                            {...field} 
                            className="border-gray-300 bg-gray-50" 
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Account Number */}
                  <FormField
                    control={form.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} className="border-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Account Holder Name */}
                  <FormField
                    control={form.control}
                    name="account_holder_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Account Holder Name</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} className="border-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-6" />

                  {/* Terms and Conditions */}
                  <FormField
                    control={form.control}
                    name="terms_accepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base">
                            I agree to the Seller Terms and Conditions
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Separator className="my-6" />

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={registerMutation.isPending || !form.watch("terms_accepted")}
                    >
                      {registerMutation.isPending ? "Submitting..." : "Submit"}
                    </Button>
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