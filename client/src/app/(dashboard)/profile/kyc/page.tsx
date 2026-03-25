import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/Toast";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  FileText,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function KYCPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aadhaar, setAadhaar] = useState("");
  const [files, setFiles] = useState<{front: boolean, back: boolean}>({ front: false, back: false });

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 12);
    // Format: 0000 0000 0000
    const formatted = val.replace(/(\d{4})/g, "$1 ").trim();
    setAadhaar(formatted);
  };

  const handleFileUpload = (type: 'front' | 'back') => {
    // Mock upload
    setFiles(prev => ({ ...prev, [type]: true }));
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} side uploaded`, "success");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    showToast("KYC Application Submitted Successfully!", "success");
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate("/profile")} variant="outline" size="icon" className="w-10 h-10 rounded-xl bg-white border-border shadow-sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-heading font-extrabold text-foreground">Identity Verification</h1>
                <p className="text-sm font-medium text-muted-foreground">Complete KYC to unlock full wallet limits.</p>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary border-0 font-bold px-3 py-1">Step {step}/2</Badge>
          </div>

          <Card className="p-8 bg-white border-border shadow-sm rounded-[2rem]">
            {step === 1 ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-800">Your data is encrypted and stored securely according to RBI guidelines.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold ml-1">Aadhaar Number</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      value={aadhaar}
                      onChange={handleAadhaarChange}
                      placeholder="0000 0000 0000" 
                      className="pl-10 h-14 bg-gray-50/50 rounded-2xl text-lg font-bold tracking-tight focus:ring-primary/20" 
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    disabled={aadhaar.replace(/\s/g, "").length !== 12}
                    onClick={() => setStep(2)}
                    className="w-full h-14 bg-primary text-white hover:bg-primary/90 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-foreground">Upload ID Documents</h3>
                  <p className="text-sm text-muted-foreground italic">Clear photos of your Aadhaar card (JPG, PNG or PDF)</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div 
                    onClick={() => handleFileUpload('front')}
                    className={cn(
                      "group aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all",
                      files.front ? "border-emerald-500 bg-emerald-50" : "border-border hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    {files.front ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                    )}
                    <p className={cn("font-bold text-sm", files.front ? "text-emerald-700" : "text-foreground")}>Front Side</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">{files.front ? "aadhaar_front.jpg" : "Click to upload"}</p>
                  </div>

                  <div 
                    onClick={() => handleFileUpload('back')}
                    className={cn(
                      "group aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all",
                      files.back ? "border-emerald-500 bg-emerald-50" : "border-border hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    {files.back ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                    )}
                    <p className={cn("font-bold text-sm", files.back ? "text-emerald-700" : "text-foreground")}>Back Side</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">{files.back ? "aadhaar_back.jpg" : "Click to upload"}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-14 flex-1 rounded-2xl font-bold border-border shadow-sm">
                    Back
                  </Button>
                  <Button 
                    disabled={!files.front || !files.back || isSubmitting}
                    onClick={handleSubmit}
                    className="h-14 flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Verification"}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" /> Fully Compliant with IT Act 2000
          </p>
        </div>
      </main>
    </div>
  );
}
