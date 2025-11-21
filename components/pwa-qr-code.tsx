"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Download } from "lucide-react";
import { useEffect, useState } from "react";

export function PWAQRCode() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    // Get the current URL on client side
    setUrl(window.location.origin);
  }, []);

  if (!url) return null;

  return (
    <Card className="rounded-xl md:rounded-2xl bg-white border border-gray-100 card-shadow">
      <CardHeader className="pb-2 md:pb-4 px-4 md:px-6">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Smartphone className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          Aplikace do mobilu
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
        <div className="flex flex-col items-center text-center">
          <div className="bg-white p-3 md:p-4 rounded-xl border-2 border-primary/20 mb-3 md:mb-4">
            <QRCodeSVG
              value={url}
              size={120}
              bgColor="#ffffff"
              fgColor="#BE123C"
              level="M"
              includeMargin={false}
            />
          </div>

          <p className="text-xs md:text-sm text-slate-600 mb-2">
            Naskenujte QR kód telefonem
          </p>

          <div className="bg-slate-50 rounded-lg p-2 md:p-3 w-full">
            <p className="text-xs text-slate-500 mb-1.5 font-medium">Jak nainstalovat:</p>
            <ol className="text-xs text-slate-600 text-left space-y-1">
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-primary">1.</span>
                Otevřete odkaz v prohlížeči
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-primary">2.</span>
                <span>
                  <strong>iOS:</strong> Sdílet → Přidat na plochu
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-primary">3.</span>
                <span>
                  <strong>Android:</strong> Menu → Nainstalovat
                </span>
              </li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
