import { useState } from "react";
import { 
  User, 
  GraduationCap, 
  Building2, 
  Mail, 
  FileText, 
  Download,
  ExternalLink,
  Award,
  BookOpen,
  Send,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function About() {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-contact', {
        body: { name: contactName, email: contactEmail, message: contactMessage },
      });

      if (error) throw new Error(error.message);

      toast.success("Message sent successfully! We'll get back to you soon.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };


  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">About</h1>
          </div>
          <p className="text-muted-foreground">
            Meet the developer and learn about the research behind DrugBind AI
          </p>
        </div>

        {/* Developer Profile */}
        <div className="card-scientific p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-4xl font-bold shrink-0">
              VA
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">Varun Agarwal</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  Student
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  RV College of Engineering
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                Computer Science and Engineering (Cyber Security) student at RV College of Engineering®, Bengaluru, India. 
                Passionate about applying artificial intelligence and machine learning to solve real-world problems in 
                drug discovery and computational biology.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:varunagarwal0964@gmail.com" className="hover:text-primary transition-colors">
                  varunagarwal0964@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mentor Section */}
        <div className="card-scientific p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Research Mentor
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center text-secondary-foreground text-xl font-bold shrink-0">
              AHM
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground">Dr. A. H. Manjunatha Reddy</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Professor, Department of Biotechnology<br />
                RV College of Engineering®, Bengaluru, India
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:ahmanjunatha@rvce.edu.in" className="hover:text-primary transition-colors">
                  ahmanjunatha@rvce.edu.in
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Research Paper Section */}
        <div className="card-scientific p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Research Publication
          </h3>
          
          <div className="border border-border rounded-lg p-6 bg-muted/30">
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Smart Drug–Protein Binding Prediction using AI
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Varun Agarwal, Dr. A. H. Manjunatha Reddy
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              RV College of Engineering®, Bengaluru, India
            </p>
            
            <div className="bg-background p-4 rounded-lg mb-4">
              <h5 className="text-sm font-semibold text-foreground mb-2">Abstract</h5>
              <p className="text-sm text-muted-foreground">
                We present an end-to-end, interpretable pipeline for predicting drug–protein binding 
                affinity from SMILES and FASTA inputs. Starting from a cleaned BindingDB subset, we 
                apply molecule sanitization and sequence normalization, unify affinity units to pK, 
                and train a multimodal model that combines a graph-based encoder for ligands with a 
                transformer-derived representation for proteins. We benchmark the model against a 
                fingerprint-based neural baseline and docking scores from AutoDock Vina, and we use 
                SHAP and attention-based visualizations to highlight the chemical and sequence regions 
                that drive predictions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge>Drug-Target Binding</Badge>
              <Badge>Graph Neural Network</Badge>
              <Badge>Transformer</Badge>
              <Badge>Explainable AI</Badge>
              <Badge>SHAP</Badge>
            </div>

            <Button 
              variant="scientific" 
              className="w-full md:w-auto"
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/research/DrugBind_AI_Research_Paper.pdf';
                link.download = 'DrugBind_AI_Research_Paper.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Downloading research paper...');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Full Research Paper (PDF)
            </Button>
          </div>
        </div>

        {/* Key Contributions */}
        <div className="card-scientific p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Key Research Contributions
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="font-semibold text-foreground mb-2">Data Preprocessing Pipeline</h4>
              <p className="text-sm text-muted-foreground">
                Comprehensive preprocessing and normalization of molecular SMILES and protein FASTA 
                sequences from BindingDB with pK unit unification.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="font-semibold text-foreground mb-2">Multimodal Architecture</h4>
              <p className="text-sm text-muted-foreground">
                Novel architecture integrating Graph Neural Networks for molecules with Transformer 
                encoders for proteins, achieving 25% improvement over baseline.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="font-semibold text-foreground mb-2">AutoDock Vina Comparison</h4>
              <p className="text-sm text-muted-foreground">
                Rigorous comparison with docking scores from AutoDock Vina, demonstrating stronger 
                alignment with experimental affinities.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="font-semibold text-foreground mb-2">Explainable AI</h4>
              <p className="text-sm text-muted-foreground">
                SHAP and attention-based visualizations connecting predictions to molecular 
                substructures and protein residues for interpretability.
              </p>
            </div>
          </div>
        </div>

        {/* Institution */}
        <div className="card-scientific p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Institution
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              RVCE
            </div>
            <div>
              <h4 className="font-semibold text-foreground">RV College of Engineering®</h4>
              <p className="text-sm text-muted-foreground">Bengaluru, Karnataka, India</p>
              <a 
                href="https://www.rvce.edu.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
              >
                Visit Website <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="card-scientific p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Contact Me
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Have questions about the research or want to collaborate? Send me a message!
          </p>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Your Name</Label>
                <Input
                  id="contactName"
                  placeholder="Enter your name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Your Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactMessage">Message</Label>
              <Textarea
                id="contactMessage"
                placeholder="Write your message here..."
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
              />
            </div>
            <Button 
              variant="scientific" 
              onClick={handleSendMessage} 
              disabled={isSending}
              className="w-full md:w-auto"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}