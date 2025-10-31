import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Users, Phone, Mail, MapPin, Calendar, Activity, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import AtletaForm from "@/components/AtletaForm";
import FilterBar from "@/components/shared/FilterBar";

interface Atleta {
  id: string;
  nome: string;
  documento: string;
  categoria: string;
  foto_url: string | null;
  numero_uniforme: number | null;
  posicao: string | null;
  email: string | null;
  telefone: string | null;
  data_nascimento: string | null;
  cidade: string | null;
  altura: number | null;
  peso: number | null;
  ativo: boolean | null;
}

export default function Atletas() {
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [filteredAtletas, setFilteredAtletas] = useState<Atleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingAtleta, setEditingAtleta] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchAtletas();
  }, []);

  useEffect(() => {
    const filtered = atletas.filter(atleta => 
      atleta.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atleta.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atleta.posicao?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAtletas(filtered);
    setCurrentPage(1);
  }, [searchTerm, atletas]);

  const fetchAtletas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("atletas")
      .select("*")
      .order("nome");

    if (!error && data) {
      setAtletas(data as any);
      setFilteredAtletas(data as any);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(filteredAtletas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAtletas = filteredAtletas.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from("atletas").delete().eq("id", deleteId);

    if (error) {
      toast.error("Erro ao excluir atleta: " + error.message);
      return;
    }

    toast.success("Atleta excluído com sucesso!");
    setDeleteId(null);
    fetchAtletas();
  };

  const calcularIdade = (dataNascimento: string | null) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Atletas</h1>
          <p className="text-muted-foreground">
            Cadastro completo e gerenciamento de atletas • {filteredAtletas.length} encontrado(s)
          </p>
        </div>
        <AtletaForm onSuccess={fetchAtletas} />
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar atletas por nome, categoria ou posição..."
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-muted" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : atletas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum atleta cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando atletas ao sistema
            </p>
            <AtletaForm onSuccess={fetchAtletas} />
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedAtletas.map((atleta) => {
            const idade = calcularIdade(atleta.data_nascimento);
            return (
              <Card key={atleta.id} className="overflow-hidden transition-all hover:shadow-lg group">
                <Link to={`/atletas/${atleta.id}`}>
                <div className="h-2 bg-gradient-primary" />
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Avatar className="h-20 w-20 ring-2 ring-primary/20 group-hover:ring-primary transition-all flex-shrink-0">
                      <AvatarImage src={atleta.foto_url || undefined} alt={atleta.nome} />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                        {atleta.nome.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3 min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors leading-tight">
                            {atleta.nome}
                          </h3>
                          {atleta.numero_uniforme && (
                            <Badge className="bg-gradient-primary flex-shrink-0">
                              #{atleta.numero_uniforme}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="text-xs">{atleta.categoria}</Badge>
                          {atleta.ativo === false && (
                            <Badge variant="secondary" className="text-xs">Inativo</Badge>
                          )}
                        </div>
                      </div>

                      {atleta.posicao && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Activity className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{atleta.posicao}</span>
                        </div>
                      )}


                      {idade !== null && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{idade} anos</span>
                        </div>
                      )}

                      {(atleta.altura || atleta.peso) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Activity className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {atleta.altura && `${atleta.altura}m`}
                            {atleta.altura && atleta.peso && " • "}
                            {atleta.peso && `${atleta.peso}kg`}
                          </span>
                        </div>
                      )}

                      {atleta.cidade && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{atleta.cidade}</span>
                        </div>
                      )}

                      {atleta.telefone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{atleta.telefone}</span>
                        </div>
                      )}

                      {atleta.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{atleta.email}</span>
                        </div>
                      )}
                    </div>
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
                      setEditingAtleta(atleta);
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
                      setDeleteId(atleta.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </Card>
            );
          })}
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

      {editingAtleta && (
        <AtletaForm
          atleta={editingAtleta}
          onSuccess={() => {
            setEditingAtleta(null);
            fetchAtletas();
          }}
          trigger={<div />}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este atleta? Esta ação não pode ser desfeita.
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
