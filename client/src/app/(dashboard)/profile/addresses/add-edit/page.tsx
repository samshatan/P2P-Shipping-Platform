import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  User, 
  Phone, 
  Hash, 
  Home, 
  Briefcase, 
  Heart, 
  LayoutGrid,
  Loader2
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { addAddress, getAddresses, updateAddress } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

export default function AddressFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pincode: "",
    address: "",
    type: "Home",
    isDefault: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit) {
      const fetchAddress = async () => {
        try {
          const all = await getAddresses();
          const found = all.find((a: any) => String(a.id) === id);
          if (found) {
            setFormData({
              name: found.name || "",
              phone: found.phone || "",
              pincode: found.pincode || "",
              address: found.address || "",
              type: found.type || "Home",
              isDefault: found.isDefault || false
            });
          } else {
            showToast("Address not found", "error");
            navigate('/profile/addresses');
          }
        } catch (err) {
          showToast("Failed to load address", "error");
        } finally {
          setLoading(false);
        }
      };
      fetchAddress();
    }
  }, [id, isEdit]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!/^\d{10}$/.test(formData.phone.trim())) newErrors.phone = "Valid 10-digit phone is required";
    if (!/^\d{6}$/.test(formData.pincode.trim())) newErrors.pincode = "6-digit pincode is required";
    if (!formData.address.trim()) newErrors.address = "Complete address is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (isEdit) {
        await updateAddress(id, formData);
        showToast("Address updated successfully", "success");
      } else {
        await addAddress(formData);
        showToast("Address added to your book", "success");
      }
      navigate('/profile/addresses');
    } catch (err) {
      showToast("Failed to save address", "error");
    } finally {
      setSaving(false);
    }
  };

  const types = [
    { label: "Home", icon: <Home className="w-4 h-4" />, color: "text-primary bg-primary/5" },
    { label: "Office", icon: <Briefcase className="w-4 h-4" />, color: "text-amber-600 bg-amber-50" },
    { label: "Parents", icon: <Heart className="w-4 h-4" />, color: "text-rose-500 bg-rose-50" },
    { label: "Other", icon: <LayoutGrid className="w-4 h-4" />, color: "text-slate-600 bg-slate-50" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          
          <button 
            onClick={() => navigate('/profile/addresses')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-xs uppercase tracking-wider">Back to Address Book</span>
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
              {isEdit ? "Edit Address" : "Add New Address"}
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              {isEdit ? "Update your saved address details" : "Save a new location for easier shipping"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-8 bg-white border-border/60 rounded-[2.5rem] shadow-sm">
              <div className="space-y-6">
                
                {/* Type Selection */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Address Label</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {types.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: t.label })}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                          formData.type === t.label 
                            ? "border-primary bg-primary/5 shadow-inner" 
                            : "border-gray-50 bg-white hover:border-gray-200"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", t.color)}>
                          {t.icon}
                        </div>
                        <span className={cn("text-xs font-bold", formData.type === t.label ? "text-primary" : "text-slate-500")}>
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border/40">
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="font-bold flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" /> Full Name
                    </Label>
                    <Input 
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className={cn("h-12 rounded-xl bg-slate-50/50", errors.name && "border-red-500")}
                    />
                    {errors.name && <p className="text-xs font-bold text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" /> Phone Number
                    </Label>
                    <Input 
                      placeholder="10 digit number"
                      maxLength={10}
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      className={cn("h-12 rounded-xl bg-slate-50/50", errors.phone && "border-red-500")}
                    />
                    {errors.phone && <p className="text-xs font-bold text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2">
                      <Hash className="w-4 h-4 text-primary" /> Pincode
                    </Label>
                    <Input 
                      placeholder="6 digit pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                      className={cn("h-12 rounded-xl bg-slate-50/50", errors.pincode && "border-red-500")}
                    />
                    {errors.pincode && <p className="text-xs font-bold text-red-500">{errors.pincode}</p>}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label className="font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" /> Complete Address
                    </Label>
                    <textarea 
                      placeholder="House No, Building, Street, Area..."
                      rows={3}
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className={cn(
                        "w-full px-4 py-3 bg-slate-50/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm",
                        errors.address && "border-red-500"
                      )}
                    />
                    {errors.address && <p className="text-xs font-bold text-red-500">{errors.address}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <input 
                    type="checkbox" 
                    id="isDefault" 
                    checked={formData.isDefault}
                    onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                  <Label htmlFor="isDefault" className="font-bold text-slate-700 cursor-pointer">
                    Set as default address
                  </Label>
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button 
                type="button"
                onClick={() => navigate('/profile/addresses')}
                variant="outline"
                className="flex-1 h-14 rounded-2xl font-bold border-border bg-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={saving}
                className="flex-[2] h-14 bg-foreground text-white hover:bg-foreground/90 rounded-2xl shadow-xl shadow-foreground/10 font-bold flex items-center justify-center"
              >
                {saving ? (
                  <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-5 h-5 mr-3" /> {isEdit ? "Update Address" : "Save Address"}</>
                )}
              </Button>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
