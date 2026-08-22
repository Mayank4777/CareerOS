import { useState } from "react";
import { Copy, Sparkles, Check, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Card } from "@/components/ui/card";
import { useGenerateCoverLetter } from "../hooks/use-ai-coach";
import { useToast } from "@/components/ui/toast";

export function CoverLetterGenerator() {
  const toast = useToast();
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("professional");
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateMutation = useGenerateCoverLetter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobTitle) {
      toast.error("Company name and job title are required.");
      return;
    }
    try {
      const res = await generateMutation.mutateAsync({
        companyName,
        jobTitle,
        jobDescription,
        tone,
      });
      setGeneratedLetter(res.coverLetter);
      toast.success("Cover letter generated!");
    } catch {
      toast.error("Failed to generate cover letter.");
    }
  };

  const handleCopy = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 space-y-5 border-indigo-500/20 bg-card/90">
        <div>
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            AI Cover Letter Generator
          </h3>
          <p className="text-xs text-secondary mt-1">
            Synthesize a tailored cover letter powered by your Career Profile data and target opportunity requirements.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 pt-1">
          <FormField label="Target Company" htmlFor="cl-company" required>
            <Input id="cl-company" placeholder="e.g. Stripe, OpenAI, Google" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </FormField>

          <FormField label="Target Position Title" htmlFor="cl-title" required>
            <Input id="cl-title" placeholder="e.g. Senior Frontend Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          </FormField>

          <FormField label="Tone & Positioning" htmlFor="cl-tone">
            <select
              id="cl-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-surface/90 border border-border/80 rounded-xl text-primary focus:outline-none focus:border-indigo-500/50"
            >
              <option value="professional">Executive & Professional</option>
              <option value="enthusiastic">Enthusiastic & High-Energy</option>
              <option value="concise">Concise & Direct Impact</option>
              <option value="creative">Innovative & Story-driven</option>
            </select>
          </FormField>

          <FormField label="Key Job Description Bullet Points" htmlFor="cl-desc">
            <Textarea
              id="cl-desc"
              rows={3}
              placeholder="Paste key responsibilities or tech stack requirements..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </FormField>

          <Button type="submit" variant="gradient" disabled={generateMutation.isPending} className="w-full flex items-center justify-center gap-2 h-11">
            <Wand2 className="w-4 h-4" />
            {generateMutation.isPending ? "Generating Cover Letter..." : "Generate AI Cover Letter"}
          </Button>
        </form>
      </Card>

      <Card className="p-6 flex flex-col justify-between min-h-[420px] border-border/80 bg-card/90">
        <div>
          <div className="flex items-center justify-between border-b border-border/60 pb-3.5 mb-4">
            <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              Tailored Cover Letter Output
            </h4>
            {generatedLetter && (
              <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs flex items-center gap-1.5 border-indigo-500/30">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-secondary" />}
                {copied ? "Copied" : "Copy to Clipboard"}
              </Button>
            )}
          </div>

          {generatedLetter ? (
            <div className="whitespace-pre-wrap text-xs leading-relaxed text-slate-200 font-sans bg-surface/60 p-5 rounded-2xl border border-border/80 max-h-[440px] overflow-y-auto shadow-inner">
              {generatedLetter}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-secondary">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-3 border border-indigo-500/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-primary">No cover letter generated yet.</p>
              <p className="text-xs text-secondary max-w-xs mt-1 leading-relaxed">
                Provide the target position details on the left to generate an ultra-customized executive cover letter.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
