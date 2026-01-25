import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, Send, Users, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TargetAudience = "all" | "seller" | "buyer";

interface NotificationFormData {
    message: string;
    target: TargetAudience;
}

export function AdminNotificationPanel() {
    const [message, setMessage] = useState("");
    const [target, setTarget] = useState<TargetAudience>("all");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const sendNotificationMutation = useMutation({
        mutationFn: async (data: NotificationFormData) => {
            const response = await fetch("/api/admin/notifications/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to send notification");
            }

            return response.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Notification Sent",
                description: `Successfully sent to ${data.recipientCount} users`,
            });
            setMessage("");
            queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications/history"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to Send",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleSend = () => {
        if (!message.trim()) {
            toast({
                title: "Message Required",
                description: "Please enter a message to send",
                variant: "destructive",
            });
            return;
        }

        sendNotificationMutation.mutate({ message: message.trim(), target });
    };

    const getTargetDescription = () => {
        switch (target) {
            case "all":
                return "All users will receive this notification";
            case "seller":
                return "Only sellers will receive this notification";
            case "buyer":
                return "Only buyers will receive this notification";
        }
    };

    return (
        <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Broadcast Notification</CardTitle>
                        <CardDescription>Send notifications to users</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Target Audience */}
                <div className="space-y-2">
                    <Label htmlFor="target">Target Audience</Label>
                    <Select value={target} onValueChange={(value) => setTarget(value as TargetAudience)}>
                        <SelectTrigger id="target">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>All Users</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="seller">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Sellers Only</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="buyer">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Buyers Only</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">{getTargetDescription()}</p>
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                        id="message"
                        placeholder="Enter your notification message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                        {message.length} / 500 characters
                    </p>
                </div>

                {/* Preview */}
                {message.trim() && (
                    <Alert className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-sm">
                            <strong>Preview:</strong> {message.trim()}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Send Button */}
                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || sendNotificationMutation.isPending}
                    className="w-full"
                >
                    {sendNotificationMutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Notification
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
