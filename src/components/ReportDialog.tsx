"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ReportDialogProps {
  topicId: string;
  title: string;
  size?: "default" | "sm";
  variant?: "default" | "ghost" | "outline";
}

const reportReasons = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Taciz veya Zorbalık" },
  { value: "violence", label: "Şiddet" },
  { value: "hate_speech", label: "Nefret Söylemi" },
  { value: "misinformation", label: "Yanlış Bilgi" },
  { value: "copyright", label: "Telif Hakkı İhlali" },
  { value: "other", label: "Diğer" },
];

export default function ReportDialog({
  topicId,
  title,
  size = "default",
  variant = "ghost",
}: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  
  const resetForm = () => {
    setReason("");
    setDetails("");
  };
  
  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Lütfen bir rapor nedeni seçin");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/topics/${topicId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, details }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Rapor gönderilemedi");
      }
      
      toast.success(data.message || "Raporunuz başarıyla gönderildi");
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className="text-muted-foreground"
        >
          <Flag className={size === "sm" ? "h-4 w-4 mr-1" : "h-5 w-5 mr-2"} />
          <span>{size === "sm" ? "Rapor Et" : "Konuyu Rapor Et"}</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konuyu Rapor Et</DialogTitle>
          <DialogDescription>
            Bu konunun uygunsuz içerik barındırdığını düşünüyorsanız, lütfen bir neden seçerek raporlayın.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Konu</h4>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Rapor Nedeni</h4>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Bir neden seçin" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Ek Açıklama (İsteğe bağlı)</h4>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Lütfen raporunuzla ilgili ek bilgi verin..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason}
          >
            {isSubmitting ? "Gönderiliyor..." : "Rapor Gönder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 