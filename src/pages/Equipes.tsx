import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Users2, Users, MapPin, Trophy, Shirt, Phone, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import EquipeForm from "@/components/EquipeForm";
import FilterBar from "@/components/shared/FilterBar";

interface Equipe {
  id: string;
  nome: string;
  tecnico: string | null;
  modalidade: string;
  categoria: string;
  uniforme_cor: string | null;
  uniforme_principal?: any;
  cidade?: string;
  numero_atletas?: number;
  ativa?: boolean;
  contato_tecnico?: string;
  eventos?: { nome: string };
}

export default function Equipes() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [filteredEquipes, setFilteredEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingEquipe, setEditingEquipe] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchEquipes();
  }, []);

  useEffect(() => {
    const filtered = equipes.filter(equipe => 
      equipe.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipe.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipe.tecnico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipe.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEquipes(filtered);
    setCurrentPage(1);
  }, [searchTerm, equipes]);

  const fetchEquipes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipes")
      .select(`
        *,
        eventos (nome)
      `)
      .order("nome");

    if (!error && data) {
      setEquipes(data);
      setFilteredEquipes(data);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(filteredEquipes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEquipes = filteredEquipes.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from("equipes").delete().eq("id", deleteId);

    if (error) {
      toast.error("Erro ao excluir equipe: " + error.message);
      return;
    }

    toast.success("Equipe excluída com sucesso!");
    setDeleteId(null);
    fetchEquipes();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Equipes</h1>
          <p className="text-muted-foreground">
            Gerencie as equipes com configurações completas e personalizadas • {filteredEquipes.length} encontrada(s)
          </p>
        </div>
        <EquipeForm onSuccess={fetchEquipes} />
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar equipes por nome, técnico, categoria ou cidade..."
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : equipes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma equipe cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando sua primeira equipe
            </p>
            <EquipeForm onSuccess={fetchEquipes} />
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedEquipes.map((equipe) => (
            <Card key={equipe.id} className="overflow-hidden transition-all hover:shadow-lg group">
              <Link to={`/equipes/${equipe.id}`}>
              <div 
                className="h-2" 
                style={{ 
                  background: equipe.uniforme_principal?.cor_primaria 
                    ? `linear-gradient(90deg, ${equipe.uniforme_principal.cor_primaria}, ${equipe.uniforme_principal.cor_secundaria || equipe.uniforme_principal.cor_primaria})` 
                    : 'var(--gradient-primary)' 
                }}
              />
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {equipe.nome}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {equipe.modalidade}
                    </Badge>
                    {!equipe.ativa && (
                      <Badge variant="secondary">Inativa</Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {equipe.eventos?.nome}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4 flex-shrink-0" />
                  <span>Categoria: {equipe.categoria}</span>
                </div>

                {equipe.tecnico && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>Técnico: {equipe.tecnico}</span>
                  </div>
                )}

                {equipe.cidade && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{equipe.cidade}</span>
                  </div>
                )}

                {equipe.contato_tecnico && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{equipe.contato_tecnico}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  {equipe.uniforme_principal?.cor_primaria && (
                    <div className="flex items-center gap-2">
                      <Shirt className="h-4 w-4 text-muted-foreground" />
                      <div className="flex gap-1">
                        <div
                          className="w-6 h-6 rounded border shadow-sm"
                          style={{ backgroundColor: equipe.uniforme_principal.cor_primaria }}
                          title="Uniforme Principal"
                        />
                        {equipe.uniforme_principal.cor_secundaria && (
                          <div
                            className="w-6 h-6 rounded border shadow-sm"
                            style={{ backgroundColor: equipe.uniforme_principal.cor_secundaria }}
                            title="Cor Secundária"
                          />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {equipe.numero_atletas !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {equipe.numero_atletas} atletas
                    </Badge>
                  )}
                </div>
              </CardContent>
              </Link>
              <div className="flex gap-2 p-4 pt-0 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.preventDefault();
                    setEditingEquipe(equipe);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.preventDefault();
                    setDeleteId(equipe.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        </>
      )}

      {editingEquipe && (
        <EquipeForm
          equipe={editingEquipe}
          onSuccess={() => {
            setEditingEquipe(null);
            fetchEquipes();
          }}
          trigger={<div />}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta equipe? Esta ação não pode ser desfeita e todos os atletas vinculados ficarão sem equipe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
