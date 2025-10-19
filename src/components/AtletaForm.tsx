import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, X, Save, User } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

interface AtletaFormProps {
  atleta?: any;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export default function AtletaForm({ atleta, onSuccess, trigger }: AtletaFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [equipes, setEquipes] = useState<any[]>([]);
  
  // Abrir dialog quando atleta é passado para edição
  useEffect(() => {
    if (atleta && trigger) {
      setOpen(true);
    }
  }, [atleta, trigger]);
  
  // Dados pessoais
  const [nome, setNome] = useState(atleta?.nome || "");
  const [documento, setDocumento] = useState(atleta?.documento || "");
  const [cpf, setCpf] = useState(atleta?.cpf || "");
  const [rg, setRg] = useState(atleta?.rg || "");
  const [certidaoNascimento, setCertidaoNascimento] = useState(atleta?.certidao_nascimento || "");
  const [dataNascimento, setDataNascimento] = useState(atleta?.data_nascimento || "");
  const [sexo, setSexo] = useState(atleta?.sexo || "");
  const [nacionalidade, setNacionalidade] = useState(atleta?.nacionalidade || "Brasileiro");
  const [cidade, setCidade] = useState(atleta?.cidade || "");
  const [estado, setEstado] = useState(atleta?.estado || "");
  
  // Contatos
  const [email, setEmail] = useState(atleta?.email || "");
  const [telefone, setTelefone] = useState(atleta?.telefone || "");
  const [contatoEmergencia, setContatoEmergencia] = useState(atleta?.contato_emergencia || "");
  
  // Dados esportivos
  const [equipeId, setEquipeId] = useState(atleta?.equipe_id || "");
  const [categoria, setCategoria] = useState(atleta?.categoria || "");
  const [posicao, setPosicao] = useState(atleta?.posicao || "");
  const [numeroUniforme, setNumeroUniforme] = useState(atleta?.numero_uniforme || "");
  const [altura, setAltura] = useState(atleta?.altura || "");
  const [peso, setPeso] = useState(atleta?.peso || "");
  const [peDominante, setPeDominante] = useState(atleta?.pe_dominante || "");
  
  // Saúde
  const [tipoSanguineo, setTipoSanguineo] = useState(atleta?.tipo_sanguineo || "");
  const [alergias, setAlergias] = useState(atleta?.alergias || "");
  const [medicamentos, setMedicamentos] = useState(atleta?.medicamentos || "");
  const [necessidadesEspeciais, setNecessidadesEspeciais] = useState(atleta?.necessidades_especiais || "");
  
  // Responsável
  const [nomeResponsavel, setNomeResponsavel] = useState(atleta?.nome_responsavel || "");
  const [cpfResponsavel, setCpfResponsavel] = useState(atleta?.cpf_responsavel || "");
  const [contatoResponsavel, setContatoResponsavel] = useState(atleta?.contato_responsavel || "");
  const [parentescoResponsavel, setParentescoResponsavel] = useState(atleta?.parentesco_responsavel || "");
  
  // Histórico
  const [clubesAnteriores, setClubesAnteriores] = useState<string[]>(atleta?.clubes_anteriores || []);
  const [novoClube, setNovoClube] = useState("");
  
  // Redes sociais
  const [redesSociais, setRedesSociais] = useState({
    instagram: atleta?.redes_sociais?.instagram || "",
    facebook: atleta?.redes_sociais?.facebook || "",
    twitter: atleta?.redes_sociais?.twitter || "",
    tiktok: atleta?.redes_sociais?.tiktok || "",
  });
  
  // Foto
  const [fotoUrl, setFotoUrl] = useState(atleta?.foto_url || "");
  
  // Status
  const [ativo, setAtivo] = useState(atleta?.ativo ?? true);
  const [transferivel, setTransferivel] = useState(atleta?.transferivel ?? false);
  const [observacoes, setObservacoes] = useState(atleta?.observacoes || "");

  useEffect(() => {
    fetchEquipes();
  }, []);

  const fetchEquipes = async () => {
    const { data } = await supabase
      .from("equipes")
      .select("id, nome, categoria, modalidade")
      .eq("ativa", true)
      .order("nome");
    
    if (data) setEquipes(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const atletaData: any = {
        nome,
        documento,
        cpf: cpf || null,
        rg: rg || null,
        certidao_nascimento: certidaoNascimento || null,
        data_nascimento: dataNascimento || null,
        sexo: sexo || null,
        nacionalidade,
        cidade: cidade || null,
        estado: estado || null,
        email: email || null,
        telefone: telefone || null,
        contato_emergencia: contatoEmergencia || null,
        equipe_id: equipeId || null,
        categoria,
        posicao: posicao || null,
        numero_uniforme: numeroUniforme ? parseInt(numeroUniforme) : null,
        altura: altura ? parseFloat(altura) : null,
        peso: peso ? parseFloat(peso) : null,
        pe_dominante: peDominante || null,
        tipo_sanguineo: tipoSanguineo || null,
        alergias: alergias || null,
        medicamentos: medicamentos || null,
        necessidades_especiais: necessidadesEspeciais || null,
        nome_responsavel: nomeResponsavel || null,
        cpf_responsavel: cpfResponsavel || null,
        contato_responsavel: contatoResponsavel || null,
        parentesco_responsavel: parentescoResponsavel || null,
        clubes_anteriores: clubesAnteriores,
        redes_sociais: redesSociais,
        foto_url: fotoUrl || null,
        ativo,
        transferivel,
        observacoes: observacoes || null,
      };

      if (atleta) {
        const { error } = await supabase
          .from("atletas")
          .update(atletaData)
          .eq("id", atleta.id);
        if (error) throw error;
        toast.success("Atleta atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("atletas")
          .insert([atletaData]);
        if (error) throw error;
        toast.success("Atleta cadastrado com sucesso!");
      }

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const adicionarClube = () => {
    if (novoClube && !clubesAnteriores.includes(novoClube)) {
      setClubesAnteriores([...clubesAnteriores, novoClube]);
      setNovoClube("");
    }
  };

  const removerClube = (clube: string) => {
    setClubesAnteriores(clubesAnteriores.filter(c => c !== clube));
  };

  const calcularIdade = () => {
    if (!dataNascimento) return "";
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade > 0 ? `${idade} anos` : "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {atleta ? "Editar Atleta" : "Novo Atleta"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6" />
            {atleta ? "Editar Atleta" : "Cadastrar Novo Atleta"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="pessoal" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="pessoal">Pessoal</TabsTrigger>
              <TabsTrigger value="esportivo">Esportivo</TabsTrigger>
              <TabsTrigger value="saude">Saúde</TabsTrigger>
              <TabsTrigger value="responsavel">Responsável</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
              <TabsTrigger value="extras">Extras</TabsTrigger>
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
                    placeholder="Nome completo do atleta"
                  />
                </div>

                <div>
                  <Label htmlFor="documento">Documento *</Label>
                  <Input
                    id="documento"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    required
                    placeholder="Número do documento"
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
                    placeholder="Número do RG"
                  />
                </div>

                <div>
                  <Label htmlFor="certidao">Certidão de Nascimento</Label>
                  <Input
                    id="certidao"
                    value={certidaoNascimento}
                    onChange={(e) => setCertidaoNascimento(e.target.value)}
                    placeholder="Número da certidão"
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
                  {calcularIdade() && (
                    <span className="text-xs text-muted-foreground">{calcularIdade()}</span>
                  )}
                </div>

                <div>
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select value={sexo} onValueChange={setSexo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="contatoEmergencia">Contato de Emergência</Label>
                  <Input
                    id="contatoEmergencia"
                    value={contatoEmergencia}
                    onChange={(e) => setContatoEmergencia(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="nacionalidade">Nacionalidade</Label>
                  <Input
                    id="nacionalidade"
                    value={nacionalidade}
                    onChange={(e) => setNacionalidade(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Nome da cidade"
                  />
                </div>

                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="esportivo" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equipe">Equipe</Label>
                  <Select value={equipeId} onValueChange={setEquipeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {equipes.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.nome} - {eq.categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Input
                    id="categoria"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                    placeholder="Ex: Sub-17, Profissional"
                  />
                </div>

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
                    min="0"
                    max="999"
                    value={numeroUniforme}
                    onChange={(e) => setNumeroUniforme(e.target.value)}
                    placeholder="10"
                  />
                </div>

                <div>
                  <Label htmlFor="altura">Altura (metros)</Label>
                  <Input
                    id="altura"
                    type="number"
                    step="0.01"
                    min="0"
                    max="3"
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
                    min="0"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    placeholder="70.5"
                  />
                </div>

                <div>
                  <Label htmlFor="peDominante">Pé Dominante</Label>
                  <Select value={peDominante} onValueChange={setPeDominante}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="direito">Direito</SelectItem>
                      <SelectItem value="esquerdo">Esquerdo</SelectItem>
                      <SelectItem value="ambos">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <Label htmlFor="ativo" className="cursor-pointer">
                    Atleta Ativo
                  </Label>
                  <Switch
                    id="ativo"
                    checked={ativo}
                    onCheckedChange={setAtivo}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg col-span-2">
                  <div>
                    <Label htmlFor="transferivel" className="cursor-pointer">
                      Disponível para Transferência
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Permite que o atleta seja transferido para outra equipe
                    </p>
                  </div>
                  <Switch
                    id="transferivel"
                    checked={transferivel}
                    onCheckedChange={setTransferivel}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="saude" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipoSanguineo">Tipo Sanguíneo</Label>
                  <Select value={tipoSanguineo} onValueChange={setTipoSanguineo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="alergias">Alergias</Label>
                  <Textarea
                    id="alergias"
                    value={alergias}
                    onChange={(e) => setAlergias(e.target.value)}
                    rows={2}
                    placeholder="Descreva alergias conhecidas"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="medicamentos">Medicamentos em Uso</Label>
                  <Textarea
                    id="medicamentos"
                    value={medicamentos}
                    onChange={(e) => setMedicamentos(e.target.value)}
                    rows={2}
                    placeholder="Liste medicamentos de uso contínuo"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="necessidadesEspeciais">Necessidades Especiais</Label>
                  <Textarea
                    id="necessidadesEspeciais"
                    value={necessidadesEspeciais}
                    onChange={(e) => setNecessidadesEspeciais(e.target.value)}
                    rows={3}
                    placeholder="Descreva necessidades especiais ou cuidados médicos"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="responsavel" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Preencha caso o atleta seja menor de idade
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nomeResponsavel">Nome do Responsável</Label>
                  <Input
                    id="nomeResponsavel"
                    value={nomeResponsavel}
                    onChange={(e) => setNomeResponsavel(e.target.value)}
                    placeholder="Nome completo"
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
                  <Label htmlFor="parentesco">Parentesco</Label>
                  <Input
                    id="parentesco"
                    value={parentescoResponsavel}
                    onChange={(e) => setParentescoResponsavel(e.target.value)}
                    placeholder="Ex: Pai, Mãe, Tutor"
                  />
                </div>

                <div className="col-span-2">
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

            <TabsContent value="historico" className="space-y-4 mt-4">
              <div>
                <Label>Clubes Anteriores</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={novoClube}
                    onChange={(e) => setNovoClube(e.target.value)}
                    placeholder="Nome do clube"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), adicionarClube())}
                  />
                  <Button type="button" onClick={adicionarClube} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {clubesAnteriores.map((clube) => (
                    <Badge key={clube} variant="secondary" className="gap-1">
                      {clube}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removerClube(clube)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Redes Sociais</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                    <Input
                      id="instagram"
                      value={redesSociais.instagram}
                      onChange={(e) => setRedesSociais({ ...redesSociais, instagram: e.target.value })}
                      placeholder="@usuario"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook" className="text-sm">Facebook</Label>
                    <Input
                      id="facebook"
                      value={redesSociais.facebook}
                      onChange={(e) => setRedesSociais({ ...redesSociais, facebook: e.target.value })}
                      placeholder="facebook.com/usuario"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter" className="text-sm">Twitter/X</Label>
                    <Input
                      id="twitter"
                      value={redesSociais.twitter}
                      onChange={(e) => setRedesSociais({ ...redesSociais, twitter: e.target.value })}
                      placeholder="@usuario"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tiktok" className="text-sm">TikTok</Label>
                    <Input
                      id="tiktok"
                      value={redesSociais.tiktok}
                      onChange={(e) => setRedesSociais({ ...redesSociais, tiktok: e.target.value })}
                      placeholder="@usuario"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="extras" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="observacoes">Observações Gerais</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={6}
                  placeholder="Informações adicionais sobre o atleta..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? "Salvando..." : atleta ? "Atualizar" : "Cadastrar Atleta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}