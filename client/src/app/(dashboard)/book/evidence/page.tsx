import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UploadCloud, Info, ArrowRight, ShieldAlert, Cpu, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EvidenceVault() {
  const [hash, setHash] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploading(true);
      
      // Simulate SHA-256 hash generation and upload taking time
      setTimeout(() => {
        setHash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        setUploading(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-3xl mx-auto mt-4 px-4">
      
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>
        <h2 className="font-heading font-extrabold text-3xl md:text-4xl tracking-tight text-foreground mb-4">
          Evidence Vault <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">BETA</Badge>
        </h2>
        <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto">
          Take a photo of your parcel on a weighing scale. We'll generate a tamper-proof cryptographic hash to automatically reject any false courier weight disputes.
        </p>
      </div>

      <Card className="w-full bg-white border-2 border-dashed border-blue-200 hover:border-blue-400 p-10 rounded-3xl relative overflow-hidden transition-colors group text-center flex flex-col items-center justify-center min-h-[300px]">
        {hash ? (
          <div className="space-y-6 flex flex-col items-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-2xl text-foreground text-center">Secured & Uploaded</h3>
              <p className="text-muted-foreground mt-1 text-center font-medium">Your parcel weight is now indisputable.</p>
            </div>
            
            <div className="bg-slate-50 border border-border rounded-xl p-4 w-full text-left font-mono text-xs overflow-hidden">
               <div className="text-muted-foreground mb-1 uppercase tracking-wider font-bold text-[10px]">SHA-256 Cryptographic Hash</div>
               <div className="truncate text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded">{hash}</div>
               <div className="flex justify-between items-center mt-3">
                 <span className="text-muted-foreground flex items-center gap-1"><Cpu className="w-3 h-3"/> Blockchain Verified</span>
                 <span className="font-semibold text-foreground">{file?.name || "image.jpg"}</span>
               </div>
            </div>
          </div>
        ) : uploading ? (
          <div className="space-y-6 flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <h3 className="font-heading font-bold text-xl text-foreground">Computing SHA-256 Hash...</h3>
            <p className="text-muted-foreground font-medium">Securing your evidence in the vault.</p>
          </div>
        ) : (
          <div className="space-y-6 flex flex-col items-center relative z-10 w-full">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-2xl text-foreground text-center">Upload Packing Proof</h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-center mx-auto">
                Drag and drop your image/video here, or click to browse. Max 50MB.
              </p>
            </div>
            
            <div className="relative">
              <input type="file" accept="image/*,video/mp4" onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-base shadow-lg shadow-blue-600/20">
                Select File
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="w-full flex justify-between items-center mt-10 p-4 border border-border/80 rounded-2xl bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">You can skip this, but weight disputes cannot be challenged later.</span>
          <span className="text-sm font-medium text-muted-foreground sm:hidden">Skip at your own risk.</span>
        </div>
        <Link to="/book/review">
          <Button variant="ghost" className="text-muted-foreground font-semibold hover:text-foreground">
             Skip for now
          </Button>
        </Link>
      </div>

      <div className="w-full flex justify-end mt-8">
        <Link to="/book/review" className={cn("w-full sm:w-auto", !hash && "opacity-50 pointer-events-none")}>
          <Button className="w-full h-14 px-8 bg-gradient-to-r from-[#a33900] to-[#cc4900] hover:from-[#8c3100] hover:to-[#a33900] text-white font-semibold rounded-xl text-lg shadow-xl shadow-primary/20 transition-transform active:scale-95 group">
            Continue to Review <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      <div className="mt-12 flex items-center gap-2 text-sm text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full">
        <Info className="w-4 h-4" /> Used by 87% of PARCEL sellers to prevent false charges.
      </div>
    </div>
  );
}
