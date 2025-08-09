import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, ExternalLink, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function VapidKeySetup() {
  const [vapidKey, setVapidKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateVapidKey = (key: string) => {
    // Basic VAPID key validation - should be base64url encoded and around 65 characters
    return key.length >= 60 && key.match(/^[A-Za-z0-9_-]+$/);
  };

  const handleSave = () => {
    if (!vapidKey.trim()) {
      toast({
        title: "VAPID Key Required",
        description: "Please enter your VAPID key from Firebase Console.",
        variant: "destructive",
      });
      return;
    }

    if (!validateVapidKey(vapidKey)) {
      toast({
        title: "Invalid VAPID Key",
        description: "The VAPID key format appears to be invalid. Please check and try again.",
        variant: "destructive",
      });
      return;
    }

    // Store in localStorage for now (in production, this should be environment variable)
    localStorage.setItem('fcm-vapid-key', vapidKey);
    
    toast({
      title: "VAPID Key Saved",
      description: "Please refresh the page to apply the new VAPID key.",
    });
  };

  const handleOpenFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/project/softwarehub-f301a/settings/cloudmessaging', '_blank');
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Key className="h-5 w-5" />
          VAPID Key Setup Required
        </CardTitle>
        <CardDescription className="text-orange-700">
          To enable browser push notifications, you need to configure a VAPID key from Firebase Console.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Push notifications will not work until you complete this setup. This is a one-time configuration.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Step 1: Get VAPID Key from Firebase</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenFirebaseConsole}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Firebase Console
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <p>In Firebase Console:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to Project Settings → Cloud Messaging</li>
              <li>Scroll to "Web configuration" section</li>
              <li>In "Web Push certificates", click "Generate Key Pair"</li>
              <li>Copy the generated public key</li>
            </ol>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vapidKey">Step 2: Paste VAPID Key Here</Label>
          <Input
            id="vapidKey"
            placeholder="BCrr8xjQFtKcTjdM3dNmF7_4SfqAgOYs3wl0aMGBZXQC..."
            value={vapidKey}
            onChange={(e) => setVapidKey(e.target.value)}
            className="font-mono text-sm"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isValidating || !vapidKey.trim()}
          className="w-full"
        >
          Save VAPID Key & Enable Notifications
        </Button>

        {vapidKey && !validateVapidKey(vapidKey) && (
          <Alert variant="destructive">
            <AlertDescription>
              VAPID key format appears invalid. It should be a base64url-encoded string of about 65 characters.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}