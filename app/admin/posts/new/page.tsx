"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminToolbar, ErrorBanner, Field } from "@/components/admin/admin-ui";

// Přístup hlídá app/admin/layout.tsx.
export default function NewPost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [type, setType] = useState("news");
  const [pinned, setPinned] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Název a obsah jsou povinné.");
      return;
    }

    setLoading(true);
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

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Příspěvek se nepodařilo vytvořit.");

      // Rovnou na hotový článek, ať je vidět, jak vypadá.
      router.push(data.id ? `/posts/${data.id}` : "/posts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Příspěvek se nepodařilo vytvořit.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <AdminToolbar title="Nový příspěvek" meta="publikuje se ihned po uložení" />

      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        {/* Obsah */}
        <div className="space-y-4 rounded-lg border border-border bg-white p-4 sm:p-5">
          <Field label="Název *" htmlFor="title">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              disabled={loading}
              className="h-10 text-base font-semibold"
            />
          </Field>

          <Field label="Perex" htmlFor="excerpt" hint="Krátký text pod nadpisem v přehledu novinek. Bez něj bude náhled jen s nadpisem.">
            <Input id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} disabled={loading} />
          </Field>

          <Field
            label="Text článku *"
            htmlFor="content"
            hint="Lze použít HTML: <p>, <h3>, <strong>, <ul>, <li>, <a href>."
          >
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={loading}
              rows={16}
              className="resize-y font-mono text-[13px] leading-relaxed"
            />
          </Field>
        </div>

        {/* Nastavení a odeslání */}
        <aside className="space-y-4 self-start rounded-lg border border-border bg-white p-4 lg:sticky lg:top-20">
          <Field label="Typ" htmlFor="type">
            <Select value={type} onValueChange={setType} disabled={loading}>
              <SelectTrigger id="type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="news">Novinka</SelectItem>
                <SelectItem value="announcement">Oznámení</SelectItem>
                <SelectItem value="tournament">Turnaj</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Úvodní obrázek" htmlFor="imageUrl" hint="Cesta ve /public nebo plná URL.">
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); setImageFailed(false); }}
              placeholder="/obrazek.webp"
              disabled={loading}
            />
          </Field>
          {imageUrl.trim() && (
            imageFailed ? (
              <p className="-mt-2 text-[11px] text-amber-700">Obrázek se nepodařilo načíst — zkontrolujte cestu.</p>
            ) : (
              <img
                src={imageUrl.trim()}
                alt="Náhled úvodního obrázku"
                onError={() => setImageFailed(true)}
                className="-mt-1 aspect-video w-full rounded-md border border-border object-cover"
              />
            )
          )}

          <label className="flex cursor-pointer items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              disabled={loading}
              className="mt-0.5 size-4 rounded border-slate-300 accent-[var(--primary)]"
            />
            <span>
              <span className="font-medium text-slate-900">Připnout nahoru</span>
              <span className="block text-[11px] text-muted-foreground">Zůstane první v seznamu novinek.</span>
            </span>
          </label>

          <div className="flex gap-2 border-t border-border pt-4">
            <Button type="submit" disabled={loading} className="h-9 flex-1 rounded-md font-semibold">
              {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Publikovat
            </Button>
            <Button type="button" variant="outline" disabled={loading} asChild className="h-9 rounded-md">
              <Link href="/admin">Zrušit</Link>
            </Button>
          </div>
        </aside>
      </div>
    </form>
  );
}
