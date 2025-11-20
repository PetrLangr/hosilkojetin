"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Pin, Shield, Image } from "lucide-react";
import Link from "next/link";

export default function NewPost() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [type, setType] = useState("news");
  const [pinned, setPinned] = useState(false);

  if (status === "loading") {
    return <div className="flex justify-center py-20">Načítám...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    redirect("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Název a obsah jsou povinné");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim() || null,
          content: content.trim(),
          imageUrl: imageUrl.trim() || null,
          type,
          pinned
        })
      });

      if (response.ok) {
        router.push("/posts");
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Chyba při vytváření příspěvku");
      }
    } catch (error) {
      setError("Chyba při vytváření příspěvku");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white">
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na profil
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="text-center py-12 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl border border-gray-100">
        <Badge className="bg-primary text-white px-4 py-2 text-sm font-semibold mb-4">
          <Shield className="h-3 w-3 mr-1" />
          ADMIN PANEL
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
          NOVÝ <span className="text-primary">PŘÍSPĚVEK</span>
        </h1>
        <p className="text-xl text-slate-600 font-medium">
          Vytvořte nový článek nebo oznámení pro ligu
        </p>
      </div>

      {/* Form */}
      <Card className="rounded-2xl bg-white border border-gray-100 card-shadow max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Vytvoření příspěvku
          </CardTitle>
          <CardDescription>
            Vyplňte všechny potřebné informace pro nový příspěvek
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Název článku *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Zadejte název příspěvku"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Typ příspěvku</Label>
                <Select value={type} onValueChange={setType} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">Novinka</SelectItem>
                    <SelectItem value="announcement">Oznámení</SelectItem>
                    <SelectItem value="tournament">Turnaj</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Stručný popis</Label>
              <Input
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Krátký popis pro náhled (volitelné)"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL obrázku</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/path/to/image.webp nebo https://example.com/image.jpg"
                disabled={loading}
              />
              <p className="text-xs text-slate-600">
                Použijte relativní cestu k obrázku v /public složce nebo plnou URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Obsah článku *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Napište obsah příspěvku... (HTML formátování je podporováno)"
                required
                disabled={loading}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-600">
                Můžete použít HTML tagy: &lt;p&gt;, &lt;h3&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  disabled={loading}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="pinned" className="flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  Připnout na začátek
                </Label>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold">
                {loading ? "Vytváří se..." : "Vytvořit příspěvek"}
              </Button>
              <Button type="button" variant="outline" disabled={loading} asChild className="rounded-xl">
                <Link href="/profile">Zrušit</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}