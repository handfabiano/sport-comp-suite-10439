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
import { Plus, X, Save, Shirt } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

interface EquipeFormProps {
  equipe?: any;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export default function EquipeForm({ equipe, onSuccess, trigger }: EquipeFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]);
  
  // Abrir dialog quando equipe é passada para edição
  useEffect(() => {
    if (equipe && trigger) {
      setOpen(true);
    }
  }, [equipe, trigger]);
  
  // Dados básicos
  const [nome, setNome] = useState(equipe?.nome || "");
  const [eventoId, setEventoId] = useState(equipe?.evento_id || "");
  const [tecnico, setTecnico] = useState(equipe?.tecnico || "");
  const [modalidade, setModalidade] = useState(equipe?.modalidade || "futebol");
  const [categoria, setCategoria] = useState(equipe?.categoria || "");
  const [cidade, setCidade] = useState(equipe?.cidade || "");
  const [estadioCasa, setEstadioCasa] = useState(equipe?.estadio_casa || "");
  const [anoFundacao, setAnoFundacao] = useState(equipe?.ano_fundacao || "");
  
  // Uniforme
  const [uniformePrincipal, setUniformePrincipal] = useState({
    cor_primaria: equipe?.uniforme_principal?.cor_primaria || "",
    cor_secundaria: equipe?.uniforme_principal?.cor_secundaria || "",
    numero: equipe?.uniforme_principal?.numero || "",
  });
  const [uniformeAlternativo, setUniformeAlternativo] = useState({
    cor_primaria: equipe?.uniforme_alternativo?.cor_primaria || "",
    cor_secundaria: equipe?.uniforme_alternativo?.cor_secundaria || "",
    numero: equipe?.uniforme_alternativo?.numero || "",
  });
  
  // Configurações
  const [limiteAtletas, setLimiteAtletas] = useState(equipe?.limite_atletas || "");
  const [permiteInscricaoAberta, setPermiteInscricaoAberta] = useState(equipe?.permite_inscricao_aberta ?? false);
  const [ativa, setAtiva] = useState(equipe?.ativa ?? true);
  
  // Contatos
  const [contatoTecnico, setContatoTecnico] = useState(equipe?.contato_tecnico || "");
  const [contatoResponsavel, setContatoResponsavel] = useState(equipe?.contato_responsavel || "");
  
  // Patrocinadores
  const [patrocinadores, setPatrocinadores] = useState<string[]>(equipe?.patrocinadores || []);
  const [novoPatrocinador, setNovoPatrocinador] = useState("");
  
  // Logo
  const [logoUrl, setLogoUrl] = useState(equipe?.logo_url || "");
  
  // Redes sociais
  const [redesSociais, setRedesSociais] = useState({
    instagram: equipe?.redes_sociais?.instagram || "",
    facebook: equipe?.redes_sociais?.facebook || "",
    twitter: equipe?.redes_sociais?.twitter || "",
    tiktok: equipe?.redes_sociais?.tiktok || "",
  });
  
  // Outros
  const [observacoes, setObservacoes] = useState(equipe?.observacoes || "");

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    const { data } = await supabase
      .from("eventos")
      .select("id, nome, categorias")
      .eq("status", "inscricoes_abertas")
      .order("data_inicio", { ascending: false });
    
    if (data) setEventos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const equipeData: any = {
        nome,
        evento_id: eventoId,
        tecnico,
        modalidade,
        categoria,
        cidade,
        estadio_casa: estadioCasa,
        ano_fundacao: anoFundacao ? parseInt(anoFundacao) : null,
        uniforme_principal: uniformePrincipal,
        uniforme_alternativo: uniformeAlternativo,
        limite_atletas: limiteAtletas ? parseInt(limiteAtletas) : null,
        permite_inscricao_aberta: permiteInscricaoAberta,
        ativa,
        contato_tecnico: contatoTecnico,
        contato_responsavel: contatoResponsavel,
        logo_url: logoUrl || null,
        patrocinadores,
        redes_sociais: redesSociais,
        observacoes,
      };

      if (equipe) {
        const { error } = await supabase
          .from("equipes")
          .update(equipeData)
          .eq("id", equipe.id);
        if (error) throw error;
        toast.success("Equipe atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("equipes")
          .insert([equipeData]);
        if (error) throw error;
        toast.success("Equipe criada com sucesso!");
      }

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const adicionarPatrocinador = () => {
    if (novoPatrocinador && !patrocinadores.includes(novoPatrocinador)) {
      setPatrocinadores([...patrocinadores, novoPatrocinador]);
      setNovoPatrocinador("");
    }
  };

  const removerPatrocinador = (pat: string) => {
    setPatrocinadores(patrocinadores.filter(p => p !== pat));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {equipe ? "Editar Equipe" : "Nova Equipe"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {equipe ? "Editar Equipe" : "Criar Nova Equipe"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basico">Básico</TabsTrigger>
              <TabsTrigger value="uniformes">Uniformes</TabsTrigger>
              <TabsTrigger value="contatos">Contatos</TabsTrigger>
              <TabsTrigger value="extras">Extras</TabsTrigger>
            </TabsList>

            <TabsContent value="basico" className="space-y-4 mt-4">
              <div className="mb-6">
                <ImageUpload
                  bucket="equipes"
                  currentImageUrl={logoUrl}
                  onImageUploaded={setLogoUrl}
                  label="Logo da Equipe"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  maxSizeMB={5}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nome">Nome da Equipe *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    placeholder="Ex: Flamengo, Barcelona FC"
                  />
                </div>

                <div>
                  <Label htmlFor="evento">Evento *</Label>
                  <Select value={eventoId} onValueChange={setEventoId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o evento" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {eventos.map((evt) => (
                        <SelectItem key={evt.id} value={evt.id}>
                          {evt.nome}
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
                  <Label htmlFor="modalidade">Modalidade *</Label>
                  <Select value={modalidade} onValueChange={setModalidade}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="futebol">Futebol</SelectItem>
                      <SelectItem value="futsal">Futsal</SelectItem>
                      <SelectItem value="volei">Vôlei</SelectItem>
                      <SelectItem value="basquete">Basquete</SelectItem>
                      <SelectItem value="handebol">Handebol</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tecnico">Técnico</Label>
                  <Input
                    id="tecnico"
                    value={tecnico}
                    onChange={(e) => setTecnico(e.target.value)}
                    placeholder="Nome do técnico"
                  />
                </div>

                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Cidade da equipe"
                  />
                </div>

                <div>
                  <Label htmlFor="estadioCasa">Estádio/Local Casa</Label>
                  <Input
                    id="estadioCasa"
                    value={estadioCasa}
                    onChange={(e) => setEstadioCasa(e.target.value)}
                    placeholder="Nome do estádio ou local"
                  />
                </div>

                <div>
                  <Label htmlFor="anoFundacao">Ano de Fundação</Label>
                  <Input
                    id="anoFundacao"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={anoFundacao}
                    onChange={(e) => setAnoFundacao(e.target.value)}
                    placeholder="Ex: 2010"
                  />
                </div>

                <div>
                  <Label htmlFor="limiteAtletas">Limite de Atletas</Label>
                  <Input
                    id="limiteAtletas"
                    type="number"
                    min="1"
                    value={limiteAtletas}
                    onChange={(e) => setLimiteAtletas(e.target.value)}
                    placeholder="Ex: 30"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <Label htmlFor="ativa" className="cursor-pointer">
                    Equipe Ativa
                  </Label>
                  <Switch
                    id="ativa"
                    checked={ativa}
                    onCheckedChange={setAtiva}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <Label htmlFor="inscricaoAberta" className="cursor-pointer">
                    Permitir Inscrição Aberta de Atletas
                  </Label>
                  <Switch
                    id="inscricaoAberta"
                    checked={permiteInscricaoAberta}
                    onCheckedChange={setPermiteInscricaoAberta}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="uniformes" className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Shirt className="h-5 w-5" />
                  <span>Uniforme Principal</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="unifPrincipalPrimaria">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="unifPrincipalPrimaria"
                        type="color"
                        value={uniformePrincipal.cor_primaria}
                        onChange={(e) => setUniformePrincipal({...uniformePrincipal, cor_primaria: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={uniformePrincipal.cor_primaria}
                        onChange={(e) => setUniformePrincipal({...uniformePrincipal, cor_primaria: e.target.value})}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="unifPrincipalSecundaria">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="unifPrincipalSecundaria"
                        type="color"
                        value={uniformePrincipal.cor_secundaria}
                        onChange={(e) => setUniformePrincipal({...uniformePrincipal, cor_secundaria: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={uniformePrincipal.cor_secundaria}
                        onChange={(e) => setUniformePrincipal({...uniformePrincipal, cor_secundaria: e.target.value})}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="unifPrincipalNumero">Cor dos Números</Label>
                    <div className="flex gap-2">
                      <Input
                        id="unifPrincipalNumero"
                        type="color"
                        value={uniformePrincipal.numero}
                        onChange={(e) => setUniformePrincipal({...uniformePrincipal, numero: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={uniformePrincipal.numero}
                        onChange={(e) => setUniformePrincipal({...uniformePrincipal, numero: e.target.value})}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Shirt className="h-5 w-5" />
                  <span>Uniforme Alternativo</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="unifAltPrimaria">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="unifAltPrimaria"
                        type="color"
                        value={uniformeAlternativo.cor_primaria}
                        onChange={(e) => setUniformeAlternativo({...uniformeAlternativo, cor_primaria: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={uniformeAlternativo.cor_primaria}
                        onChange={(e) => setUniformeAlternativo({...uniformeAlternativo, cor_primaria: e.target.value})}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="unifAltSecundaria">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="unifAltSecundaria"
                        type="color"
                        value={uniformeAlternativo.cor_secundaria}
                        onChange={(e) => setUniformeAlternativo({...uniformeAlternativo, cor_secundaria: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={uniformeAlternativo.cor_secundaria}
                        onChange={(e) => setUniformeAlternativo({...uniformeAlternativo, cor_secundaria: e.target.value})}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="unifAltNumero">Cor dos Números</Label>
                    <div className="flex gap-2">
                      <Input
                        id="unifAltNumero"
                        type="color"
                        value={uniformeAlternativo.numero}
                        onChange={(e) => setUniformeAlternativo({...uniformeAlternativo, numero: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={uniformeAlternativo.numero}
                        onChange={(e) => setUniformeAlternativo({...uniformeAlternativo, numero: e.target.value})}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contatos" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contatoTecnico">Contato do Técnico</Label>
                  <Input
                    id="contatoTecnico"
                    value={contatoTecnico}
                    onChange={(e) => setContatoTecnico(e.target.value)}
                    placeholder="WhatsApp, telefone"
                  />
                </div>

                <div>
                  <Label htmlFor="contatoResponsavel">Contato do Responsável</Label>
                  <Input
                    id="contatoResponsavel"
                    value={contatoResponsavel}
                    onChange={(e) => setContatoResponsavel(e.target.value)}
                    placeholder="WhatsApp, telefone"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Redes Sociais da Equipe</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                    <Input
                      id="instagram"
                      value={redesSociais.instagram}
                      onChange={(e) => setRedesSociais({ ...redesSociais, instagram: e.target.value })}
                      placeholder="@equipe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook" className="text-sm">Facebook</Label>
                    <Input
                      id="facebook"
                      value={redesSociais.facebook}
                      onChange={(e) => setRedesSociais({ ...redesSociais, facebook: e.target.value })}
                      placeholder="facebook.com/equipe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter" className="text-sm">Twitter/X</Label>
                    <Input
                      id="twitter"
                      value={redesSociais.twitter}
                      onChange={(e) => setRedesSociais({ ...redesSociais, twitter: e.target.value })}
                      placeholder="@equipe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tiktok" className="text-sm">TikTok</Label>
                    <Input
                      id="tiktok"
                      value={redesSociais.tiktok}
                      onChange={(e) => setRedesSociais({ ...redesSociais, tiktok: e.target.value })}
                      placeholder="@equipe"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="extras" className="space-y-4 mt-4">
              <div>
                <Label>Patrocinadores</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={novoPatrocinador}
                    onChange={(e) => setNovoPatrocinador(e.target.value)}
                    placeholder="Nome do patrocinador"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), adicionarPatrocinador())}
                  />
                  <Button type="button" onClick={adicionarPatrocinador} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patrocinadores.map((pat) => (
                    <Badge key={pat} variant="secondary" className="gap-1">
                      {pat}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removerPatrocinador(pat)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={5}
                  placeholder="Informações adicionais sobre a equipe..."
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
              {loading ? "Salvando..." : equipe ? "Atualizar" : "Criar Equipe"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}