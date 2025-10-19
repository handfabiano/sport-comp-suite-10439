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
import { Plus, X, Save } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

interface EventoFormProps {
  evento?: any;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export default function EventoForm({ evento, onSuccess, trigger }: EventoFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Abrir dialog quando evento é passado para edição
  useEffect(() => {
    if (evento && trigger) {
      setOpen(true);
    }
  }, [evento, trigger]);
  
  // Dados básicos
  const [nome, setNome] = useState(evento?.nome || "");
  const [descricao, setDescricao] = useState(evento?.descricao || "");
  const [local, setLocal] = useState(evento?.local || "");
  const [modalidade, setModalidade] = useState(evento?.modalidade || "futebol");
  const [dataInicio, setDataInicio] = useState(evento?.data_inicio || "");
  const [dataFim, setDataFim] = useState(evento?.data_fim || "");
  const [status, setStatus] = useState(evento?.status || "inscricoes_abertas");
  
  // Configurações de competição
  const [tipoCompeticao, setTipoCompeticao] = useState(evento?.tipo_competicao || "eliminatorio");
  const [numeroFases, setNumeroFases] = useState(evento?.numero_fases || 1);
  const [pontosVitoria, setPontosVitoria] = useState(evento?.pontos_vitoria || 3);
  const [pontosEmpate, setPontosEmpate] = useState(evento?.pontos_empate || 1);
  const [pontosDerrota, setPontosDerrota] = useState(evento?.pontos_derrota || 0);
  
  // Inscrições
  const [aceitaInscricoesIndividuais, setAceitaInscricoesIndividuais] = useState(evento?.aceita_inscricoes_individuais ?? true);
  const [aceitaInscricoesEquipes, setAceitaInscricoesEquipes] = useState(evento?.aceita_inscricoes_equipes ?? true);
  const [valorInscricao, setValorInscricao] = useState(evento?.valor_inscricao || "");
  const [limiteAtletasPorEquipe, setLimiteAtletasPorEquipe] = useState(evento?.limite_atletas_por_equipe || 20);
  const [limiteEquipesPorCategoria, setLimiteEquipesPorCategoria] = useState(evento?.limite_equipes_por_categoria || "");
  const [vagasPorCategoria, setVagasPorCategoria] = useState(evento?.vagas_por_categoria || 50);
  
  // Requisitos
  const [exigeDocumento, setExigeDocumento] = useState(evento?.exige_documento ?? true);
  const [exigeComprovantePagamento, setExigeComprovantePagamento] = useState(evento?.exige_comprovante_pagamento ?? false);
  const [permiteTransferencia, setPermiteTransferencia] = useState(evento?.permite_transferencia ?? false);
  
  // Categorias
  const [categorias, setCategorias] = useState<string[]>(evento?.categorias || []);
  const [novaCategoria, setNovaCategoria] = useState("");
  
  // Patrocinadores
  const [patrocinadores, setPatrocinadores] = useState<string[]>(evento?.patrocinadores || []);
  const [novoPatrocinador, setNovoPatrocinador] = useState("");
  
  // Banner
  const [bannerUrl, setBannerUrl] = useState(evento?.banner_url || "");
  
  // Contato e redes sociais
  const [contatoOrganizador, setContatoOrganizador] = useState(evento?.contato_organizador || "");
  const [redesSociais, setRedesSociais] = useState({
    instagram: evento?.redes_sociais?.instagram || "",
    facebook: evento?.redes_sociais?.facebook || "",
    twitter: evento?.redes_sociais?.twitter || "",
    youtube: evento?.redes_sociais?.youtube || "",
  });
  
  // Outros
  const [regrasEspecificas, setRegrasEspecificas] = useState(evento?.regras_especificas || "");
  const [observacoes, setObservacoes] = useState(evento?.observacoes || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const eventoData: any = {
        nome,
        descricao,
        local,
        modalidade,
        data_inicio: dataInicio,
        data_fim: dataFim,
        status,
        tipo_competicao: tipoCompeticao,
        numero_fases: numeroFases,
        pontos_vitoria: pontosVitoria,
        pontos_empate: pontosEmpate,
        pontos_derrota: pontosDerrota,
        aceita_inscricoes_individuais: aceitaInscricoesIndividuais,
        aceita_inscricoes_equipes: aceitaInscricoesEquipes,
        valor_inscricao: valorInscricao ? parseFloat(valorInscricao) : null,
        limite_atletas_por_equipe: limiteAtletasPorEquipe,
        limite_equipes_por_categoria: limiteEquipesPorCategoria ? parseInt(limiteEquipesPorCategoria) : null,
        vagas_por_categoria: vagasPorCategoria,
        exige_documento: exigeDocumento,
        exige_comprovante_pagamento: exigeComprovantePagamento,
        permite_transferencia: permiteTransferencia,
        categorias,
        patrocinadores,
        banner_url: bannerUrl || null,
        contato_organizador: contatoOrganizador,
        redes_sociais: redesSociais,
        regras_especificas: regrasEspecificas,
        observacoes,
      };

      if (!evento) {
        eventoData.organizador_id = user.id;
      }

      if (evento) {
        const { error } = await supabase
          .from("eventos")
          .update(eventoData)
          .eq("id", evento.id);
        if (error) throw error;
        toast.success("Evento atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("eventos")
          .insert([eventoData]);
        if (error) throw error;
        toast.success("Evento criado com sucesso!");
      }

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const adicionarCategoria = () => {
    if (novaCategoria && !categorias.includes(novaCategoria)) {
      setCategorias([...categorias, novaCategoria]);
      setNovaCategoria("");
    }
  };

  const removerCategoria = (cat: string) => {
    setCategorias(categorias.filter(c => c !== cat));
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
            {evento ? "Editar Evento" : "Novo Evento"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {evento ? "Editar Evento" : "Criar Novo Evento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basico">Básico</TabsTrigger>
              <TabsTrigger value="competicao">Competição</TabsTrigger>
              <TabsTrigger value="inscricoes">Inscrições</TabsTrigger>
              <TabsTrigger value="extras">Extras</TabsTrigger>
            </TabsList>

            <TabsContent value="basico" className="space-y-4 mt-4">
              <div className="mb-6">
                <ImageUpload
                  bucket="eventos"
                  currentImageUrl={bannerUrl}
                  onImageUploaded={setBannerUrl}
                  label="Banner do Evento"
                  maxSizeMB={10}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nome">Nome do Evento *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    placeholder="Ex: Campeonato Municipal de Futebol 2025"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={3}
                    placeholder="Descreva o evento..."
                  />
                </div>

                <div>
                  <Label htmlFor="modalidade">Modalidade *</Label>
                  <Select value={modalidade} onValueChange={setModalidade}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="futebol">Futebol</SelectItem>
                      <SelectItem value="futsal">Futsal</SelectItem>
                      <SelectItem value="volei">Vôlei</SelectItem>
                      <SelectItem value="basquete">Basquete</SelectItem>
                      <SelectItem value="handebol">Handebol</SelectItem>
                      <SelectItem value="tenis">Tênis</SelectItem>
                      <SelectItem value="natacao">Natação</SelectItem>
                      <SelectItem value="atletismo">Atletismo</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inscricoes_abertas">Inscrições Abertas</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="local">Local *</Label>
                  <Input
                    id="local"
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    required
                    placeholder="Ex: Estádio Municipal"
                  />
                </div>

                <div>
                  <Label htmlFor="contato">Contato do Organizador</Label>
                  <Input
                    id="contato"
                    value={contatoOrganizador}
                    onChange={(e) => setContatoOrganizador(e.target.value)}
                    placeholder="WhatsApp, Email, etc"
                  />
                </div>

                <div>
                  <Label htmlFor="dataInicio">Data de Início *</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dataFim">Data de Término *</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Categorias</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    placeholder="Ex: Sub-15, Feminino, Profissional"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), adicionarCategoria())}
                  />
                  <Button type="button" onClick={adicionarCategoria} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categorias.map((cat) => (
                    <Badge key={cat} variant="secondary" className="gap-1">
                      {cat}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removerCategoria(cat)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="competicao" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipoCompeticao">Tipo de Competição</Label>
                  <Select value={tipoCompeticao} onValueChange={setTipoCompeticao}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eliminatorio">Eliminatório Direto</SelectItem>
                      <SelectItem value="grupos">Fase de Grupos</SelectItem>
                      <SelectItem value="pontos_corridos">Pontos Corridos</SelectItem>
                      <SelectItem value="mata_mata">Mata-Mata</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="numeroFases">Número de Fases</Label>
                  <Input
                    id="numeroFases"
                    type="number"
                    min="1"
                    value={numeroFases}
                    onChange={(e) => setNumeroFases(parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="pontosVitoria">Pontos por Vitória</Label>
                  <Input
                    id="pontosVitoria"
                    type="number"
                    min="0"
                    value={pontosVitoria}
                    onChange={(e) => setPontosVitoria(parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="pontosEmpate">Pontos por Empate</Label>
                  <Input
                    id="pontosEmpate"
                    type="number"
                    min="0"
                    value={pontosEmpate}
                    onChange={(e) => setPontosEmpate(parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="pontosDerrota">Pontos por Derrota</Label>
                  <Input
                    id="pontosDerrota"
                    type="number"
                    min="0"
                    value={pontosDerrota}
                    onChange={(e) => setPontosDerrota(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label>Regras Específicas</Label>
                <Textarea
                  value={regrasEspecificas}
                  onChange={(e) => setRegrasEspecificas(e.target.value)}
                  rows={4}
                  placeholder="Descreva regras específicas do torneio..."
                />
              </div>
            </TabsContent>

            <TabsContent value="inscricoes" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <Label htmlFor="inscricoesIndividuais" className="cursor-pointer">
                    Aceitar Inscrições Individuais
                  </Label>
                  <Switch
                    id="inscricoesIndividuais"
                    checked={aceitaInscricoesIndividuais}
                    onCheckedChange={setAceitaInscricoesIndividuais}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <Label htmlFor="inscricoesEquipes" className="cursor-pointer">
                    Aceitar Inscrições de Equipes
                  </Label>
                  <Switch
                    id="inscricoesEquipes"
                    checked={aceitaInscricoesEquipes}
                    onCheckedChange={setAceitaInscricoesEquipes}
                  />
                </div>

                <div>
                  <Label htmlFor="valorInscricao">Valor da Inscrição (R$)</Label>
                  <Input
                    id="valorInscricao"
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorInscricao}
                    onChange={(e) => setValorInscricao(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="vagasPorCategoria">Vagas por Categoria</Label>
                  <Input
                    id="vagasPorCategoria"
                    type="number"
                    min="1"
                    value={vagasPorCategoria}
                    onChange={(e) => setVagasPorCategoria(parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="limiteAtletas">Limite de Atletas por Equipe</Label>
                  <Input
                    id="limiteAtletas"
                    type="number"
                    min="1"
                    value={limiteAtletasPorEquipe}
                    onChange={(e) => setLimiteAtletasPorEquipe(parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="limiteEquipes">Limite de Equipes por Categoria</Label>
                  <Input
                    id="limiteEquipes"
                    type="number"
                    min="1"
                    value={limiteEquipesPorCategoria}
                    onChange={(e) => setLimiteEquipesPorCategoria(e.target.value)}
                    placeholder="Sem limite"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <Label htmlFor="exigeDocumento" className="cursor-pointer">
                    Exigir Documento
                  </Label>
                  <Switch
                    id="exigeDocumento"
                    checked={exigeDocumento}
                    onCheckedChange={setExigeDocumento}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <Label htmlFor="exigeComprovante" className="cursor-pointer">
                    Exigir Comprovante de Pagamento
                  </Label>
                  <Switch
                    id="exigeComprovante"
                    checked={exigeComprovantePagamento}
                    onCheckedChange={setExigeComprovantePagamento}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg col-span-2">
                  <Label htmlFor="permiteTransferencia" className="cursor-pointer">
                    Permitir Transferência de Atletas
                  </Label>
                  <Switch
                    id="permiteTransferencia"
                    checked={permiteTransferencia}
                    onCheckedChange={setPermiteTransferencia}
                  />
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
                      placeholder="facebook.com/pagina"
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
                    <Label htmlFor="youtube" className="text-sm">YouTube</Label>
                    <Input
                      id="youtube"
                      value={redesSociais.youtube}
                      onChange={(e) => setRedesSociais({ ...redesSociais, youtube: e.target.value })}
                      placeholder="youtube.com/canal"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações Gerais</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={4}
                  placeholder="Informações adicionais sobre o evento..."
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
              {loading ? "Salvando..." : evento ? "Atualizar" : "Criar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}