"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  User, 
  Mail, 
  MessageCircle,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface ContactFormProps {
  title?: string;
  description?: string;
  compact?: boolean;
}

export function ContactForm({ 
  title = "Máte dotaz nebo nápad?", 
  description = "Kontaktujte nás s vašimi připomínkami nebo nápady na vylepšení ligy",
  compact = false 
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset status after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (status === 'success') {
    return (
      <section className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-100 max-w-4xl mx-auto">
        <div className="size-16 rounded-full bg-green-100 grid place-items-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <Badge className="bg-green-100 text-green-700 border-green-200 font-bold mb-4">
          ZPRÁVA ODESLÁNA
        </Badge>
        <h3 className="text-2xl font-black text-slate-900 mb-4">Děkujeme za vaši zprávu!</h3>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-8">
          Odpovíme vám co nejdříve na váš e-mail. Mezitím můžete pokračovat v procházení ligy.
        </p>
        <Button 
          onClick={() => setStatus('idle')} 
          variant="outline" 
          className="rounded-xl border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold"
        >
          Odeslat další zprávu
        </Button>
      </section>
    );
  }

  return (
    <section className={`${compact ? 'py-12' : 'py-16'} bg-gradient-to-br from-slate-50 via-white to-rose-50 rounded-3xl border border-gray-100 max-w-4xl mx-auto`}>
      <div className="text-center mb-12">
        <div className="size-16 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center mx-auto mb-6">
          <MessageSquare className="h-8 w-8 text-white" />
        </div>
        
        <Badge className="bg-primary/10 text-primary border-primary/20 font-bold mb-4">
          KONTAKTNÍ FORMULÁŘ
        </Badge>
        
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <Card className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-xl mx-6">
        <CardContent className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name and Email Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-slate-900 font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Jméno a příjmení *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Vaše celé jméno"
                  required
                  className="rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary h-12 px-4 font-medium transition-colors"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-900 font-bold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  E-mailová adresa *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="vas@email.cz"
                  required
                  className="rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary h-12 px-4 font-medium transition-colors"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-3">
              <Label htmlFor="subject" className="text-slate-900 font-bold flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                Předmět zprávy
              </Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Stručně popište, o čem chcete psát"
                className="rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary h-12 px-4 font-medium transition-colors"
              />
            </div>

            {/* Message */}
            <div className="space-y-3">
              <Label htmlFor="message" className="text-slate-900 font-bold">
                Vaše zpráva *
              </Label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                placeholder="Napište nám váš dotaz, nápad nebo připomínku..."
                required
                className="w-full rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-primary px-4 py-3 font-medium transition-colors resize-none"
              />
            </div>

            {/* Categories */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="font-bold text-slate-900 mb-4">Rychlé kategorie:</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  'Technický problém',
                  'Nápad na vylepšení', 
                  'Dotaz k pravidlům',
                  'Problém se zápasem',
                  'Návrh nové funkce',
                  'Jiné'
                ].map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, subject: category }))}
                    className="rounded-xl border-primary/30 text-primary hover:bg-primary hover:text-white font-semibold transition-all text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={status === 'loading' || !formData.name || !formData.email || !formData.message}
                className="w-full md:w-auto rounded-xl bg-gradient-to-r from-primary to-[#9F1239] hover:from-[#9F1239] hover:to-primary text-white font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <>
                    <AlertCircle className="h-5 w-5 mr-3 animate-spin" />
                    Odesílám zprávu...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-3" />
                    Odeslat zprávu
                  </>
                )}
              </Button>
              
              <p className="text-sm text-slate-500 mt-4">
                * Povinná pole. Odpovíme vám do 24 hodin na váš e-mail.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}