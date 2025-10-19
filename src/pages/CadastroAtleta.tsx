import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ImageUpload";

export default function CadastroAtleta() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [equipe, setEquipe] = useState<any>(null);
  const [tokenData, setTokenData] = useState<any>(null);

  // Dados pessoais
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  // Dados esportivos
  const [posicao, setPosicao] = useState("");
  const [numeroUniforme, setNumeroUniforme] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [peDominante, setPeDominante] = useState("");

  // Responsável
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [cpfResponsavel, setCpfResponsavel] = useState("");
  const [contatoResponsavel, setContatoResponsavel] = useState("");

  // Foto
  const [fotoUrl, setFotoUrl] = useState("");

  useEffect(() => {
    if (!token) {
      toast.error("Token de convite inválido");
      navigate("/");
      return;
    }
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase
        .from("athlete_invite_tokens")
        .select(`
          *,
          equipes:equipe_id (
            id,
            nome,
            categoria,
            logo_url
          )
        `)
        .eq("token", token)
        .eq("used", false)
        .single();

      if (error || !data) {
        toast.error("Convite inválido ou já utilizado");
        navigate("/");
        return;
      }

      // Verificar expiração
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        toast.error("Este convite expirou");
        navigate("/");
        return;
      }

      setTokenData(data);
      setEquipe(data.equipes);
      setEmail(data.email);
    } catch (error: any) {
      console.error("Erro ao validar token:", error);
      toast.error("Erro ao validar convite");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Inserir atleta
      const { error: atletaError } = await supabase
        .from("atletas")
        .insert({
          nome,
          documento,
          cpf: cpf || null,
          rg: rg || null,
          data_nascimento: dataNascimento || null,
          sexo: sexo || null,
          email: email || null,
          telefone: telefone || null,
          cidade: cidade || null,
          estado: estado || null,
          equipe_id: equipe.id,
          categoria: equipe.categoria,
          posicao: posicao || null,
          numero_uniforme: numeroUniforme ? parseInt(numeroUniforme) : null,
          altura: altura ? parseFloat(altura) : null,
          peso: peso ? parseFloat(peso) : null,
          pe_dominante: peDominante || null,
          nome_responsavel: nomeResponsavel || null,
          cpf_responsavel: cpfResponsavel || null,
          contato_responsavel: contatoResponsavel || null,
          foto_url: fotoUrl || null,
          ativo: true,
        });

      if (atletaError) throw atletaError;

      // Marcar token como usado
      await supabase
        .from("athlete_invite_tokens")
        .update({ used: true })
        .eq("id", tokenData.id);

      toast.success("Cadastro realizado com sucesso!");
      
      // Redirecionar para página de sucesso
      setTimeout(() => {
        navigate("/cadastro-sucesso");
      }, 2000);
    } catch (error: any) {
      toast.error("Erro ao realizar cadastro: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!equipe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              {equipe.logo_url && (
                <img src={equipe.logo_url} alt={equipe.nome} className="h-16 w-16 object-contain" />
              )}
              <div>
                <CardTitle className="text-2xl">Cadastro de Atleta</CardTitle>
                <CardDescription>
                  Você foi convidado para {equipe.nome} - {equipe.categoria}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="pessoal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
                  <TabsTrigger value="esportivo">Dados Esportivos</TabsTrigger>
                  <TabsTrigger value="responsavel">Responsável</TabsTrigger>
                </TabsList>

                <TabsContent value="pessoal" className="space-y-4 mt-4">
                  <div className="mb-6">
                    <ImageUpload
                      bucket="atletas"
                      currentImageUrl={fotoUrl}
                      onImageUploaded={setFotoUrl}
                      label="Foto do Atleta"
                      maxSizeMB={5}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="documento">Documento *</Label>
                      <Input
                        id="documento"
                        value={documento}
                        onChange={(e) => setDocumento(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="rg">RG</Label>
                      <Input
                        id="rg"
                        value={rg}
                        onChange={(e) => setRg(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                      <Input
                        id="dataNascimento"
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="sexo">Sexo</Label>
                      <Select value={sexo} onValueChange={setSexo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        readOnly
                      />
                    </div>

                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        maxLength={2}
                        placeholder="UF"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="esportivo" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="posicao">Posição</Label>
                      <Input
                        id="posicao"
                        value={posicao}
                        onChange={(e) => setPosicao(e.target.value)}
                        placeholder="Ex: Atacante, Goleiro"
                      />
                    </div>

                    <div>
                      <Label htmlFor="numeroUniforme">Número do Uniforme</Label>
                      <Input
                        id="numeroUniforme"
                        type="number"
                        value={numeroUniforme}
                        onChange={(e) => setNumeroUniforme(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="altura">Altura (metros)</Label>
                      <Input
                        id="altura"
                        type="number"
                        step="0.01"
                        value={altura}
                        onChange={(e) => setAltura(e.target.value)}
                        placeholder="1.75"
                      />
                    </div>

                    <div>
                      <Label htmlFor="peso">Peso (kg)</Label>
                      <Input
                        id="peso"
                        type="number"
                        step="0.1"
                        value={peso}
                        onChange={(e) => setPeso(e.target.value)}
                        placeholder="70.5"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="peDominante">Pé Dominante</Label>
                      <Select value={peDominante} onValueChange={setPeDominante}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direito">Direito</SelectItem>
                          <SelectItem value="esquerdo">Esquerdo</SelectItem>
                          <SelectItem value="ambos">Ambos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="responsavel" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="nomeResponsavel">Nome do Responsável</Label>
                      <Input
                        id="nomeResponsavel"
                        value={nomeResponsavel}
                        onChange={(e) => setNomeResponsavel(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cpfResponsavel">CPF do Responsável</Label>
                      <Input
                        id="cpfResponsavel"
                        value={cpfResponsavel}
                        onChange={(e) => setCpfResponsavel(e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contatoResponsavel">Contato do Responsável</Label>
                      <Input
                        id="contatoResponsavel"
                        value={contatoResponsavel}
                        onChange={(e) => setContatoResponsavel(e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button type="submit" disabled={submitting} className="w-full" size="lg">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Finalizar Cadastro
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
