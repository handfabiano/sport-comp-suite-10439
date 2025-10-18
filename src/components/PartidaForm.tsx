import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const partidaFormSchema = z.object({
  evento_id: z.string().min(1, "Selecione um evento"),
  categoria: z.string().min(1, "Selecione uma categoria"),
  fase: z.string().min(1, "Selecione uma fase"),
  equipe_a_id: z.string().min(1, "Selecione a equipe A"),
  equipe_b_id: z.string().min(1, "Selecione a equipe B"),
  data_partida: z.string().min(1, "Data e hora são obrigatórias"),
  local: z.string().min(1, "Local é obrigatório"),
  arbitro_id: z.string().optional(),
  observacoes: z.string().optional(),
});

type PartidaFormValues = z.infer<typeof partidaFormSchema>;

interface PartidaFormProps {
  partidaId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PartidaForm({ partidaId, onSuccess, onCancel }: PartidaFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]);
  const [equipes, setEquipes] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [selectedEvento, setSelectedEvento] = useState<string>("");

  const form = useForm<PartidaFormValues>({
    resolver: zodResolver(partidaFormSchema),
    defaultValues: {
      evento_id: "",
      categoria: "",
      fase: "Fase de Grupos",
      equipe_a_id: "",
      equipe_b_id: "",
      data_partida: "",
      local: "",
      arbitro_id: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    fetchEventos();
    if (partidaId) {
      fetchPartida();
    }
  }, [partidaId]);

  useEffect(() => {
    if (selectedEvento) {
      fetchEquipesPorEvento(selectedEvento);
      fetchCategoriasPorEvento(selectedEvento);
    }
  }, [selectedEvento]);

  const fetchEventos = async () => {
    const { data, error } = await supabase
      .from("eventos")
      .select("id, nome")
      .eq("status", "inscricoes_abertas")
      .order("data_inicio", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar eventos",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setEventos(data || []);
  };

  const fetchEquipesPorEvento = async (eventoId: string) => {
    const { data, error } = await supabase
      .from("equipes")
      .select("id, nome, categoria")
      .eq("evento_id", eventoId)
      .eq("ativa", true)
      .order("nome");

    if (error) {
      toast({
        title: "Erro ao carregar equipes",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setEquipes(data || []);
  };

  const fetchCategoriasPorEvento = async (eventoId: string) => {
    const { data, error } = await supabase
      .from("eventos")
      .select("categorias")
      .eq("id", eventoId)
      .single();

    if (error) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCategorias(data?.categorias || []);
  };

  const fetchPartida = async () => {
    if (!partidaId) return;

    const { data, error } = await supabase
      .from("partidas")
      .select("*")
      .eq("id", partidaId)
      .single();

    if (error) {
      toast({
        title: "Erro ao carregar partida",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setSelectedEvento(data.evento_id);
      form.reset({
        evento_id: data.evento_id,
        categoria: data.categoria,
        fase: data.fase,
        equipe_a_id: data.equipe_a_id,
        equipe_b_id: data.equipe_b_id,
        data_partida: new Date(data.data_partida).toISOString().slice(0, 16),
        local: data.local,
        arbitro_id: data.arbitro_id || "",
        observacoes: data.observacoes || "",
      });
    }
  };

  const onSubmit = async (values: PartidaFormValues) => {
    setLoading(true);

    try {
      const partidaData = {
        evento_id: values.evento_id,
        categoria: values.categoria,
        fase: values.fase,
        equipe_a_id: values.equipe_a_id,
        equipe_b_id: values.equipe_b_id,
        local: values.local,
        data_partida: new Date(values.data_partida).toISOString(),
        arbitro_id: values.arbitro_id || null,
        observacoes: values.observacoes || null,
      };

      if (partidaId) {
        const { error } = await supabase
          .from("partidas")
          .update(partidaData)
          .eq("id", partidaId);

        if (error) throw error;

        toast({
          title: "Partida atualizada",
          description: "A partida foi atualizada com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("partidas")
          .insert([partidaData]);

        if (error) throw error;

        toast({
          title: "Partida criada",
          description: "A partida foi criada com sucesso.",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar partida",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const equipesFiltradas = form.watch("categoria")
    ? equipes.filter((e) => e.categoria === form.watch("categoria"))
    : equipes;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="evento_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evento</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedEvento(value);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o evento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {eventos.map((evento) => (
                    <SelectItem key={evento.id} value={evento.id}>
                      {evento.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fase"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fase</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a fase" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Fase de Grupos">Fase de Grupos</SelectItem>
                  <SelectItem value="Oitavas">Oitavas de Final</SelectItem>
                  <SelectItem value="Quartas">Quartas de Final</SelectItem>
                  <SelectItem value="Semi-Final">Semi-Final</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                  <SelectItem value="Terceiro Lugar">Terceiro Lugar</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="equipe_a_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipe A</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {equipesFiltradas.map((equipe) => (
                      <SelectItem key={equipe.id} value={equipe.id}>
                        {equipe.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="equipe_b_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipe B</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {equipesFiltradas.map((equipe) => (
                      <SelectItem key={equipe.id} value={equipe.id}>
                        {equipe.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="data_partida"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data e Hora</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="local"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local</FormLabel>
              <FormControl>
                <Input placeholder="Nome do local da partida" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações adicionais sobre a partida"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {partidaId ? "Atualizar" : "Criar"} Partida
          </Button>
        </div>
      </form>
    </Form>
  );
}
