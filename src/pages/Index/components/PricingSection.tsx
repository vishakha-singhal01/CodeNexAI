import React, { useState } from 'react'; // Import useState
import { Check, Loader2 } from "lucide-react"; // Import Loader2
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useToast } from "@/components/ui/use-toast"; // Import useToast

// Define Razorpay type for window object
// This should be placed outside the component, typically at the top level of the file or in a dedicated types file.
declare global {
  interface Window {
    Razorpay: any; // Reverting to 'any' for simplicity to resolve call signature errors
  }
}

// Define interfaces for expected Razorpay response structures
interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayPaymentFailedResponse {
  error: {
    code: string;
    description: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
}


export const PricingSection = () => {
  const { user, checkAuthStatus } = useAuth(); // Use checkAuthStatus instead of fetchUser
  const navigate = useNavigate();
  const [isLoadingPro, setIsLoadingPro] = useState(false); // Loading state for Pro button
  const { toast } = useToast(); // Initialize toast

  const handleGetStartedClick = async (plan: 'free' | 'pro' | 'enterprise') => { // Make async
    if (!user) {
      // If not logged in, redirect to login page, potentially passing intended plan
      navigate('/login'); // Adjust '/login' if your route is different
      return; // Stop execution
    }

    // If logged in:
    if (plan === 'enterprise') {
      navigate('/contact'); // Redirect to contact page for Enterprise
    } else if (plan === 'pro') {
      // --- Start Pro Plan Payment Flow ---
      setIsLoadingPro(true);
      toast({ title: "Initiating Pro Plan Upgrade..." });

      try {
        // 1. Call backend to create Razorpay order
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'; // Fallback for local dev
        const response = await fetch(`${apiBaseUrl}/api/payments/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Include credentials/auth token if your API requires it
            // This assumes cookie-based session auth is handled automatically by the browser
          },
          credentials: 'include', // <-- ADD THIS LINE: Send cookies with cross-origin requests
          body: JSON.stringify({
            amount: 230000, // ₹2300 in paise (approx $29 USD)
            currency: 'INR',
            userId: user.id, // Use user.id based on AuthContext
            // receipt: `receipt_${user.id}_${Date.now()}` // Optional: custom receipt
          }),
        });

        if (!response.ok) {
          let errorData = { message: `HTTP error! status: ${response.status}` };
          try {
            errorData = await response.json();
          } catch (e) { /* Ignore JSON parsing error if body is not JSON */ }
          throw new Error(errorData.message || `Failed to create payment order (Status: ${response.status})`);
        }

        const orderData = await response.json();
        const { orderId, amount: orderAmount, currency: orderCurrency } = orderData;

        // 2. Open Razorpay Checkout
        const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKeyId || razorpayKeyId === 'YOUR_RAZORPAY_KEY_ID') {
          console.error("Razorpay Key ID not found or not configured in frontend environment variables (.env).");
          toast({ variant: "destructive", title: "Configuration Error", description: "Payment gateway is not configured correctly. Please set VITE_RAZORPAY_KEY_ID." });
          setIsLoadingPro(false);
          return;
        }

        const options = {
          key: razorpayKeyId,
          amount: orderAmount, // Amount is in currency subunits.
          currency: orderCurrency,
          name: "Code Whisper Docs", // Your business name
          description: "Pro Plan Upgrade",
          // image: "/logo.png", // Optional: Link to your logo in the public folder
          order_id: orderId, // Pass the order ID from the backend
          handler: function (response: RazorpayPaymentSuccessResponse) { // Use specific type
            // Payment successful (Webhook should handle plan update, but we can give immediate feedback)
            console.log("Razorpay Success Response:", response);
            toast({
              title: "Payment Successful!",
              description: "Your plan should update shortly. You might need to refresh.",
              duration: 5000,
            });
            // Optionally refetch user data to update UI immediately
            checkAuthStatus(); // Call checkAuthStatus to refresh user data
            // Optionally navigate to a different page
            // navigate('/dashboard');
            setIsLoadingPro(false);
          },
          prefill: { // Optional: Prefill user details
            name: user.displayName || "", // Use displayName based on AuthContext
            email: user.email || "",
            // contact: user.phone || "" // If you have phone number
          },
          notes: {
            userId: user.id // Use user.id based on AuthContext
          },
          theme: {
            color: "#3b82f6" // Example theme color (Tailwind blue-500)
          },
          modal: {
            ondismiss: function () {
              console.log("Razorpay Checkout modal dismissed.");
              toast({
                variant: "default",
                title: "Payment Cancelled",
                description: "Your plan was not upgraded. You can try again.",
              });
              setIsLoadingPro(false);
            }
          }
        };

        // Check if Razorpay is loaded
        if (!window.Razorpay) {
          console.error("Razorpay script not loaded.");
          toast({ variant: "destructive", title: "Loading Error", description: "Payment script failed to load. Please refresh." });
          setIsLoadingPro(false);
          return;
        }

        const rzp = new window.Razorpay(options);

        // Handle potential errors during Razorpay initialization or opening
        rzp.on('payment.failed', function (response: RazorpayPaymentFailedResponse){ // Use specific type
            console.error("Razorpay Payment Failed:", response.error);
            toast({
                variant: "destructive",
                title: "Payment Failed",
                description: `${response.error.description} (Code: ${response.error.code})`,
            });
            setIsLoadingPro(false);
        });

        rzp.open();

      } catch (error: unknown) {
        console.error("Error during Pro plan checkout process:", error);
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        toast({ variant: "destructive", title: "Checkout Error", description: message });
        setIsLoadingPro(false);
      }

    } else if (plan === 'free') {
      // Handle 'free' plan click if needed (e.g., navigate to dashboard)
      console.log(`User is logged in. Clicked on ${plan} plan.`);
      // Example: navigate('/dashboard');
      toast({ title: "You are already on the Free Plan or can start using it." }); // Example feedback
    }
  };

  return (
    <section className="w-full py-20 md:py-28 bg-muted/50">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pick the plan that fits your team's needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan Card */}
          <Card className="bg-background/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <div className="flex items-baseline mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Up to 1 repository</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Maximum 100 files</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Basic API documentation</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Community support</span>
                </li>
             </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => handleGetStartedClick('free')}>Get Started</Button>
            </CardFooter>
          </Card>

          {/* Pro Plan Card */}
          <Card className="border-primary shadow-xl relative bg-gradient-to-br from-background to-primary/10 scale-105">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <div className="flex items-baseline mt-4">
                <span className="text-4xl font-bold">₹2300</span> {/* Updated Price Display */}
                <span className="text-muted-foreground ml-1">/month (approx $29)</span> {/* Updated Price Display */}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Unlimited repositories</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Advanced API documentation</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Code examples generation</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>All integrations included</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Email support</span>
                </li>
             </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleGetStartedClick('pro')}
                disabled={isLoadingPro || user?.plan === 'pro'} // Disable if loading or already on Pro
              >
                {isLoadingPro ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : user?.plan === 'pro' ? (
                   'Current Plan'
                ) : (
                  'Upgrade to Pro' // Changed button text
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan Card */}
          <Card className="bg-background/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <div className="flex items-baseline mt-4">
                <span className="text-4xl font-bold">Custom</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>SSO & advanced security</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>On-premise deployment option</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Dedicated support manager</span>
                </li>
             </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => handleGetStartedClick('enterprise')}>Contact Sales</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};
