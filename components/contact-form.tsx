"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/admin-ui";
import { Send, CheckCircle, Loader2 } from "lucide-react";

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

  const inputCls = "h-9 text-sm";

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="border-b border-border bg-muted px-3 py-2">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
      </div>

      <form onSubmit={handleSubmit} className={`${compact ? 'p-3' : 'p-4'} space-y-3`}>
        {/* Potvrzení zůstává uvnitř panelu, formulář je hned připravený na další zprávu */}
        {status === 'success' && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Zpráva odeslána. Odpovíme na váš e-mail.
            </span>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              Zavřít
            </button>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Jméno a příjmení *" htmlFor="name">
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Vaše celé jméno"
              required
              className={inputCls}
            />
          </Field>
          <Field label="E-mail *" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="vas@email.cz"
              required
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Předmět" htmlFor="subject">
          <Input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="O čem chcete psát"
            className={inputCls}
          />
          {/* Rychlá volba předmětu — jen předvyplní pole, dá se dál přepsat */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {[
              'Technický problém',
              'Nápad na vylepšení',
              'Dotaz k pravidlům',
              'Problém se zápasem',
              'Návrh nové funkce',
              'Jiné'
            ].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, subject: category }))}
                className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  formData.subject === category
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-slate-600 hover:border-primary hover:text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Zpráva *" htmlFor="message">
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={5}
            placeholder="Dotaz, nápad nebo připomínka"
            required
            className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </Field>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={status === 'loading' || !formData.name || !formData.email || !formData.message}
            className="h-9 rounded-md bg-primary font-semibold text-white hover:bg-[#9F1239]"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Odesílám…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Odeslat zprávu
              </>
            )}
          </Button>
          <span className="text-[11px] text-muted-foreground">* Povinná pole</span>
        </div>
      </form>
    </section>
  );
}
