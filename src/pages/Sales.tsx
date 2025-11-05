
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Sales = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 lg:px-8 flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            WhatsApp Business Platform
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Automate your WhatsApp communication, verify numbers, warm up accounts, and send bulk messages with our comprehensive business platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/login">
              <Button size="lg">Get Started</Button>
            </Link>
            <a href="#pricing" className="flex items-center gap-1 text-sm font-semibold leading-6">
              View pricing <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">All-in-one WhatsApp Business Solution</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Session Management"
              description="Connect and manage multiple WhatsApp sessions simultaneously with our easy-to-use dashboard."
              icon={<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-primary" /></div>}
            />
            <FeatureCard
              title="Number Verification"
              description="Verify phone numbers to ensure they exist on WhatsApp before sending messages, saving time and resources."
              icon={<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-primary" /></div>}
            />
            <FeatureCard
              title="Account Warmers"
              description="Gradually warm up your WhatsApp accounts to avoid blocks and bans with our automated warmers."
              icon={<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-primary" /></div>}
            />
            <FeatureCard
              title="Bulk Messenger"
              description="Send personalized messages to thousands of contacts with customizable templates and scheduling."
              icon={<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-primary" /></div>}
            />
            <FeatureCard
              title="Analytics Dashboard"
              description="Get detailed insights into your messaging performance with comprehensive analytics and reporting."
              icon={<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-primary" /></div>}
            />
            <FeatureCard
              title="Contact Management"
              description="Organize and manage your WhatsApp contacts efficiently with powerful segmentation tools."
              icon={<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-primary" /></div>}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that's right for your business
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <PricingCard
              title="Basic"
              price="$49"
              description="Essential features for small businesses"
              buttonText="Get Started"
              buttonVariant="outline"
              features={[
                "2 WhatsApp sessions",
                "1,000 verifications/month",
                "1 standard warmer",
                "5,000 bulk messages/month",
                "Basic analytics",
                "Email support"
              ]}
            />
            <PricingCard
              title="Pro"
              price="$99"
              description="Advanced features for growing businesses"
              buttonText="Get Started"
              buttonVariant="default"
              popular={true}
              features={[
                "5 WhatsApp sessions",
                "5,000 verifications/month",
                "3 standard warmers",
                "20,000 bulk messages/month",
                "Advanced analytics",
                "Priority email support",
                "API access"
              ]}
            />
            <PricingCard
              title="Enterprise"
              price="$299"
              description="Maximum power for large businesses"
              buttonText="Contact Sales"
              buttonVariant="outline"
              features={[
                "Unlimited WhatsApp sessions",
                "Unlimited verifications",
                "Unlimited warmers",
                "Unlimited messages",
                "Custom analytics dashboard",
                "Dedicated account manager",
                "Custom integrations",
                "24/7 phone support"
              ]}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 lg:px-8 bg-secondary/20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Frequently asked questions</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about our WhatsApp platform
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <FaqItem
              question="Is this an official WhatsApp product?"
              answer="No, this is a third-party platform that uses WhatsApp's business APIs. We are not affiliated with WhatsApp or Meta, but our platform complies with their terms of service."
            />
            <FaqItem
              question="Do I need a WhatsApp Business account?"
              answer="Yes, you'll need to have a WhatsApp Business account to use our platform. We can help you set one up if needed."
            />
            <FaqItem
              question="Is there a risk of getting banned?"
              answer="WhatsApp has strict policies against spam. Our platform includes features like account warmers and optimized sending patterns to minimize the risk of bans while following WhatsApp's guidelines."
            />
            <FaqItem
              question="Can I cancel my subscription anytime?"
              answer="Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
            />
            <FaqItem
              question="Do you offer a free trial?"
              answer="Yes, we offer a 7-day free trial for new users. You can try all features of the Pro plan without commitment."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 px-6 lg:px-8">
        <div className="mx-auto max-w-5xl flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-6">Ready to transform your WhatsApp business communication?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-3xl">
            Join thousands of businesses that use our platform to connect with their customers more effectively.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="font-semibold">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 px-6 lg:px-8 border-t">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Tutorial</a></li>
                <li><a href="#" className="hover:text-foreground">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About Us</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground">Support</a></li>
                <li><a href="#" className="hover:text-foreground">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-foreground">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WhatsApp Business Platform. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper Components
const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-start p-6 bg-card rounded-lg border shadow-sm">
      {icon}
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
};

const PricingCard = ({
  title,
  price,
  description,
  buttonText,
  buttonVariant,
  features,
  popular = false,
}: {
  title: string;
  price: string;
  description: string;
  buttonText: string;
  buttonVariant: "default" | "outline";
  features: string[];
  popular?: boolean;
}) => {
  return (
    <Card className={`flex flex-col ${popular ? 'border-primary shadow-lg relative' : ''}`}>
      {popular && (
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
          <div className="bg-primary text-primary-foreground text-xs font-medium py-1 px-3 rounded-full">
            Most Popular
          </div>
        </div>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-bold tracking-tight">{price}</span>
          <span className="ml-1 text-sm font-medium text-muted-foreground">/month</span>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={buttonVariant}>
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h3 className="flex items-center text-lg font-medium">
        <HelpCircle className="h-5 w-5 text-primary mr-2" />
        {question}
      </h3>
      <p className="mt-4 text-muted-foreground">{answer}</p>
    </div>
  );
};

export default Sales;
