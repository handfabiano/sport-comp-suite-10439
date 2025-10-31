import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import GerenciarCompeticoes from "@/components/admin/GerenciarCompeticoes";
import GerenciarEquipes from "@/components/admin/GerenciarEquipes";
import GerenciarAtletas from "@/components/admin/GerenciarAtletas";
import GerenciarInscricoes from "@/components/admin/GerenciarInscricoes";
import GerenciarResponsaveis from "@/components/admin/GerenciarResponsaveis";
export default function Relacoes() {
  const [activeTab, setActiveTab] = useState("visao-geral");

  return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gerenciamento de Relações</h1>
          <p className="text-muted-foreground">
            Administre todas as relações entre organizadores, competições, equipes, responsáveis e atletas
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="competicoes">Competições</TabsTrigger>
            <TabsTrigger value="equipes">Equipes</TabsTrigger>
            <TabsTrigger value="atletas">Atletas</TabsTrigger>
            <TabsTrigger value="inscricoes">Inscrições</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Visão Geral do Sistema</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4">
                  <h3 className="font-semibold text-sm text-muted-foreground">Competições Ativas</h3>
                  <p className="text-3xl font-bold mt-2">0</p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold text-sm text-muted-foreground">Equipes Cadastradas</h3>
                  <p className="text-3xl font-bold mt-2">0</p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold text-sm text-muted-foreground">Atletas Ativos</h3>
                  <p className="text-3xl font-bold mt-2">0</p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold text-sm text-muted-foreground">Inscrições Pendentes</h3>
                  <p className="text-3xl font-bold mt-2">0</p>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="competicoes">
            <GerenciarCompeticoes />
          </TabsContent>

          <TabsContent value="equipes">
            <GerenciarEquipes />
          </TabsContent>

          <TabsContent value="atletas">
            <GerenciarAtletas />
          </TabsContent>

          <TabsContent value="inscricoes">
            <GerenciarInscricoes />
          </TabsContent>
        </Tabs>
      </div>
  );
}
