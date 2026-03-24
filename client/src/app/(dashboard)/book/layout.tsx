import { Link, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const getStepId = () => {
    const path = location.pathname;
    if (path.includes('/book/address')) return 1;
    if (path.includes('/book/courier') || path.includes('/book/evidence')) return 2;
    if (path.includes('/book/review')) return 3;
    if (path.includes('/book/confirmed')) return 4;
    return 1;
  };

  const steps = [
    { id: 1, name: 'Address', href: '/book/address' },
    { id: 2, name: 'Package', href: '/book/courier' },
    { id: 3, name: 'Review', href: '/book/review' },
    { id: 4, name: 'Payment', href: '/book/review' },
  ];

  const currentStep = getStepId();

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Enhanced Stepper */}
          <div className="max-w-4xl mx-auto mb-12">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-8">Book a Shipment</h1>
            
            <nav aria-label="Progress">
              <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                  <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '')}>
                    {step.id < currentStep ? (
                      <>
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="h-1 w-full bg-primary rounded-full"></div>
                        </div>
                        <Link to={step.href} className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-sm">
                          <Check className="h-5 w-5 text-white" aria-hidden="true" />
                        </Link>
                      </>
                    ) : step.id === currentStep ? (
                      <>
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="h-1 w-full bg-border rounded-full"></div>
                        </div>
                        <Link to={step.href} className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white shadow-sm ring-4 ring-primary/10">
                          <span className="text-primary font-bold text-sm">{step.id}</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="h-1 w-full bg-border rounded-full"></div>
                        </div>
                        <Link to={step.href} className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-white hover:border-border/80 transition-colors shadow-sm">
                          <span className="text-muted-foreground font-medium text-sm">{step.id}</span>
                        </Link>
                      </>
                    )}
                    
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap text-foreground tracking-wide">
                      {step.name}
                    </span>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {children}

        </div>
      </main>
    </div>
  );
}
